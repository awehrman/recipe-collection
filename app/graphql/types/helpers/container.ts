import { v4 } from 'uuid';

const buildContainersByCount = (containersByCount = {}, ingHash = {}) => {
  const referenceCount = ingHash.count;
  if (referenceCount === 0 || referenceCount === 1 || referenceCount === 2) {
    if (!containersByCount?.[referenceCount]) {
      containersByCount[referenceCount] = {
        name: `${referenceCount} Reference${referenceCount === 1 ? '' : 's'}`,
        ingredients: [ingHash],
        sortOrder: referenceCount,
      };

    } else {
      containersByCount[referenceCount].ingredients.push(ingHash);
    }
  } else {
    // determine count range
    let floor = Math.floor(referenceCount / 10) * 10 + 1;
    let ceil = floor + 10;

    if (referenceCount < 11) {
      floor = 3;
      ceil = 10;
    } else if (referenceCount < 21) {
      floor = 11;
      ceil = 20;
    }
    const range = `${floor} - ${ceil} References`;

    if (!containersByCount?.[range]) {
      containersByCount[range] = {
        name: range,
        ingredients: [ingHash],
        sortOrder: floor,
      }
    } else {
      containersByCount[range].ingredients.push(ingHash);
    }
  }
}

const buildContainersByName = (containersByName = {}, ingHash = {}, view = 'all', ingredients = []) => {
  if (ingredients.length < 300) {
    if (!containersByName?.all) {
      containersByName.all = {
        name: `${view === 'new' ? 'New' : 'All'} Ingredients`,
        ingredients: [ingHash],
        sortOrder: 1,
      };

    } else {
      containersByName.all.ingredients.push(ingHash);
    }
  } else {
    // separate out by alphanumeric header character
    const char = ingHash.name[0]; // TODO adjust non-alpha starts
    // TODO careful with those damn ligatures too 'ﬁ' (although this might be a parsing concern)

    if (!containersByName?.[char]) {
      containersByName[char] = {
        name: char,
        ingredients: [ingHash],
        sortOrder: char,
      };

    } else {
      containersByName[char].ingredients.push(ingHash);
    }
  }
}

export const buildContainers = ({ group = 'name', ingredients = [], view = 'all' }) => {
  let containers = [];
	const containersByCount = {};
  const containersByName = {};
  const containersByProperty = {};
  const containersByRelationship = {};

  ingredients.forEach(({ id, parentId, name, properties, references = [] }) => {
    const ingHash = {
      id,
      count: references.length,
      isParent: Boolean(parentId),
      name,
      properties,
    };

    // add to count containers
    if (group === 'count') {
      buildContainersByCount(containersByCount, ingHash);
    }

    // add to name containers
    if (group === 'name') {
      buildContainersByName(containersByName, ingHash, view, ingredients);
    }

    // add to property containers

    // add to relationship containers
  });

	switch (group) {
	case 'count':
		containers = Object.values(containersByCount);
    break;
	case 'property':
		containers = Object.values(containersByProperty);
    break;
	case 'relationship':
		containers = Object.values(containersByRelationship);
    break;
	default: // name
    containers = Object.values(containersByName);
    break;
	}

  if (group === 'count') {
    containers.sort((a, b) => a.sortOrder - b.sortOrder);
  } else {
    containers.sort((a, b) => a.sortOrder.localeCompare(b.sortOrder));
  }

  containers = containers.map(({ name, ingredients }) => ({
    name,
    isExpanded: containers.length > 10,
    id: v4(),
    count: ingredients.length,
    ingredients: ingredients.sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return containers;
};
