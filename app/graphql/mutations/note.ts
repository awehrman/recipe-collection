import { gql } from '@apollo/client';

import { ALL_NOTE_FIELDS, NOTE_META_FIELDS } from '../fragments/note';
import { ALL_RECIPE_FIELDS } from '../fragments/recipe';

export const GET_NOTES_METADATA_MUTATION = gql`
mutation GET_NOTES_METADATA_MUTATION {
	getNotesMeta {
		error
		notes {
			...NoteMetaFields
		}
	}
}
${ NOTE_META_FIELDS }
`;

// deprecated
export const CONVERT_NOTES_MUTATION = gql`
	mutation CONVERT_NOTES_MUTATION {
		convertNotes {
			error
			recipes {
				...RecipeFields
			}
		}
	}
	${ ALL_RECIPE_FIELDS }
`;

// deprecated
export const IMPORT_NOTES_MUTATION = gql`
	mutation IMPORT_NOTES_MUTATION {
		importNotes {
			error
			notes {
				id
				content
				createdAt
				updatedAt
				evernoteGUID
				image
				isParsed
				source
				title
			}
		}
	}
`;

// deprecated
export const PARSE_NOTES_MUTATION = gql`
	mutation PARSE_NOTES_MUTATION {
		parseNotes {
			error
			notes {
				...NoteFields
			}
		}
	}
	${ ALL_NOTE_FIELDS }
`;

export const SAVE_RECIPES_MUTATION = gql`
	mutation SAVE_RECIPES_MUTATION {
		saveRecipes {
			error
		}
	}
`;

export default {
	CONVERT_NOTES_MUTATION,
	IMPORT_NOTES_MUTATION,
	PARSE_NOTES_MUTATION,
	SAVE_RECIPES_MUTATION
};
