import { useQuery } from '@apollo/client';

import { GET_ALL_NOTES_QUERY } from '../graphql/queries/note';

type NoteProps = {
  id: string;
  createdAt: string;
  updatedAt: string;
  evernoteGUID: string;
  title: string;
  source?: string;
  image?: string;
  content?: string;
  isParsed: boolean;
}

function useNotes() {
  const { data, loading } = useQuery(GET_ALL_NOTES_QUERY);
  let notes: NoteProps[] = (data?.notes ?? []);
  notes = [...notes].sort((a: NoteProps, b: NoteProps) => (+a.createdAt < +b.createdAt) ? 1 : -1)
  return {
    notes,
    loading,
  };
}

export default useNotes;
