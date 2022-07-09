
export type AlternateName = {
  name: string;
  ingredientId: number;
};

export type ExistingParsedSegment = {
  id: number;
  createdAt?: string | Date;
  index: number;
  ingredient?: Ingredient;
  rule: string;
  type: string;
  value: string;
  updatedAt?: string | Date;
};

export type Ingredient = {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  name: string;
  id?: number;
  plural?: string | null;
  isComposedIngredient?: boolean;
  isValidated?: boolean;
  alternateNames?: AlternateName[];
  properties?: Property[];
  parent?: Ingredient;
  relatedIngredients?: Ingredient[];
  substitutes?: Ingredient[];
  references?: IngredientLine[];
};

export type IngredientLine = {
  blockIndex: number;
  createdAt?: string | Date;
  id?: number;
  isParsed: boolean;
  lineIndex: number;
  noteId?: number;
  parsed?: ParsedSegment[];
  reference: string;
  rule?: string;
  updatedAt?: string | Date;
};

export type InstructionLine = {
  blockIndex: number;
  createdAt?: string | Date;
  id?: number;
  noteId?: number;
  reference: string;
  updatedAt?: string | Date;
};

export type ParsedSegment = {
  id?: number;
  createdAt?: string | Date;
  index: number;
  ingredient?: Ingredient;
  rule: string;
  type: string;
  value: string;
  updatedAt?: string | Date;
};

export enum Property {
  'MEAT',
  'POULTRY',
  'FISH',
  'DAIRY',
  'SOY',
  'GLUTEN',
};