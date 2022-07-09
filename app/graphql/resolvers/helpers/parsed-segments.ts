import { Prisma, PrismaClient } from '@prisma/client';

import { ExistingParsedSegment, ParsedSegment } from '../../../types/ingredient';

import { findIngredient } from './ingredients';

const createParsedSegment = async (
  parsed: ParsedSegment,
  prisma: PrismaClient
): Promise<Prisma.ParsedSegmentCreateWithoutIngredientLineInput> => {
  const data: Prisma.ParsedSegmentCreateWithoutIngredientLineInput = {
    index: parsed.index,
    rule: parsed.rule,
    type: parsed.type,
    value: parsed.value,
  };
  const hasIngredient = parsed.type === 'ingredient';
  const ingredient: Prisma.IngredientCreateNestedOneWithoutParsedSegmentInput | null =
    hasIngredient ? await findIngredient(parsed.value, prisma) : null;

  if (hasIngredient && ingredient !== null) {
    data.ingredient = ingredient;
  }

  return data;
};

const updateParsedSegment = async (
  parsed: ExistingParsedSegment,
  prisma: PrismaClient
): Promise<Prisma.ParsedSegmentUpdateWithWhereUniqueWithoutIngredientLineInput> => {
  const data: Prisma.ParsedSegmentUpdateWithoutIngredientLineInput = {
    index: parsed.index,
    rule: parsed.rule,
    type: parsed.type,
    value: parsed.value,
  };
  // TODO there's probably some disconnections that should happen here
  const hasIngredient = parsed.type === 'ingredient' && !parsed?.ingredient;
  const ingredient: Prisma.IngredientCreateNestedOneWithoutParsedSegmentInput | null =
    hasIngredient
      ? await findIngredient(parsed.value, prisma)
      : parsed?.ingredient?.id
      ? { connect: { id: +parsed.ingredient.id } }
      : null;

  if (hasIngredient && ingredient !== null) {
    data.ingredient = ingredient;
  }

  return {
    where: { id: +parsed.id },
    data,
  };
};

const resolveParsedBuild = async (
  parsed: ParsedSegment,
  prisma: PrismaClient
): Promise<
  | Prisma.ParsedSegmentCreateNestedManyWithoutIngredientLineInput
  | Prisma.ParsedSegmentUpdateManyWithoutIngredientLineInput
> => {
  const isNewParsedSegment = !parsed?.id;
  if (isNewParsedSegment) {
    const create: Prisma.ParsedSegmentCreateWithoutIngredientLineInput =
      await createParsedSegment(parsed, prisma);
    return { create };
  }
  const update: Prisma.ParsedSegmentUpdateWithWhereUniqueWithoutIngredientLineInput =
    await updateParsedSegment(parsed as ExistingParsedSegment, prisma);
  return { update };
};

export const buildParsedSegments = async (
  parsedSegments: ParsedSegment[] = [],
  prisma: PrismaClient
): Promise<Prisma.ParsedSegmentUpdateManyWithoutIngredientLineInput> => {
  const parsedConnection: (
    | Prisma.ParsedSegmentCreateNestedManyWithoutIngredientLineInput
    | Prisma.ParsedSegmentUpdateManyWithoutIngredientLineInput
  )[] = await Promise.all(
    parsedSegments.map(async (parsed) => resolveParsedBuild(parsed, prisma))
  );
  const create = parsedConnection.filter((c) => c?.create).map((c) => c.create);
  const update = parsedConnection.filter((c) => c?.update).map((c) => c.update);
  const result = {};
  if (create.length > 0) {
    result.create = create;
  }
  if (update.length > 0) {
    result.update = update;
  }

  return result;
};
