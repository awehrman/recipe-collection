import { gql } from '@apollo/client';

export const GET_ALL_NOTES_QUERY = gql`
  query GET_ALL_NOTES_QUERY {
    notes {
      id
      title
      evernoteGUID
      image
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
          type
          value
        }
        reference
      }
      instructions {
        id
        blockIndex
        reference
      }
    }
  }
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
