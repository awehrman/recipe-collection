const fs = require('fs');
const graphql = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const nock = require("nock");

const Mutation = require('../src/resolvers/Mutation');
const Query = require('../src/resolvers/Query');
const mockIngredientService = require('./mocks/mockIngredientService');

describe('ingredients', () => {
	beforeAll(() => nock.disableNetConnect());
  afterAll(() => nock.enableNetConnect());
  afterEach(() => nock.cleanAll());

	it('testing sample', async () => {
		nock("https://localhost:3001")
      .post(`/`)
      .reply(200, {
        data: {
          hire: { id: "HIRE_ID", name: "Lewis Blackwood" }
        }
      });

    const result = await getHire("HIRE_ID");
    expect(result).toBe(`Hire's name is: Lewis Blackwood`);
	});

	/*
	it('testing sample', async () => {
		const typeDefs = fs.readFileSync('src/generated/prisma.graphql', 'utf8');
    const schema = makeExecutableSchema({ typeDefs, resolvers: {
      Mutation,
      Query,
    } });
    const query = `
	    query CURRENT_INGREDIENT_QUERY($id: ID!) {
				ingredient(where: { id: $id }) {
					id
					parent {
						id
						name
					}
					name
					plural
					properties {
						meat
						poultry
						fish
						dairy
						soy
						gluten
					}
					alternateNames
					relatedIngredients {
						id
						name
					}
					substitutes {
						id
						name
					}
					references {
						id
						title
					}
					isValidated
		      isComposedIngredient
				}
			}`;
			const variables = { id: "0" };
			const context = { IngredientService: mockIngredientService };

    const result = await graphql(schema, query, null, context, variables)
    console.log(result);
    //return expect(result).toEqual(expected)
	});*/
});