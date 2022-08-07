import { gql } from '@apollo/client';

export const GET_ALL_INGREDIENTS_QUERY = gql`
  query GET_ALL_INGREDIENTS_QUERY {
    ingredients {
      id
      name
      isValidated
      properties
      parent {
        id
        name
      }
    }
  }
`;

export const GET_INGREDIENT_QUERY = gql`
  query GET_INGREDIENT_QUERY($id: ID) {
    ingredient(id: $id) {
      id
      name
      plural
      isComposedIngredient
      isValidated
      properties
      parent {
        id
        name
      }
      alternateNames {
        name
      }
      relatedIngredients {
        id
        name
        isValidated
      }
      substitutes {
        id
        name
        isValidated
      }
      references {
        id
        reference
      }
    }
  }
`;

export default {
  GET_ALL_INGREDIENTS_QUERY,
  GET_INGREDIENT_QUERY,
};
