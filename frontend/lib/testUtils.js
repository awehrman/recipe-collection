import casual from 'casual';

// seed it so we get consistent results
casual.seed(777);

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

export {
  ingredients
};
