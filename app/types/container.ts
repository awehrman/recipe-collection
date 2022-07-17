import { Ingredient } from './ingredient';

export type Container = {
  name: string;
  id: string;
  count: number;
  ingredients: Ingredient[];
};
