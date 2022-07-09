import { IngredientLine, InstructionLine } from './ingredient';
import { Category, Tag } from './recipe';

export type EvernoteNoteContent = {
  content?: string;
  evernoteGUID: string;
  image?: string | null;
};

export type EvernoteNoteMeta = {
  id?: number;
  categories: Category[];
  evernoteGUID: string;
  source: string | null;
  title: string;
  tags: Tag[];
};

export type Note = {
  content?: string;
  createdAt: string | Date;
  evernoteGUID: string;
  id?: number | null;
  image?: string | null;
  ingredients?: IngredientLine[];
  instructions?: InstructionLine[];
  isParsed?: boolean;
  source?: string | null;
  title: string;
  updatedAt?: string | Date;
};

export type NotesResponse = {
  notes?: Note[]
};

export type StatusProps = {
  meta: boolean;
  content: boolean;
  parsing: boolean;
  saving: boolean;
};
