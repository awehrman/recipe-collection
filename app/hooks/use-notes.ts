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
  // TODO tack on an importedAt field and sort by latest
  const { data, loading } = useQuery(GET_ALL_NOTES_QUERY);
  const notes: NoteProps[] = (data?.notes ?? []);

  return {
    notes,
    loading,
  };
}

export default useNotes;
