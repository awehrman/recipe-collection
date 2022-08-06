import { Ingredient } from './ingredient';

export type Container = {
  id: string;
  count: number;
  currentIngredientId: string;
  ingredients: Ingredient[];
  isExpanded: boolean;
  name: string;
};
