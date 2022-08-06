import { Container } from '../../types/container';

export const resolveToggleContainer = async (
  _root: unknown,
  args: unknown
): Promise<Container> => ({ ...args });

export const resolveToggleContainerIngredient = async (
  _root: unknown,
  args: unknown
): Promise<Container> => ({
  id: args.containerId,
  currentIngredientId: args.ingredientId,
});

export default {
  resolveToggleContainer,
  resolveToggleContainerIngredient,
};
