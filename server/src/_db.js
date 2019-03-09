// this file connects to the remote Prisma DB and gives us the ablity to query it with js
const { Prisma } = require('prisma-binding');

const db = new Prisma({
	typeDefs: 'src/generated/prisma.graphql',
	endpoint: process.env.PRISMA_ENDPOINT,
	secret: process.env.PRISMA_SECRET,
	debug: false,
});

module.exports = db;
