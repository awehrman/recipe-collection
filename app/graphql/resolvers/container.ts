import { Container } from '../../types/container';

export const resolveToggleContainer = async (
  _root: unknown,
  args: unknown,
): Promise<Container> => {
  const { id } = args;
  console.log('resolveToggleContainer', { _root, id });
  // just pass through the id so we can directly toggle the cache locally
  return { id };
};

export default {
  resolveToggleContainer,
};
