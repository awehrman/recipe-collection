import React from 'react';

const defaultView = {
	group: 'name',
	view: 'all',
};

const ViewContext = React.createContext(defaultView);

export default ViewContext;
