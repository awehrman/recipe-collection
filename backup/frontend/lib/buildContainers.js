import { List as ImmutableList } from 'immutable';
import { v4 as uuidv4 } from 'uuid';
import { getNextIngredientID } from './util';

const generateByCount = (id, ingredients) => {
	// console.log('generateByCount');
	if (!ingredients.size) return [];
	let containers = [];

	// get the largest reference count from the bunch
	const upperBound = ingredients
		.map((i) => i.referenceCount)
		.reduce((prev, current) => ((prev > current) ? prev : current));

	// determine exception categories for ingredients with 0 and/or 1 references
	const noReferences = (ingredients.filter((i) => i.referenceCount === 0).size > 0) ? 1 : 0;
	const singularReference = (ingredients.filter((i) => i.referenceCount === 1).size > 0) ? 1 : 0;

	// determine number of groups needed outside of our two exception groups
	let containerSize = (upperBound > 1) ? Math.ceil(upperBound / 10) : 0;
	containerSize += noReferences + singularReference;

	let rangeStart = 2;
	let rangeEnd = 10;

	containers = [ ...Array(containerSize) ];
	containers = containers.map((c, index) => {
		let containerIngredients = [];

		// 0 References
		if ((index === 0) && noReferences) {
			containerIngredients = ingredients.filter((i) => i.referenceCount === 0);
			return {
				__typename: 'Container',
				id: uuidv4(),
				ingredientID: id,
				ingredients: containerIngredients,
				isExpanded: false,
				label: '0 References',
				referenceCount: containerIngredients.size,
			};
		}

		// 1 Reference
		if ((index === 0 && !noReferences) || (index === 1 && noReferences)) {
			containerIngredients = ingredients.filter((i) => i.referenceCount === 1);

			return {
				__typename: 'Container',
				id: uuidv4(),
				ingredientID: id,
				ingredients: containerIngredients,
				isExpanded: false,
				label: '1 Reference',
				referenceCount: containerIngredients.size,
			};
		}

		// 2+ References
		// adjust the index based on whether we have any exception groups
		const adjustedIndex = (index - noReferences - singularReference);
		if (adjustedIndex > 0) {
			rangeStart = (adjustedIndex * 10) + 1;
			rangeEnd = (adjustedIndex * 10) + 10;
		}

		containerIngredients = ingredients.filter((i) => i.referenceCount >= rangeStart && i.referenceCount <= rangeEnd);

		return {
			__typename: 'Container',
			id: uuidv4(),
			ingredientID: id,
			ingredients: containerIngredients,
			isExpanded: false,
			label: `${ rangeStart }-${ rangeEnd } References`,
			referenceCount: containerIngredients.size,
		};
	}).filter((c) => c.ingredients.size > 0);

	return containers;
};

const generateByName = (id, ingredients, view) => {
	// console.log('generateByName');
	let containers = [];
	let pagerLabels = [];

	// if we have less than 500 ingredients, display them in a single container
	if (ingredients.size <= 500) {
		containers.push({
			__typename: 'Container',
			id: uuidv4(),
			ingredientID: id,
			ingredients,
			isExpanded: true,
			label: (view === 'search')
				? 'Search Results'
				: `${ view.charAt(0).toUpperCase() + view.slice(1) } Ingredients`,
			referenceCount: ingredients.size,
		});
		// otherwise break up into containers by letter
	} else {
		// create an array of unique letters used
		pagerLabels = ingredients.map((i) => i.name.charAt(0))
			.filter((char, index, self) => self.indexOf(char) === index && char.match(/[a-z]/i))
			.sort((a, b) => a.localeCompare(b))
			.toJS();

		const containsSymbols = ingredients
			.map((i) => i.name.charAt(0))
			.filter((char) => !char.match(/[a-z]/i)).size > 0;

		if (containsSymbols) {
			pagerLabels.unshift('@');
		}

		containers = pagerLabels.map((char) => {
			const containerIngredients = (char === '@')
				? ingredients.filter((i) => !i.name.charAt(0).match(/[a-z]/i))
				: ingredients.filter((i) => i.name.charAt(0) === char);

			return {
				__typename: 'Container',
				id: uuidv4(),
				ingredientID: id,
				ingredients: containerIngredients,
				isExpanded: true,
				label: char,
				referenceCount: containerIngredients.size,
			};
		});
	}

	containers = containers.filter((c) => (c.ingredients && c.ingredients.size > 0));
	return containers;
};

const generateByProperty = (id, ingredients) => {
	// console.log('generateByProperty');
	const PROPERTIES = [ 'meat', 'poultry', 'fish', 'dairy', 'soy', 'gluten', 'other' ];

	const containers = PROPERTIES.map((label) => {
		let containerIngredients = [];

		if (label !== 'other') {
			containerIngredients = ingredients.filter((i) => i.properties[label]);
		} else {
			containerIngredients = ingredients.filter((i) => Object
				// ["Properties", false, false, false, false, false, false]
				.values(i.properties)
				.filter((value) => (typeof value !== 'string') && value)
				.length === 0);
		}

		const container = {
			__typename: 'Container',
			id: uuidv4(),
			ingredientID: id,
			ingredients: ImmutableList(containerIngredients),
			isExpanded: true,
			label: label.charAt(0).toUpperCase() + label.slice(1),
			referenceCount: containerIngredients.size,
		};

		return container;
	}).filter((c) => c.ingredients.size > 0);

	return containers;
};

const generateByRelationship = (id, ingredients) => {
	// console.log('generateByRelationship');
	const containers = [];
	const parentIngredients = ingredients.filter((i) => !i.parent);
	const childIngredients = ingredients.filter((i) => i.parent);

	if (childIngredients.size > 0) {
		containers.push({
			__typename: 'Container',
			id: uuidv4(),
			ingredientID: id,
			ingredients: childIngredients,
			isExpanded: true,
			label: 'Child Ingredients',
			referenceCount: childIngredients.size,
		});
	}

	if (parentIngredients.size > 0) {
		containers.push({
			__typename: 'Container',
			id: uuidv4(),
			ingredientID: id,
			ingredients: parentIngredients,
			isExpanded: true,
			label: 'Parent Ingredients',
			referenceCount: parentIngredients.size,
		});
	}

	return containers;
};

const buildContainers = (id = null, group = 'name', view = 'all', ingredients = []) => {
	// console.log('BUILD CONTAINERS');
	let containers = [];

	// filter ingredients based on the view
	const viewIngredients = new ImmutableList((view === 'new') ? ingredients.filter((ing) => !ing.isValidated) : ingredients);
	// create containers by group
	switch (group) {
	case 'count':
		containers = generateByCount(id, viewIngredients);
		break;
	case 'property':
		containers = generateByProperty(id, viewIngredients);
		break;
	case 'relationship':
		containers = generateByRelationship(id, viewIngredients);
		break;
	default: // name
		containers = generateByName(id, viewIngredients, view);
	}

	// sort internal ingredients per containers
	const response = containers.map((c) => {
		const sortedIngredients = c.ingredients.sort((a, b) => a.name.localeCompare(b.name));
		const nextIngredientID = getNextIngredientID({
			ingredientID: id,
			ingredients: sortedIngredients,
		});
		return {
			...c,
			ingredients: sortedIngredients.toJS(),
			nextIngredientID,
		};
	});

	return response;
};

export default buildContainers;
