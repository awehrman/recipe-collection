import _ from 'lodash';
import { gql, useQuery, useMutation } from '@apollo/client';

import { GET_ALL_NOTES_QUERY } from '../graphql/queries/note';
import { GET_NOTES_METADATA_MUTATION } from '../graphql/mutations/note';

import { Note } from '../types/note';

const sortByDateCreatedDesc = (a: Note, b: Note) => (+a?.createdAt < +b?.createdAt) ? 1 : -1;

const fragment = gql`
  fragment NoteMeta on Note {
    id
    evernoteGUID
    title
  }
`;

const updateNoteCacheWithMeta = (notes, cache) => ({
  fields: {
    notes(existingNotes = []) {
      const newNotes = [];
      for (let i = 0; i < notes.length; i++) {
        const note = cache.writeFragment({
          data: notes[i],
          fragment
        });
        newNotes.push(note);
      }
      return [...existingNotes, ...newNotes];
    }
  }
});

function useNotes(onImportLoad = _.noop) {
  const { data, loading: loadingNotes, refetch } = useQuery(GET_ALL_NOTES_QUERY);
  let notes: Note[] = data?.notes ?? [];
  notes = [...notes].sort(sortByDateCreatedDesc);

  const [getNotesMeta, { data: meta }] = useMutation(GET_NOTES_METADATA_MUTATION, {
    update: () => {
      onImportLoad(false);
      refetch();
      // TODO then kick off the content download process
    }
  });

  function importNotes() {
    getNotesMeta();
  }

  console.log({ notes, meta });

  return {
    importNotes,
    loading: loadingNotes,
    notes,
    refetchNotes: refetch,
  };
}

export default useNotes;
