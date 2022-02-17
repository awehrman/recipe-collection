import { PrismaClient } from '@prisma/client';
import { makeSchema } from '@nexus/schema';
import { nexusPrisma } from '@kenchi/nexus-plugin-prisma';
import path from 'path';

import Mutation from './mutation-types';
import Query from './query-types';
import {
  User,
  Account,
  AuthenticationResponse,
  Session,
  Ingredient,
  AlternateName,
  Recipe,
  Category,
  Tag,
  IngredientLine,
  InstructionLine,
  ParsedSegment,
  Note,
  Book,
  Author
} from './object-types';

const types = [
  Query,
  Mutation,
  AuthenticationResponse,
  User,
  Account,
  Session,
  Ingredient,
  AlternateName,
  Recipe,
  Category,
  Tag,
  IngredientLine,
  InstructionLine,
  ParsedSegment,
  Note,
  Book,
  Author
];

const prisma = new PrismaClient()

export const schema = makeSchema({
  types,
  plugins: [nexusPrisma({
    prismaClient: ctx => ctx.prisma = prisma,
    experimentalCRUD: true,
  })],
  outputs: {
    typegen: path.join(process.cwd(), 'generated', 'nexus-typegen.ts'),
    schema: path.join(process.cwd(), 'generated', 'schema.graphql')
  },
  typegenAutoConfig: {
    contextType: 'ContextModule.Context',
    sources: [
      {
        source: '@prisma/client',
        alias: 'prisma'
      },
      {
        source: require.resolve("./context"),
        alias: "ContextModule",
      }
    ]
  }
});