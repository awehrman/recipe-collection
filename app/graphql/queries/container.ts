import { gql } from '@apollo/client';

export const GET_ALL_CONTAINERS_QUERY = gql`
  query GET_ALL_CONTAINERS_QUERY($group: String, $view: String) {
    containers(group: $group, view: $view) {
      id
      name
      count
      currentIngredientId
      isExpanded
      ingredients {
        id
        name
        isValidated
        parent {
          id
          name
        }
      }
    }
  }
`;

export const GET_CONTAINER_QUERY = gql`
  query GET_CONTAINER_QUERY($id: ID) {
    container(id: $id) {
      id
      name
      count
      currentIngredientId
      isExpanded
      ingredients {
        id
        name
        isValidated
        parent {
          id
          name
        }
      }
    }
  }
`;

export default {
  GET_ALL_CONTAINERS_QUERY,
  GET_CONTAINER_QUERY,
};
