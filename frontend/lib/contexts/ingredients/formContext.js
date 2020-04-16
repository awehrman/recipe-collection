import { Map as ImmutableMap } from 'immutable';
import React from 'react';

const defaultValue = new ImmutableMap({
	alternateNames: [],
	id: '-1',
	isComposedIngredient: false,
	isValidated: false,
	name: null,
	parentID: null,
	parentName: null,
	references: [],
	plural: null,
	properties: {
		dairy: false,
		fish: false,
		gluten: false,
		meat: false,
		poultry: false,
		soy: false,
	},
	relatedIngredients: [],
	substitutes: [],
});

const ViewContext = React.createContext(defaultValue);

export default ViewContext;
