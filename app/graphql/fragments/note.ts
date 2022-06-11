
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
		# tags
		# categories
	}
`;

export default { ALL_NOTE_FIELDS };
