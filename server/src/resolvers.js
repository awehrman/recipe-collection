const { extractFragmentReplacements } = require('prisma-binding');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');

const resolvers = {
	Query,
	Mutation,
};

module.exports = {
	resolvers,
	fragmentReplacements: extractFragmentReplacements(resolvers),
};
