export type NotesProps = {
}

export type NotePageProps = {
  note: NoteProps
}

type InstructionLine = {
  id: string;
  createAt: string;
  updatedAt: string;
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
      id: string;
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
  id: string;
  createdAt: string;
  updatedAt: string;
  evernoteGUID: string;
  // ingredients?: IngredientLine[];
  instructions?: InstructionLine[];
  title: string;
  source?: string;
  image?: string;
  content?: string;
  isParsed: boolean;
  // TODO tags/categories
}
