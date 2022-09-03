import _ from 'lodash';

export const localFields = (
  data: string,
  fieldName: string,
  edits: unknown,
  ingredient: unknown
): boolean => {
  // see if this string is used in any other form fields
  if (fieldName !== 'name') {
    const name = edits?.name ?? ingredient?.name ?? null;
    if (data === name) {
      // TODO should we also setError for name?
      return false;
    }
  }

  if (fieldName !== 'plural') {
    const plural = edits?.plural ?? ingredient?.plural ?? null;
    if (data === plural) {
      return false;
    }
  }
  
  if (fieldName !== 'alternateNames') {
    const matchesOnEdits = !!_.find(edits?.alternateNames, (n) => n.name === data);
    const matchesOnIngredient = !!_.find(ingredient?.alternateNames, (n) => n.name === data);
    if (matchesOnEdits || matchesOnIngredient) {
      return false;
    }
  }

  return true;
};
