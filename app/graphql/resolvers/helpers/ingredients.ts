import { Prisma, PrismaClient } from '@prisma/client';
import pluralize from 'pluralize';

import { IngredientLine } from '../../../types/ingredient';
import { buildParsedSegments } from './parsed-segments';

export const findIngredient = async (
  name: string,
  prisma: PrismaClient
): Promise<Prisma.IngredientCreateNestedOneWithoutParsedSegmentInput | null> => {
  const isSingular = pluralize.isSingular(name);
  let plural: string | null = isSingular ? pluralize.plural(name) : name;
  const singular = isSingular ? name : pluralize.singular(name);
  if (plural === singular) {
    plural = null;
  }
  const where = {
    OR: [
      { name: { equals: name } },
      { plural: { equals: name } },
      // TODO search by altNames
    ],
  };
  if (plural) {
    where.OR.push({ name: { equals: plural } });
    where.OR.push({ plural: { equals: plural } });
  }
  const existing = await prisma.ingredient.findMany({ where });

  if (!existing?.length) {
    const data: Prisma.IngredientCreateInput = {
      name: singular,
    };
    if (plural !== null) {
      data.plural = plural;
    }
    const ingredient = await prisma.ingredient.create({ data }).catch(() => {
      // most likely this was already created, so attempt to re-fetch it
      findIngredient(name, prisma);
    });
    if (ingredient?.id) {
      return { connect: { id: +ingredient.id } };
    }
  }
  if (existing?.length > 0 && existing?.[0]?.id) {
    return { connect: { id: +existing[0].id } };
  }

  return null;
};

const createIngredientLine = async (
  ingredient: IngredientLine,
  prisma: PrismaClient
): Promise<Prisma.IngredientLineCreateWithoutNoteInput> => {
  const parsed: Prisma.ParsedSegmentCreateNestedManyWithoutIngredientLineInput =
    await buildParsedSegments(ingredient.parsed, prisma);

  return {
    blockIndex: ingredient.blockIndex,
    lineIndex: ingredient.lineIndex,
    reference: ingredient.reference,
    rule: ingredient.rule,
    isParsed: ingredient.isParsed,
    parsed,
  };
};

const updateIngredientLine = async (
  ingredient: IngredientLine,
  prisma: PrismaClient
): Promise<Prisma.IngredientLineUpdateWithWhereUniqueWithoutNoteInput> => {
  const parsed: Prisma.ParsedSegmentUpdateManyWithoutIngredientLineInput =
    await buildParsedSegments(ingredient.parsed, prisma);

  return {
    where: { id: +ingredient.id },
    data: {
      blockIndex: ingredient.blockIndex,
      lineIndex: ingredient.lineIndex,
      reference: ingredient.reference,
      rule: ingredient.rule,
      isParsed: ingredient.isParsed,
      parsed,
    },
  };
};

const createIngredientLines = async (
  ingredients: IngredientLine[] = [],
  prisma: PrismaClient
): Promise<Prisma.IngredientLineCreateWithoutNoteInput[]> =>
  Promise.all(
    ingredients.map(async (ingredient: IngredientLine) =>
      createIngredientLine(ingredient, prisma)
    )
  );

const updateIngredientLines = async (
  ingredients: IngredientLine[] = [],
  prisma: PrismaClient
): Promise<Prisma.IngredientLineUpdateWithWhereUniqueWithoutNoteInput[]> =>
  Promise.all(
    ingredients.map(async (ingredient: IngredientLine) =>
      updateIngredientLine(ingredient, prisma)
    )
  );

export const buildIngredientLines = async (
  ingredients: IngredientLine[] = [],
  prisma: PrismaClient
): Promise<Prisma.IngredientLineUpdateManyWithoutNoteInput> => {
  const isCreateIngredients = ingredients?.[0]?.id === undefined;
  if (isCreateIngredients) {
    const create: Promise<Prisma.IngredientLineCreateWithoutNoteInput[]> =
      await createIngredientLines(ingredients, prisma);
    return { create };
  }

  const update: Promise<Prisma.IngredientLineUpdateWithWhereUniqueWithoutNoteInput> =
    await updateIngredientLines(ingredients, prisma);
  return { update };
};

export const updateIngredientLineRelation = async (
  line: unknown,
  prisma: PrismaClient
): Promise<void> => {
  const { id, parsed } = line;
  const parsedIngredientIds = parsed
    .filter((p) => p.ingredientId !== null)
    .map((p) => p.ingredientId);

  if (parsedIngredientIds.length > 0) {
    // update the ingredient line itself to have a direct ingredient relationship
    await prisma.ingredientLine.update({
      data: {
        ingredientId: parsedIngredientIds[0], // for now we'll just assume a single ingredient
      },
      where: { id },
    });
  }
};
