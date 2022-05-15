
import { gql } from '@apollo/client';

export const ALL_NOTE_FIELDS = gql`
	fragment NoteFields on Note {
		id
		content
		evernoteGUID
		image
		isParsed
		source
		title
	}
`;

export default { ALL_NOTE_FIELDS };
