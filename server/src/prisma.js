const Bindings = require('prisma-binding');
// NOTE: i had some issues generating my prisma-client with the env variables in prisma.yml
// it looks like there may be a related issue at https://github.com/prisma/prisma/issues/3659
// temporarily swapping the env for actual values worked to generate this as needed
const Client = require('./generated/prisma-client');
const { fragmentReplacements } = require('./resolvers');

module.exports = {
	client: new Client.Prisma({
		fragmentReplacements,
		endpoint: process.env.PRISMA_ENDPOINT,
		secret: process.env.PRISMA_SECRET,
		debug: false,
	}),
	bindings: new Bindings.Prisma({
		typeDefs: 'src/generated/prisma.graphql',
		fragmentReplacements,
		endpoint: process.env.PRISMA_ENDPOINT,
		secret: process.env.PRISMA_SECRET,
		debug: false,
	}),
};
