import { v4 } from 'uuid';

export const buildContainers = ({ group = 'name', ingredients = [], view = 'all' }) => {
	const containersByCount = {};
  const containersByName = {};
  const containersByProperty = {};
  const containersByRelationship = {};

  const ingHash = {};

  ingredients.forEach(({ id, parentId, name, properties, references = [] }) => {
    ingHash[id] = {
      id,
      count: references.length,
      isParent: Boolean(parentId),
      name,
      properties,
    };

    // add to count containers
    const referenceCount = ingHash[id].count;
    if (referenceCount === 0 || referenceCount === 1 || referenceCount === 2) {
      if (!containersByCount?.[referenceCount]) {
        containersByCount[referenceCount] = {
          id: v4(),
          name: `${referenceCount} Reference${referenceCount === 1 ? '' : 's'}`,
          ingredients: [ingHash[id]],
          isExpanded: false,
        };

      } else {
        containersByCount[referenceCount].ingredients.push(ingHash[id]);
      }
    } else {
      // determine count range
      const floor = Math.floor(referenceCount);
      const floorMultiplier = floor * 10;
      const range = `${floorMultiplier === 0 ? 3 : floorMultiplier} - ${floorMultiplier + 9} References`;

      if (!containersByCount?.[range]) {
        containersByCount[range] = {
          id: v4(),
          name: range,
          ingredients: [ingHash[id]],
          isExpanded: false,
        }
      } else {
        containersByCount[range].ingredients.push(ingHash[id]);
      }
    }

    // add to name containers
    if (ingredients.length < 300) {
      if (!containersByName?.all) {
        containersByName.all = {
          id: v4(),
          name: `${view === 'new' ? 'New' : 'All'} Ingredients`,
          ingredients: [ingHash[id]],
          isExpanded: false,
        };

      } else {
        containersByName.all.ingredients.push(ingHash[id]);
      }
    } else {
      // separate out by alphanumeric header character
      const char = ingHash[id].name[0]; // TODO adjust non-alpha starts

      if (!containersByName?.[char]) {
        containersByName[char] = {
          id: v4(),
          name: `${view === 'new' ? 'New' : 'All'} Ingredients`,
          ingredients: [ingHash[id]],
          isExpanded: false,
        };

      } else {
        containersByName[char].ingredients.push(ingHash[id]);
      }
    }

    // add to property containers

    // add to relationship containers
  });

	switch (group) {
	case 'count':
		return Object.values(containersByCount);
	case 'property':
		return Object.values(containersByProperty);
	case 'relationship':
		return Object.values(containersByRelationship);
	default: // name
		return Object.values(containersByName);
	}
};
