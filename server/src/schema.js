const { makeExecutableSchema } = require('apollo-server');
const { importSchema } = require('graphql-import');

const typeDefs = importSchema('./src/schema/index.graphql');
const { resolvers } = require('./src/resolvers');

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = schema;
