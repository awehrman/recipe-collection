"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "User",
    embedded: false
  },
  {
    name: "Ingredient",
    embedded: false
  },
  {
    name: "AlternateName",
    embedded: false
  },
  {
    name: "Property",
    embedded: false
  },
  {
    name: "Recipe",
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
    name: "RecipeIngredient",
    embedded: false
  },
  {
    name: "RecipeInstruction",
    embedded: false
  },
  {
    name: "ParsedSegment",
    embedded: false
  },
  {
    name: "Container",
    embedded: false
  },
  {
    name: "IngredientAggregate",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `${process.env["PRISMA_ENDPOINT"]}`,
  secret: `${process.env["PRISMA_SECRET"]}`
});
exports.prisma = new exports.Prisma();
