const uuidv1 = require('uuid/v1');

const GET_CONTAINER_INGREDIENTS_QUERY = `{
  id
	name
	plural
	alternateNames {
		name
	}
	properties {
		meat
	  poultry
	  fish
	  dairy
	  soy
	  gluten
	}
	parent {
		id
	}
	isValidated
}`;

// TODO since we're no longer using prisma bindings, you'll want to double check the accuracy of these queries and mutations

export default {
	Query: {
		containers: async (parent, args, ctx) => {
			const { id = null, group = 'name', view = 'all' } = args;
			console.log('containers');
			let containers = [];
			// note: prisma client will only bring back scalar fields by default, so we need to use
			// a fragment to get related relations (alternateNames, properties, and parent in this example)
			let ingredients = await ctx.prisma.ingredients().$fragment(GET_CONTAINER_INGREDIENTS_QUERY);
			let uuid;
			let parentIngredients = [];
			let childIngredients = [];
			const labels = [ 'meat', 'poultry', 'fish', 'dairy', 'soy', 'gluten', 'other' ];

			const getSettings = (currentIngredientID = null, ingList = []) => {
				let hasCurrentIngredient = false;
				if (currentIngredientID) {
					// verify that this ingredient is in this container
					hasCurrentIngredient = (ingList.findIndex(i => i.id === currentIngredientID) > -1);
				}

				return {
					currentIngredientID: (hasCurrentIngredient) ? currentIngredientID : null,
					isCardEnabled: (hasCurrentIngredient),
					// TODO move this into the client side if this is constant
					isContainerExpanded: true,
				};
			};

			// TODO consider paginating containers above a certain threshold (1000?)

			// filter ingredients by view
			switch (view) {
			case 'new':
				ingredients = ingredients.filter(i => !i.isValidated);
				break;
			case 'search':
				// TODO search ingredients by search term
				break;
			default:
				// return all ingredients by default
				break;
			}

			switch (group) {
			// TODO expand once we've connected ingredient refrences, for now, this loads everything
			case 'count':
				uuid = uuidv1();

				containers.push({
					id: uuid,
					label: '0 References',
					ingredients,
					...getSettings(id, ingredients),
				});
				break;
			case 'property':
				containers = labels.map((label) => {
					const containerIngredients = (label !== 'other')
						// filter by property type
						? ingredients.filter(i => i.properties[label])
						// lump all other ingredients that don't have a positive property type together
						: ingredients.filter(i => (Object.values(i.properties).every(v => !v)));

					if (containerIngredients.length > 0) {
						uuid = uuidv1();
						return {
							id: uuid,
							label: label.charAt(0).toUpperCase() + label.slice(1),
							ingredients: containerIngredients,
							...getSettings(id, containerIngredients),
						};
					}

					return null;
				}).filter(c => c);

				break;
			case 'relationship':
				parentIngredients = ingredients.filter(i => !i.parent);
				childIngredients = ingredients.filter(i => i.parent);

				// root level ingredients
				uuid = uuidv1();
				containers.push({
					id: uuid,
					label: 'Parent Ingredients',
					ingredients: parentIngredients,
					...getSettings(id, parentIngredients),
				});

				// child level ingredients
				uuid = uuidv1();
				containers.push({
					id: uuid,
					label: 'Child Ingredients',
					ingredients: [ ...childIngredients ],
					...getSettings(id, childIngredients),
				});
				break;
			default: // name
				// if we only have a small batch of ingredients, we'll return a single container
				if (ingredients.length < 500) {
					uuid = uuidv1();

					containers.push({
						id: uuid,
						label: 'All Ingredients',
						ingredients,
						...getSettings(id, ingredients),
					});
				} else {
					// otherwise we'll return a container per letter
					// TODO
				}
				break;
			}

			console.log(containers);

			// remove any empty containers that don't have any contents
			containers = containers.filter(c => c.ingredients.length > 0);


			return containers;
		},
	},
};
