
import { gql } from '@apollo/client';

export const ALL_NOTE_FIELDS = gql`
	fragment NoteFields on Note {
		id
		content
		ingredients {
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
		image
		isParsed
		source
		title
	}
`;

export default { ALL_NOTE_FIELDS };
