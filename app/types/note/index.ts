export type EvernoteNoteContent = {
  content: string;
  evernoteGUID: string;
  image: string | null; // ? buffer
};

export type EvernoteNoteMetaData = {
  // categories: Category[]; // ? or a pre-import version
  evernoteGUID: string;
  isParsed: boolean;
  source: string | null;
  title: string;
  // tags: Tag[]; // ? or a pre-import version
};

export type ImportedNote = {
  // categories: Category[]; // ? or a pre-import version
  content: string;
  evernoteGUID: string;
  image: string | null; // ? buffer?
  isParsed: boolean;
  source: string | null;
  // tags: Tag[]; // ? or a pre-import version
  title: string;
};

// TODO there's got to be a better way to include the Prisma Note type here
export type Note = {
  content: string;
  createdAt?: string;
  evernoteGUID: string;
  id: number;
  image?: string;
  // ingredients: IngredientLine[];
  instructions: InstructionLine[];
  isParsed: boolean;
  source?: string;
  title: string;
  updatedAt?: string;
};

export type NoteRelations = {
  // ingredients: IngredientLine[];
  instructions: InstructionLine[];
};

// TODO after you sort out your date types, you can
// drop this in favor of the type from PrismaClient
export type InstructionLine = {
  id: number;
  blockIndex: number;
  noteId: number;
};
