import { useQuery, useMutation } from '@apollo/client';

import { GET_ALL_NOTES_QUERY } from '../graphql/queries/note';
import { PARSE_NOTES_MUTATION } from '../graphql/mutations/note';

import { Note } from '../types/note';

const sortByDateCreatedDesc = (a: Note, b: Note) => (+a?.createdAt < +b?.createdAt) ? 1 : -1;

function useNotes() {
  const { data, loading, refetch } = useQuery(GET_ALL_NOTES_QUERY);
  let notes: Note[] = (data?.notes ?? []);
  notes = [...notes].sort(sortByDateCreatedDesc)

  const [parseNotes] = useMutation(PARSE_NOTES_MUTATION, {
    update: () => refetch(),
  });

  return {
    notes,
    loading,
    parseNotes,
  };
}

export default useNotes;
