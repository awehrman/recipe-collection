import { gql } from '@apollo/client';

export const GET_ALL_CONTAINERS_QUERY = gql`
  query GET_ALL_CONTAINERS_QUERY($group: String, $view: String) {
    containers(group: $group, view: $view) {
      id
      name
      count
      ingredients {
        id
        name
      }
    }
  }
`;

export default {
  GET_ALL_CONTAINERS_QUERY,
};
