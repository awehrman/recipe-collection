import { gql } from '@apollo/client';
import { ALL_NOTE_FIELDS } from '../fragments/notes';
import { ALL_RECIPE_FIELDS } from '../fragments/recipes';

export const CONVERT_NOTES_MUTATION = gql`
	mutation CONVERT_NOTES_MUTATION {
		convertNotes {
			errors
			recipes {
				...RecipeFields
			}
		}
	}
	${ ALL_RECIPE_FIELDS }
`;

export const IMPORT_NOTES_MUTATION = gql`
	mutation IMPORT_NOTES_MUTATION {
		importNotes {
			errors
			notes {
				...NoteFields
			}
		}
	}
	${ ALL_NOTE_FIELDS }
`;

export const PARSE_NOTES_MUTATION = gql`
	mutation PARSE_NOTES_MUTATION {
		parseNotes {
			errors
			notes {
				...NoteFields
			}
		}
	}
	${ ALL_NOTE_FIELDS }
`;

export default {
	CONVERT_NOTES_MUTATION,
	IMPORT_NOTES_MUTATION,
	PARSE_NOTES_MUTATION,
};
