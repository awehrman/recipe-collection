import { gql } from '@apollo/client';

export const GET_ALL_INGREDIENTS_QUERY = gql`
  query GET_ALL_INGREDIENTS_QUERY {
    ingredients {
      id
      name
      isValidated
    }
  }
`;

export default {
  GET_ALL_INGREDIENTS_QUERY,
};
