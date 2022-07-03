import { gql } from '@apollo/client';
import { ALL_NOTE_FIELDS } from '../fragments/note';

export const GET_ALL_NOTES_QUERY = gql`
  query GET_ALL_NOTES_QUERY {
		notes {
			...NoteFields
		}
	}
	${ ALL_NOTE_FIELDS }
`;

export const GET_DASHBOARD_PARSING_QUERY = gql`
  query GET_DASHBOARD_PARSING_QUERY {
  	dashboardParsing {
			error
			parsingInstances {
				id
				reference
			}
			parsingErrors
			semanticErrors
			dataErrors
			instruction
			equipment
			baseRate
			adjustedRate
			parsingRate
			dataAccuracy
		}
  }
`;

export const GET_NOTES_COUNT_QUERY = gql`
  query GET_NOTES_COUNT_QUERY {
  	noteAggregate {
	  	count
			importDefault
		}
  }
`;

export default {
	GET_ALL_NOTES_QUERY,
	GET_DASHBOARD_PARSING_QUERY,
	GET_NOTES_COUNT_QUERY,
};
