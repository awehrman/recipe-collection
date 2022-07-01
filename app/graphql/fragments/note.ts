
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
					name
					plural
					alternateNames {
						name
					}
					properties
					parent {
						id
						name
					}
					relatedIngredients {
						id
						name
					}
					substitutes {
						id
						name
						# TODO properties
					}
					references {
						id
						reference
					}
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
		# tags
		# categories
	}
`;

export default { ALL_NOTE_FIELDS };
