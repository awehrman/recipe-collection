import _ from 'lodash';
import { useQuery, useMutation } from '@apollo/client';

import { GET_ALL_NOTES_QUERY } from '../graphql/queries/note';
import {
  GET_NOTES_METADATA_MUTATION,
  GET_NOTES_CONTENT_MUTATION,
} from '../graphql/mutations/note';

import { Note } from '../types/note';

const sortByDateCreatedDesc = (a: Note, b: Note) =>
  +a?.createdAt < +b?.createdAt ? 1 : -1;

const DEFAULT_ARRAY_SIZE = 1; // TODO load this from env
const loadingSkeleton = new Array(DEFAULT_ARRAY_SIZE)
  .fill(null)
  .map((_empty, index) => ({
    id: index,
    evernoteGUID: `loading_${index}`,
    title: null,
    ingredients: [],
    instructions: [],
    __typename: 'Note',
  }));

const loadingIngredients = [
  { id: 1, blockIndex: 0, lineIndex: 0, reference: null, parsed: [], isParsed: false, __typeName: 'IngredientLine' },
  { id: 2, blockIndex: 1, lineIndex: 0, reference: null, parsed: [], isParsed: false, __typeName: 'IngredientLine' },
  { id: 3, blockIndex: 1, lineIndex: 1, reference: null, parsed: [], isParsed: false, __typeName: 'IngredientLine' },
];

const loadingInstructions = [
  { id: 1, blockIndex: 0, reference: null, __typeName: 'InstructionLine' },
  { id: 2, blockIndex: 1, reference: null, __typeName: 'InstructionLine' },
  { id: 3, blockIndex: 2, reference: null, __typeName: 'InstructionLine' },
];

const defaultLoadingStatus = {
  meta: false,
  content: false,
  saving: false,
};

const loadingContent = (notes) =>
  notes.map((note) => ({
    ...note,
    ingredients: loadingIngredients,
    instructions: loadingInstructions,
    __typename: 'Note',
  }));

function useNotes(status = defaultLoadingStatus, setStatus = _.noop) {
  const {
    data = {},
    loading,
    refetch,
  } = useQuery(GET_ALL_NOTES_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-only',
  });

  let notes: Note[] = data?.notes ?? [];
  notes = [...notes].sort(sortByDateCreatedDesc);

  const [getNotesContent] = useMutation(GET_NOTES_CONTENT_MUTATION, {
    update: (cache, { data: { getNotesContent } }) => {
      const newNotesFromResponse = getNotesContent?.notes ?? [];

      const data = {
        notes: _.flatMap([
          newNotesFromResponse,
        ]),
      };

      cache.writeQuery({
        query: GET_ALL_NOTES_QUERY,
        data,
      });

      const updatedStatus = { ...status };
      updatedStatus.content = false;
      setStatus(updatedStatus);
    },
  });

  const [getNotesMeta] = useMutation(GET_NOTES_METADATA_MUTATION, {
    optimisticResponse: {
      getNotesMeta: {
        error: null,
        notes: loadingSkeleton,
        __typename: 'StandardResponse',
      },
    },
    update: (cache, { data: { getNotesMeta } }) => {
      const isOptimisticResponse = _.some(getNotesMeta.notes, (note) =>
        _.includes(note.evernoteGUID, 'loading_')
      );

      const newNotesFromResponse = getNotesMeta?.notes ?? [];
      const existingNotes = cache.readQuery({
        query: GET_ALL_NOTES_QUERY,
      });

      const data = {
        notes: _.flatMap([
          newNotesFromResponse,
          ...existingNotes?.notes,
        ]),
      };

      // tack on skeletons
      if (!isOptimisticResponse) {
        data.notes = loadingContent(data.notes);
      }

      if (data.notes.length > 0) {
        cache.writeQuery({
          query: GET_ALL_NOTES_QUERY,
          data,
        });

        // kick off the next process
        if (!isOptimisticResponse) {
          // update status
          const updatedStatus = { ...status };
          updatedStatus.meta = false;
          updatedStatus.content = true;
          setStatus(updatedStatus);

          getNotesContent();
        }
      }
    },
  });

  function importNotes() {
    const updated = { ...status };
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
