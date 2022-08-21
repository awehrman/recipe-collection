import _ from 'lodash';
import { PrismaClient } from '@prisma/client';
import Evernote from 'evernote';
import { getSession } from 'next-auth/client';
import { performance } from 'perf_hooks';

import {
  METADATA_NOTE_SPEC,
  MAX_NOTES_LIMIT,
  NOTE_FILTER,
  NOTE_SPEC,
} from 'constants/evernote';
import { EvernoteNoteMeta } from 'types/note';

import { PrismaContext } from '../context';

import { parseHTML } from './helpers/parse';
import { incrementOffset, validateNotes } from './helpers/note';
import { getEvernoteStore } from './helpers/evernote';
import { saveNote } from './helpers/note';
import { uploadImage } from './image';

const buildCategories = async (
  noteId: number,
  notebookGUID: string,
  prisma: PrismaClient,
  store: Evernote.NoteStoreClient
): Promise<unknown> => {
  if (!notebookGUID) {
    return null;
  }

  // see if we have this notebookGUID locally
  const existing = await prisma.category.findMany({
    where: { evernoteGUID: notebookGUID },
    select: {
      id: true,
      name: true,
    },
  });

  if (existing?.length > 0) {
    return existing[0];
  }

  // fetch this info from evernote
  const notebook = await store
    .getNotebook(notebookGUID)
    .catch((err) => console.log({ err }));

  if (notebook) {
    try {
      const saved = await prisma.category.create({
        data: {
          name: notebook.name,
          evernoteGUID: notebook.guid,
          notes: { connect: [{ id: noteId }] },
        },
        select: {
          id: true,
          name: true,
          evernoteGUID: true,
        },
      });
      return saved;
    } catch (err) {
      console.log(err);
    }
  }
};

const buildTags = async (
  noteId: number,
  tagGUIDs: string[],
  prisma: PrismaClient,
  store: Evernote.NoteStoreClient
) => {
  if (!tagGUIDs?.length) {
    return null;
  }

  // see if we have this tagGUID locally
  const existing = await prisma.tag.findMany({
    where: { evernoteGUID: { in: tagGUIDs } },
    select: {
      id: true,
      name: true,
      evernoteGUID: true,
    },
  });

  const tags = await Promise.all(
    _.map(tagGUIDs, async (tagGUID) => {
      const existingTag = _.find(existing, ['evernoteGUID', tagGUID]);

      if (existingTag) {
        return {
          id: existingTag.id,
          name: existingTag.name,
        };
      }

      // look up the name from evernote
      const evernoteTag = await store
        .getTag(tagGUID)
        .catch((err) => console.log({ err }));

        // create the tag
      try {
        const saved = await prisma.tag.create({
          data: {
            name: evernoteTag.name,
            evernoteGUID: tagGUID,
            notes: { connect: [{ id: noteId }] },
          },
          select: {
            id: true,
            name: true,
          },
        });
        return saved;
      } catch (err) {
        console.log(err);
      }
    })
  );
  return tags;
};

const resolveCategoriesAndTagsHash = async (
  note: unknown,
  noteId: number,
  prisma: PrismaClient,
  store: Evernote.NoteStoreClient
): Promise<unknown> => {
  // TODO keep a hash in our session of current prisma categories and tags so that we can limit these calls
  const tags = await buildTags(noteId, note?.tagGuids ?? [], prisma, store);
  const categories = await buildCategories(
    noteId,
    note?.notebookGuid,
    prisma,
    store
  );

  return {
    categories,
    tags,
  };
};

