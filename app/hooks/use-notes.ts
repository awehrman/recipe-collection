import _ from 'lodash';
import { useQuery, useMutation } from '@apollo/client';

import { GET_ALL_NOTES_QUERY } from '../graphql/queries/note';
import {
  GET_NOTES_METADATA_MUTATION,
  GET_NOTES_CONTENT_MUTATION,
  GET_PARSED_NOTES_MUTATION,
  SAVE_RECIPES_MUTATION,
} from '../graphql/mutations/note';
import { MAX_NOTES_LIMIT } from '../constants/evernote';

import { Note } from '../types/note';

const sortByDateCreatedDesc = (a: Note, b: Note) =>
  +a?.createdAt < +b?.createdAt ? 1 : -1;

const loadingSkeleton = new Array(MAX_NOTES_LIMIT)
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
  {
    id: 1,
    blockIndex: 0,
    lineIndex: 0,
    reference: null,
    parsed: [],
    isParsed: false,
    __typeName: 'IngredientLine',
  },
  {
    id: 2,
    blockIndex: 1,
    lineIndex: 0,
    reference: null,
    parsed: [],
    isParsed: false,
    __typeName: 'IngredientLine',
  },
  {
    id: 3,
    blockIndex: 1,
    lineIndex: 1,
    reference: null,
    parsed: [],
    isParsed: false,
    __typeName: 'IngredientLine',
  },
];

const loadingInstructions = [
  { id: 1, blockIndex: 0, reference: null, __typeName: 'InstructionLine' },
  { id: 2, blockIndex: 1, reference: null, __typeName: 'InstructionLine' },
  { id: 3, blockIndex: 2, reference: null, __typeName: 'InstructionLine' },
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

  const [getParsedNotes] = useMutation(GET_PARSED_NOTES_MUTATION, {
    update: (cache, { data: { getParsedNotes } }) => {
      console.log('getParsedNotes - update');
      const parsedNotes = getParsedNotes?.notes ?? [];
      // ? i wonder why i'm not seeing existing here
      // const existingNotes = cache.readQuery({
      //   query: GET_ALL_NOTES_QUERY,
      // });

      console.log({ parsedNotes });
      if (parsedNotes.length) {
        const data = {
          notes: parsedNotes.map((note) => ({
            __typename: 'Note',
            ...note,
            ingredients: (note?.ingredients ?? []).map((line) => ({
              __typename: 'IngredientLine',
              ...line,
              parsed: (line?.parsed ?? []).map((parsed) => ({
                __typename: 'ParsedSegment',
                ...parsed,
              }))
            })),
            instructions: (note?.instructions ?? []).map((line) => ({
              __typename: 'InstructionLine',
              ...line,
            }))
          })),
        };
      }

      console.log({ data });
      cache.writeQuery({
        query: GET_ALL_NOTES_QUERY,
        data: { notes: parsedNotes },
      });

      const updatedStatus = { ...status };
      updatedStatus.parsing = false;
      setStatus(updatedStatus);
    },
  });

  const [getNotesContent] = useMutation(GET_NOTES_CONTENT_MUTATION, {
    update: (cache, { data: { getNotesContent } }) => {
      const newNotesFromResponse = getNotesContent?.notes ?? [];

      if (newNotesFromResponse.length) {
        const data = {
          notes: _.flatMap([newNotesFromResponse]),
        };

        cache.writeQuery({
          query: GET_ALL_NOTES_QUERY,
          data,
        });
      }

      const updatedStatus = { ...status };
      updatedStatus.content = false;
      updatedStatus.parsing = true;
      setStatus(updatedStatus);

      // kick off parsing process
      getParsedNotes();
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
        notes: _.flatMap([newNotesFromResponse, ...existingNotes?.notes]),
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

  const [saveRecipes] = useMutation(SAVE_RECIPES_MUTATION, {
    update: (cache) => {
      cache.writeQuery({
        query: GET_ALL_NOTES_QUERY,
        data: { notes: [] },
      });
    },
  });

  return {
    loading,
    notes,
    refetchNotes: refetch,
    importNotes,
    saveRecipes,
    getParsedNotes,
  };
}

export default useNotes;
