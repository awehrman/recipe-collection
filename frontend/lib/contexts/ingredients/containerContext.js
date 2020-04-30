import { Map as ImmutableMap } from 'immutable';
import React from 'react';

const defaultValue = ImmutableMap({ nextIngredientID: null });

const ContainerContext = React.createContext(defaultValue);

export default ContainerContext;
