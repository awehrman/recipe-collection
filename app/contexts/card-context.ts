import _ from 'lodash';
import React from 'react';

const defaultCard = {
	id: -1,
	isEditMode: false,
	setIsEditMode: _.noop(),
};

const CardContext = React.createContext(defaultCard);

export default CardContext;
