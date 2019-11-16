"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Ingredient",
    embedded: false
  },
  {
    name: "RecipeReference",
    embedded: false
  },
  {
    name: "AlternateName",
    embedded: false
  },
  {
    name: "Properties",
    embedded: false
  },
  {
    name: "Recipe",
    embedded: false
  },
  {
    name: "RecipeInstruction",
    embedded: false
  },
  {
    name: "RecipeIngredient",
    embedded: false
  },
  {
    name: "ParsedSegment",
    embedded: false
  },
  {
    name: "Note",
    embedded: false
  },
  {
    name: "Category",
    embedded: false
  },
  {
    name: "Tag",
    embedded: false
  },
  {
    name: "IngredientAggregate",
    embedded: false
  },
  {
    name: "RecipeAggregate",
    embedded: false
  },
  {
    name: "NoteAggregate",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `${process.env["PRISMA_ENDPOINT"]}`
});
exports.prisma = new exports.Prisma();
