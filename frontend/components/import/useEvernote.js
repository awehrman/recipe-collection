import { useReducer } from 'react';
import { reducer as notesReducer, actions } from '../../reducers/notes';

function useEvernote() {
	const initialState = () => ({
		notes: [],
		converted: [],
		remaining: 9999, // TEMP put this back at 0 and query this
		bundleSize: 1,
	});

	const [ values, dispatch ] = useReducer(notesReducer, initialState());
	console.log({ ...values });

	function convertNotes() {
		console.log('convertNotes');
	}

	function importNotes({ importMutation }) {
		console.log('importNotes');
		importMutation({
			optimisticResponse: {
				__typename: 'Mutation',
				importNotes: {
					__typename: 'EvernoteResponse',
					errors: [],
					notes: new Array(values.bundleSize).fill(0).map((_, index) => ({
						__typename: 'Note',
						id: `-1_${ index }`,
						content: null,
						title: 'Loading Note...',
						ingredients: [],
						instructions: [],
					})),
				},
			},
			update: (cache, { data }) => {
				const { errors, notes } = data?.importNotes || {};
				console.log({ errors, notes });
				// TODO handle errors here
				dispatch({
					type: actions.importNotes,
					payload: { data: { notes } },
				});
			},
		});
	}

	function saveRecipes() {
		console.log('saveRecipes');
	}

	return {
		convertNotes,
		importNotes,
		saveRecipes,
		...values,
	};
}

export default useEvernote;
