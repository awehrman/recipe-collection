
import { gql } from '@apollo/client';

export const ALL_NOTE_FIELDS = gql`
	fragment NoteFields on Note {
		id
		createdAt
		updatedAt
		evernoteGUID
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
		title
		source
		image
		content
		isParsed
		tags {
			id
			name
		}
		categories {
			id
			name
		}
	}
`;

export const NOTE_META_FIELDS = gql`
	fragment NoteMetaFields on Note {
		id
		evernoteGUID
		title
		source
		image
		tags {
			id
			name
		}
		categories {
			id
			name
		}
	}
`;

export default {
	ALL_NOTE_FIELDS,
	NOTE_META_FIELDS,
};
