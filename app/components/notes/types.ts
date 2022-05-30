export type NotesProps = {
}

export type NotePageProps = {
  note: NoteProps
}

type InstructionLine = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  blockIndex: number;
  reference: string;
}

type IngredientLine = {
  blockIndex: number;
  isParsed?: boolean;
  lineIndex: number;
  parsed?: {
    index: number,
    ingredient: {
      id: number;
      isValidated: boolean;
      name: string;
    }
    rule: string;
    type: string;
    value: string;
  }
  reference: string
  rule?: string
}

export type NoteProps = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  evernoteGUID: string;
  ingredients?: IngredientLine[];
  instructions?: InstructionLine[];
  title: string;
  source?: string;
  image?: string;
  content?: string;
  isParsed: boolean;
  // TODO tags/categories
}
