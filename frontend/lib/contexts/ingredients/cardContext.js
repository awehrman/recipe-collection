import { Map as ImmutableMap } from 'immutable';
import React from 'react';

const defaultValue = new ImmutableMap({ isEditMode: true });

const ViewContext = React.createContext(defaultValue);

export default ViewContext;
