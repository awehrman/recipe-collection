const fs = require('fs');
const graphql = require('graphql');
import { makeExecutableSchema } from 'graphql-tools';

const Mutation = require('../src/resolvers/Mutation');
const Query = require('../src/resolvers/Query');
const mockIngredientService = require('./mocks/mockIngredientService');

// mocks
const ingredients = () => ([
	{
	  __typename: 'Ingredient',
	  id: '0',
	  name: 'red chile',
		plural: 'red chiles',
		parent: null,
	 	properties: {
	 		__typename: 'Properties',
			meat: false,
		  poultry: false,
		  fish: false,
		  dairy: false,
		  soy: false,
		  gluten: false
		},
		alternateNames: [ 'red chili', 'red chilies' ],
		relatedIngredients: [],
		substitutes: [],
		references: [],
		isValidated: false,
		isComposedIngredient: false,
	},
	{
	  __typename: 'Ingredient',
	  id: '1',
	  name: 'red chily',
		plural: 'red chillies',
		parent: null,
	 	properties: {
	 		__typename: 'Properties',
			meat: false,
		  poultry: false,
		  fish: false,
		  dairy: false,
		  soy: false,
		  gluten: false
		},
		alternateNames: [],
		relatedIngredients: [],
		substitutes: [],
		references: [],
		isValidated: false,
		isComposedIngredient: false,
	}
]);

describe('ingredients', () => {
	it('testing sample', async () => {
		const typeDefs = fs.readFileSync('src/schema.graphql', 'utf8');
		// TODO wehrman you left off here; install graphql tools and keep trying...
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
	});
});