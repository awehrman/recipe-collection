import _ from 'lodash';
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client';


import { GET_ALL_NOTES_QUERY } from '../graphql/queries/note';
import { GET_NOTES_METADATA_MUTATION } from '../graphql/mutations/note';

import { Note } from '../types/note';

const sortByDateCreatedDesc = (a: Note, b: Note) => (+a?.createdAt < +b?.createdAt) ? 1 : -1;

const DEFAULT_ARRAY_SIZE = 5; // TODO load this from env
const loadingSkeleton = new Array(DEFAULT_ARRAY_SIZE).fill(null).map((_empty, index) => ({
  id: index,
  evernoteGUID: `loading_${index}`,
  title: null,
  __typename: 'Note',
}));

const fragment = gql`
  fragment NoteMeta on Note {
    id
    evernoteGUID
    title
  }
`;


const defaultLoadingStatus = {
  meta: false,
  content: false,
  parsing: false,
  saving: false,
};

function useNotes(status = defaultLoadingStatus, setStatus = _.noop) {
  const client = useApolloClient();
  console.log('USE NOTES', JSON.stringify(client?.cache?.data?.data, null, 2));
  const { data, loading: loadingNotes, refetch } = useQuery(GET_ALL_NOTES_QUERY);

  let notes: Note[] = data?.notes ?? [];
  notes = [...notes].sort(sortByDateCreatedDesc);

  function forceClear() {
    notes = [];
    refetch();
  }

  return {
    forceClear,
    loading: loadingNotes,
    notes,
    refetchNotes: refetch,
  };
}

export default useNotes;
