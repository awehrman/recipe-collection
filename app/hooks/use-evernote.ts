// @ts-nocheck
function useEvernote() {
  const bundleSize = 1;

  function importNotes(mutation) {
    mutation({
      optimisticResponse: {
        __typename: 'Mutation',
        importNotes: {
          __typename: 'EvernoteResponse',
          errors: [],
          notes: new Array(bundleSize).fill(0).map((_, index) => ({
            __typename: 'Note',
            id: `-1_${index}`,
            content: null,
            image: null,
            //ingredients: [],
            //instructions: [],
            source: null,
            title: null,
            isParsed: false,
          })),
        },
      },
      update: (cache, { data }) => {
        console.log('importNotes', { data });
        // const { errors } = data?.importNotes;

        // update the cache with new notes data
        // const { notes } = cache.readQuery({ query: GET_ALL_NOTES_QUERY });
        // cache.writeQuery({
        //   query: GET_ALL_NOTES_QUERY,
        //   data: { notes: notes.concat(data?.importNotes?.notes) },
        // });
      },
    });
  }

  return {
    meta: {
      bundleSize,
    },
    importNotes,
  };
}

export default useEvernote;
