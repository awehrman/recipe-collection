import { gql } from '@apollo/client';

import { ALL_NOTE_FIELDS, NOTE_META_FIELDS } from '../fragments/note';

export const GET_NOTES_CONTENT_MUTATION = gql`
	mutation GET_NOTES_CONTENT_MUTATION {
		getNotesContent {
			error
			notes {
				...NoteFields
			}
		}
	}
	${ ALL_NOTE_FIELDS }
`;

export const GET_PARSED_NOTES_MUTATION = gql`
	mutation GET_PARSED_NOTES_MUTATION {
		getParsedNotes {
			error
			notes {
				id
				title
				isParsed
				ingredients  {
					id
					blockIndex
					isParsed
					lineIndex
					parsed {
						id
						index
						ingredient {
							id
							isValidated
							name
						}
						rule
						type
						value
					}
					reference
					rule
				}
				instructions {
					id
					blockIndex
					reference
				}
				source
				image
			}
		}
	}
`;

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

export const SAVE_RECIPES_MUTATION = gql`
	mutation SAVE_RECIPES_MUTATION {
		saveRecipes {
			error
		}
	}
`;

export default {
	GET_NOTES_CONTENT_MUTATION,
	GET_NOTES_METADATA_MUTATION,
};
