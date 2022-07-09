import Evernote from 'evernote';
import { getSession } from 'next-auth/client';
import { performance } from 'perf_hooks';

import {
  METADATA_NOTE_SPEC,
  MAX_NOTES_LIMIT,
  NOTE_FILTER,
  NOTE_SPEC,
} from '../../constants/evernote';
import { EvernoteNoteMeta } from '../../types/note';

import { PrismaContext } from '../context';

import { parseHTML } from './helpers/parse';
import { incrementOffset, validateNotes } from './helpers/note';
import { getEvernoteStore } from './helpers/evernote';
import { saveNote } from './helpers/note';
import { uploadImage } from './image';

export const fetchNotesMeta = async (
  ctx: PrismaContext
): Promise<EvernoteNoteMeta[]> => {
  const { req, prisma } = ctx;
  const store = await getEvernoteStore(req);
  const session = await getSession({ req });

  const { noteImportOffset = 0 } = session?.user ?? {};
  const evernoteGUIDs: string[] = [];

  // fetch new note content from evernote
  try {
    const t0 = performance.now();

    const downloadedCount: number = await store
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
        // TODO throw an error if we're lacking guids or titles
        const notes = data.map((note) => {
          if (note?.guid) {
            evernoteGUIDs.push(note.guid);
          }
          return {
            evernoteGUID: `${note?.guid}`,
            title: `${note?.title?.trim()}`,
            // tags: buildTags(note),
            // categories: buildCategories(note),
            source: `${note?.attributes?.sourceURL}`,
          };
        });

        const { count } = await prisma.note.createMany({
          data: notes,
        });
        return count;
      })
      .catch((err) => {
        throw new Error(`Could not fetch notes metadata. ${err}`);
      });

    // increment the notes offset in our session
    if (downloadedCount > 0) {
      await incrementOffset(req, prisma, downloadedCount);
    }

    const notes = await prisma.note.findMany({
      where: {
        evernoteGUID: { in: evernoteGUIDs },
      },
      select: {
        id: true,
        evernoteGUID: true,
        title: true,
      },
    });
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
      if (!imageBinary.length) {
        console.log('No image found!');
      }
      const image = await uploadImage(Buffer.from(imageBinary), { folder: 'recipes' })
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
