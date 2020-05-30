import { GET_ALL_NOTES_QUERY } from '../../lib/apollo/queries/notes';

function useEvernote() {
	const remaining = 9999; // TEMP put this back at 0 and query this
	const bundleSize = 20;

	function convertNotes({ parseNotesMutation }) {
		console.log('convertNotes');
		parseNotesMutation({
			update: (cache, { data }) => {
				// TODO handle errors here
				// const { errors } = data?.parseNotes;

				console.log({ notes: data?.parseNotes?.notes });

				// update the cache with new notes data
				cache.writeQuery({
					query: GET_ALL_NOTES_QUERY,
					data: { notes: data?.parseNotes?.notes },
				});
			},
		});
	}

	function importNotes({ importMutation }) {
		importMutation({
			optimisticResponse: {
				__typename: 'Mutation',
				importNotes: {
					__typename: 'EvernoteResponse',
					errors: [],
					notes: new Array(bundleSize).fill(0).map((_, index) => ({
						__typename: 'Note',
						id: `-1_${ index }`,
						content: null,
						image: null,
						ingredients: [],
						instructions: [],
						source: null,
						title: 'Downloading Content...',
					})),
				},
			},
			update: (cache, { data }) => {
				// TODO handle errors here
				// const { errors } = data?.importNotes;

				// update the cache with new notes data
				const { notes } = cache.readQuery({ query: GET_ALL_NOTES_QUERY });
				cache.writeQuery({
					query: GET_ALL_NOTES_QUERY,
					data: { notes: notes.concat(data?.importNotes?.notes) },
				});
			},
		});
	}

	function saveRecipes({ saveMutation }) {
		console.log('saveRecipes');
		saveMutation({
			update: (cache, { data }) => {
				console.log({ data });
				const { errors } = data?.convertNotes;

				if (errors && !errors.length) {
					cache.writeQuery({
						query: GET_ALL_NOTES_QUERY,
						data: { notes: [] },
					});
				}
			},
		});
	}

	return {
		bundleSize,
		convertNotes,
		importNotes,
		remaining, // TODO query this
		saveRecipes,
	};
}

export default useEvernote;
