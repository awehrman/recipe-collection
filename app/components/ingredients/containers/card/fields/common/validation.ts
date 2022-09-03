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
  // TODO check alt Names
  return true;
};
