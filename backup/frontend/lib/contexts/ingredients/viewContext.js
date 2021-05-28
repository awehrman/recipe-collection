import { Map as ImmutableMap } from 'immutable';
import React from 'react';

const defaultValue = ImmutableMap({
	currentIngredientID: null,
	group: 'name',
	view: 'all',
});

const ViewContext = React.createContext(defaultValue);

export default ViewContext;
