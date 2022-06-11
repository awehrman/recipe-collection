export type EvernoteNoteContent = {
  content: string;
  evernoteGUID: string;
  image: string | null;
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
  id?: number;
  createdAt?: string | Date;
  // categories: Category[]; // ? or a pre-import version
  content: string;
  evernoteGUID: string;
  image: string | null;
  isParsed: boolean;
  source: string | null;
  // tags: Tag[]; // ? or a pre-import version
  title: string;
  updatedAt?: string | Date;
};

// TODO there's got to be a better way to include the Prisma Note type here
export type Note = {
  content: string;
  createdAt?: string | Date;
  evernoteGUID: string;
  id: number;
  image: string | null;
  ingredients: IngredientLine[];
  instructions: InstructionLine[];
  isParsed: boolean;
  source: string | null;
  title: string;
  updatedAt?: string | Date;
};

export type NoteRelations = {
  ingredients: IngredientLine[];
  instructions: InstructionLine[];
};

// TODO after you sort out your date types, you can
// drop this in favor of the type from PrismaClient
export type InstructionLine = {
  blockIndex: number;
  createdAt?: string | Date;
  id?: number;
  noteId?: number;
  reference: string;
  updatedAt?: string | Date;
};

export type IngredientLine = {
  blockIndex: number;
  createdAt?: string | Date;
  id?: number;
  isParsed: boolean;
  lineIndex: number;
  noteId?: number;
  reference: string;
  rule: string;
  updatedAt?: string | Date;
};
