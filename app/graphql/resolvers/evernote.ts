import Evernote from 'evernote';
import { PrismaContext } from '../context';
import { saveImages } from './image';
import { getSession } from 'next-auth/client';

import {
  createNotes,
  getEvernoteNotes,
  getEvernoteStore,
  incrementOffset,
  validateNotes,
} from './helpers/evernote';
import { ImportedNote, NoteMetaData } from '../../types/note';
import {
  METADATA_NOTE_SPEC,
  NOTE_FILTER,
  MAX_NOTES_LIMIT,
} from '../../constants/evernote';

// deprecated
export const downloadNotes = async (
  ctx: PrismaContext
): Promise<ImportedNote[]> => {
  const { req, prisma } = ctx;

  // fetch new note content from evernote
  const notes = await getEvernoteNotes(ctx)
    // minify and upload image data
    .then(async (data) => saveImages(data))
    // save note data to db
    .then(async (data) => createNotes(ctx, data))
    .catch((err) => {
      console.log(err);
      throw new Error(`An error occurred in downloadNotes: ${err}`);
    });

  // increment the notes offset in our session
  if (notes.length > 0) {
    await incrementOffset(req, prisma, notes.length);
  }
  return notes;
};

export const fetchNotesMeta = async (
  ctx: PrismaContext
): Promise<void> => {
  const { req, prisma } = ctx;
  const store = await getEvernoteStore(req);
  const session = await getSession({ req });
  const { noteImportOffset = 0 } = session?.user ?? {};
  // fetch new note content from evernote
  try {
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
        const notes = data.map((note) => ({
          evernoteGUID: `${note?.guid}`,
          title: `${note?.title?.trim()}`,
          // tagGuids
          // notebookGuid
          // attributes.source vs sourceURL
        }));
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
  } catch (err) {
    console.log(err);
    throw new Error(`An error occurred in downloadNotesMeta: ${err}`);
  }
};
