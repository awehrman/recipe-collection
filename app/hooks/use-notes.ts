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
  { id: 4, blockIndex: 1, lineIndex: 2, reference: null, parsed: [], isParsed: false, __typeName: 'IngredientLine' },
  { id: 5, blockIndex: 2, lineIndex: 0, reference: null, parsed: [], isParsed: false, __typeName: 'IngredientLine' },
  { id: 6, blockIndex: 2, lineIndex: 1, reference: null, parsed: [], isParsed: false, __typeName: 'IngredientLine' },
  { id: 7, blockIndex: 2, lineIndex: 2, reference: null, parsed: [], isParsed: false, __typeName: 'IngredientLine' },
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

  console.log('%c use-notes', 'background: aqua; color: black;');

  const [getNotesContent] = useMutation(GET_NOTES_CONTENT_MUTATION, {
    update: (cache, { data: { getNotesContent } }) => {
      // const isOptimisticResponse = _.some(getNotesContent.notes, (note) =>
      //   _.some(note.instructions, (line) => line.reference === null)
      // );
      console.log(
        '%c getNotesContent update',
        'background: goldenrod; color: black;',
        // { isOptimisticResponse }
      );

      const newNotesFromResponse = getNotesContent?.notes ?? [];

      const data = {
        notes: _.flatMap([
          newNotesFromResponse,
        ]),
      };

      console.log(JSON.stringify(data.notes?.[0]?.ingredients?.[0], null, 2));

      console.log('%c content - meta writing cache', 'background: tomato; color: black;', data.notes);
      cache.writeQuery({
        query: GET_ALL_NOTES_QUERY,
        data,
      });

      const updatedStatus = { ...status };
      updatedStatus.content = false;
      console.log('disabling content status', { updatedStatus });
      setStatus(updatedStatus);

      // TODO kick off parsing process
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

      console.log(
        '%c getNotesMeta update',
        'background: coral; color: black;',
        { isOptimisticResponse }
      );

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

      // tack on skeletons
      if (!isOptimisticResponse) {
        console.log('loading skeletons...');
        data.notes = loadingContent(data.notes);
      }

      if (data.notes.length > 0) {
        console.log('%c meta writing cache', 'background: tomato; color: black;', data);
        cache.writeQuery({
          query: GET_ALL_NOTES_QUERY,
          data,
        });

        // const written = cache.readQuery({
        //   query: GET_ALL_NOTES_QUERY,
        // });

        // console.log('written', JSON.stringify(written?.notes?.[0]?.ingredients?.[0], null, 2));


        // kick off the next process
        if (!isOptimisticResponse) {
          // update status
          const updatedStatus = { ...status };
          updatedStatus.meta = false;
          updatedStatus.content = true;
          console.log('disabling meta status', { updatedStatus });
          setStatus(updatedStatus);
          console.log('calling getNotesContent');

          // const optimisticResponse = loadingContent(data.notes);

          getNotesContent();
          /* {
            optimisticResponse: {
              getNotesContent: {
                error: null,
                notes: optimisticResponse,
                __typename: 'StandardResponse',
              },
            },
          }
          */
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
