import { PrismaContext } from '../context';
import { saveImages } from './image';
import { createNotes, getEvernoteNotes, incrementOffset } from './helpers/evernote';

import { ImportedNote } from '../../types/note';

export const downloadNotes = async (ctx: PrismaContext): Promise<ImportedNote[]> => {
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
