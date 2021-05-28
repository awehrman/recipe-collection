// safely copy an object or array
const deepCopy = (value) => JSON.parse(JSON.stringify(value));

// finds the next value in the group by list
const getNextIngredientGroup = (currentGroup) => {
	const GROUP_BY = [ 'name', 'property', 'count', 'relationship' ];
	const groupIndex = GROUP_BY.findIndex((g) => g === currentGroup);
	const next = (groupIndex !== (GROUP_BY.length - 1)) ? GROUP_BY[groupIndex + 1] : GROUP_BY[0];
	return next;
};

// finds the next ingredient within the container
const getNextIngredientID = (container) => {
	if (container.ingredientID) {
		const currentIndex = container.ingredients.findIndex((i) => i.id === container.ingredientID);
		const nextIngredientIndex = currentIndex + 1;

		// if the next item in the list exists then return that id
		if (container.ingredients.length && container.ingredients[nextIngredientIndex]) {
			return container.ingredients[nextIngredientIndex].id;
		}

		// otherwise if we were at the end of the list, go-to the first item
		if (container.ingredients.length && container.ingredients[0]) {
			return container.ingredients[0].id;
		}
	}
	return null;
}

// determine if the object has the property or not
const hasProperty = (object, property) => Object.prototype.hasOwnProperty.call(object, property);

export {
	deepCopy,
	getNextIngredientGroup,
	getNextIngredientID,
	hasProperty,
};
