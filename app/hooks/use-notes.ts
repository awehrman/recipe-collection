import _ from 'lodash';
import { useQuery, useMutation } from '@apollo/client';


import { GET_ALL_NOTES_QUERY } from '../graphql/queries/note';
import { GET_NOTES_METADATA_MUTATION, GET_NOTES_CONTENT_MUTATION } from '../graphql/mutations/note';

import { Note } from '../types/note';

const sortByDateCreatedDesc = (a: Note, b: Note) => (+a?.createdAt < +b?.createdAt) ? 1 : -1;

const DEFAULT_ARRAY_SIZE = 1; // TODO load this from env
const loadingSkeleton = new Array(DEFAULT_ARRAY_SIZE).fill(null).map((_empty, index) => ({
  id: index,
  evernoteGUID: `loading_${index}`,
  title: null,
  __typename: 'Note',
}));

const loadingIngredients = [
  { id: 'loading_1',  blockIndex: 0, lineIndex: 0, reference: null },
  { id: 'loading_2',  blockIndex: 1, lineIndex: 0, reference: null },
  { id: 'loading_3',  blockIndex: 1, lineIndex: 1, reference: null },
  { id: 'loading_4',  blockIndex: 1, lineIndex: 2, reference: null },
  { id: 'loading_5',  blockIndex: 2, lineIndex: 0, reference: null },
  { id: 'loading_6',  blockIndex: 2, lineIndex: 1, reference: null },
  { id: 'loading_7',  blockIndex: 2, lineIndex: 2, reference: null },
];

const loadingInstructions = [
  { id: 'loading_1',  lineIndex: 0, reference: null },
  { id: 'loading_2',  lineIndex: 1, reference: null },
  { id: 'loading_3',  lineIndex: 2, reference: null },
];

const defaultLoadingStatus = {
  meta: false,
  content: false,
  parsing: false,
  saving: false,
};

const loadingContent = (notes) =>
  notes.map((note) => ({
    ...note,
    ingredients: loadingIngredients,
    instructions: loadingInstructions,
  }));

function useNotes(status = defaultLoadingStatus, setStatus = _.noop) {
  const { data = {}, loading, refetch } = useQuery(GET_ALL_NOTES_QUERY, {
    fetchPolicy: 'cache-and-network'
  });

  let notes: Note[] = data?.notes ?? [];
  notes = [...notes].sort(sortByDateCreatedDesc);

  const [getNotesContent] = useMutation(GET_NOTES_CONTENT_MUTATION, {
    optimisticResponse: {
      getNotesContent: {
        error: null,
        notes: loadingContent(notes),
        __typename: 'StandardResponse',
      }
    },
    update: (cache, { data: { getNotesContent } }) => {
      console.log('update getNotesContent', { getNotesContent });
      const isOptimisticResponse =
        _.some(getNotesContent.notes, (note) => _.some(note.instructions, (line) => _.includes(line.id, 'loading_')));

      const newNotesFromResponse = getNotesContent?.notes ?? [];
      const existingNotes = cache.readQuery({
        query: GET_ALL_NOTES_QUERY,
      });

      const data = { notes: newNotesFromResponse };

      console.log(JSON.stringify(data.notes, null, 2));

      if (existingNotes && newNotesFromResponse) {
        cache.writeQuery({
          query: GET_ALL_NOTES_QUERY,
          data,
        });
      }

      if (!isOptimisticResponse) {
        const updatedStatus = {...status};
        updatedStatus.content = false;
        updatedStatus.parsed = true;
        setStatus(updatedStatus);

        // TODO kick off parsing process

      }
    }
  });

  const [getNotesMeta] = useMutation(GET_NOTES_METADATA_MUTATION, {
    optimisticResponse: {
      getNotesMeta: {
        error: null,
        notes: loadingSkeleton,
        __typename: 'StandardResponse',
      }
    },
    update: (cache, { data: { getNotesMeta } }) => {
      const isOptimisticResponse = _.some(getNotesMeta.notes, (note) => _.includes(note.evernoteGUID, 'loading_'));

      const newNotesFromResponse = getNotesMeta?.notes ?? [];
      const existingNotes = cache.readQuery({
        query: GET_ALL_NOTES_QUERY,
      });

      const data = {
        notes: _.flatMap([
          // we'll have to pick out the optimistic response here
          newNotesFromResponse,
          ...existingNotes?.notes,
        ]),
      };

      if (existingNotes && newNotesFromResponse) {
        cache.writeQuery({
          query: GET_ALL_NOTES_QUERY,
          data,
        });
      }

      // kick off the next process
      if (!isOptimisticResponse) {
        // update status
        const updatedStatus = {...status};
        updatedStatus.meta = false;
        updatedStatus.content = true;
        setStatus(updatedStatus);

        getNotesContent();
      }
    }
  });

  function importNotes() {
    const updated = {...status};
    updated.meta = true;
    setStatus(updated);
    getNotesMeta();
  }

  return {
    loading,
    notes,
    refetchNotes: refetch,
    importNotes,
  };
}

export default useNotes;