export const fetchNotesMeta = async (
  ctx: PrismaContext
): Promise<EvernoteNoteMeta[]> => {
  const { req, prisma } = ctx;
  const store = await getEvernoteStore(req);
  const session = await getSession({ req });

  const { noteImportOffset = 0 } = session?.user ?? {};

  // fetch new note content from evernote
  try {
    const t0 = performance.now();

    const notes = await store
      .findNotesMetadata(
        NOTE_FILTER,
        noteImportOffset,
        MAX_NOTES_LIMIT,
        METADATA_NOTE_SPEC
      )
      // ensure that we haven't saved these as notes or recipes yet
      .then(async (meta: Evernote.NoteStore.NotesMetadataList) =>
        validateNotes(ctx, store, meta?.notes ?? [])
      )
      // write our metadata to our db
      .then(async (data) => {
        // prisma doesn't support a select statement on createMany
        const savedMeta = await prisma.$transaction(
          _.map(data, (note) =>
            prisma.note.create({
              data: {
                title: note.title,
                evernoteGUID: note.guid,
                source: note?.attributes?.sourceURL,
              },
              select: {
                id: true,
                title: true,
                source: true,
                evernoteGUID: true,
              },
            })
          )
        );

        const noteGUIDHash = {};
        await Promise.all(
          _.map(data, async (note) => {
            if (note?.guid !== undefined) {
              const noteMeta = _.find(savedMeta, ['evernoteGUID', note.guid]);
              const noteId = parseInt(noteMeta.id, 10);

              const relations = await resolveCategoriesAndTagsHash(
                note,
                noteId,
                prisma,
                store
              );
              noteGUIDHash[`${note.guid}`] = relations;
            }
          })
        );

        const notes = _.map(savedMeta, (note) => {
          const { categories, tags } = noteGUIDHash[note.evernoteGUID];
          const response = {
            ...note,
            image: null,
          };
          if (categories) {
            response.categories = categories;
          }
          if (tags?.length > 0) {
            response.tags = [...tags];
          }
          return response;
        });
        return notes;
      })
      .catch((err) => {
        throw new Error(`Could not fetch notes metadata. ${err}`);
      });

    // increment the notes offset in our session
    if (notes?.length > 0) {
      await incrementOffset(req, prisma, notes.length);
    }
    const t1 = performance.now();
    console.log(`[fetchNotesMeta] took ${(t1 - t0).toFixed(2)} milliseconds.`);
    return notes;
  } catch (err) {
    throw new Error(`An error occurred in fetchNotesMeta: ${err}`);
  }
};

export const fetchNotesContent = async (
  ctx: PrismaContext
): Promise<EvernoteNoteMeta[]> => {
  const { req, prisma } = ctx;
  const store = await getEvernoteStore(req); // TODO could we store this in session? i'd love to speed this up

  // fetch new note content from evernote
  try {
    const t0 = performance.now();
    // fetch the notes lacking content
    const notesSansContent = await prisma.note.findMany({
      where: { content: null },
      select: {
        id: true,
        evernoteGUID: true,
        image: true,
        source: true,
        title: true,
      },
    });

    const resolveContent = notesSansContent.map(async (noteMeta) => {
      const { content, resources } = await store.getNoteWithResultSpec(
        noteMeta.evernoteGUID,
        NOTE_SPEC
      );
      // save image
      const imageBinary = resources?.[0]?.data?.body ?? '';
      if (!imageBinary?.length) {
        console.log('No image found!');
      }
      const image = await uploadImage(Buffer.from(imageBinary), {
        folder: 'recipes',
      })
        .then((data) => data?.secure_url)
        .catch((err) => {
          throw err;
        });

      // parse note content
      const { ingredients, instructions } = parseHTML(`${content}`, noteMeta);

      const note = {
        ...noteMeta,
        content,
        image,
        ingredients,
        instructions,
      };

      // save new note info
      await saveNote(note, prisma);

      return note;
    });

    const notes = await Promise.all(resolveContent);

    const t1 = performance.now();
    console.log(
      `[fetchNotesContent] took ${(t1 - t0).toFixed(2)} milliseconds.`
    );
    return notes;
  } catch (err) {
    throw new Error(
      `An error occurred in fetchNotesContent: ${JSON.stringify(err, null, 2)}`
    );
  }
};
