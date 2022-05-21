export type NotesProps = {
}

export type NotePageProps = {
  note: NoteProps
}

export type NoteProps = {
  id: string;
  createdAt?: string;
  updatedAt: string;
  evernoteGUID: string;
  title: string;
  source?: string;
  image?: string;
  content?: string;
  isParsed: boolean;
  // TODO tags/categories
}
