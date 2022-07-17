import { Ingredient } from './ingredient';

export type Container = {
  id: string;
  count: number;
  ingredients: Ingredient[];
  isExpanded: boolean;
  name: string;
};
