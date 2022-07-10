import { gql } from '@apollo/client';

export const GET_ALL_RECIPES_QUERY = gql`
  query GET_ALL_RECIPES_QUERY {
    recipes {
      id
      title
    }
  }
`;

export default {
  GET_ALL_RECIPES_QUERY,
};
