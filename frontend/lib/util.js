// safely copy an object or array
const deepCopy = value => JSON.parse(JSON.stringify(value));

// finds the next value in the group by list
const getNextIngredientGroup = (currentGroup) => {
	const GROUP_BY = [ 'name', 'property', 'count', 'relationship' ];
	const groupIndex = GROUP_BY.findIndex(g => g === currentGroup);
	const next = (groupIndex !== (GROUP_BY.length - 1)) ? GROUP_BY[groupIndex + 1] : GROUP_BY[0];
	return next;
};

// determine if the object has the property or not
const hasProperty = (object, property) => Object.prototype.hasOwnProperty.call(object, property);

export {
	deepCopy,
	getNextIngredientGroup,
	hasProperty,
};
