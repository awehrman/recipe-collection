const uuidv1 = require('uuid/v1');
const { forwardTo } = require('prisma-binding');

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
}`

const Query = {
	categories: forwardTo('db'),

	async containers(parent, args, ctx, info) {
		const { id = null, group = 'name', view = 'all' } = args;
		let containers = [],
				ingredients = await ctx.db.query.ingredients({}, GET_CONTAINER_INGREDIENTS_QUERY),
				message = '';

/*
		// if we passed an initial id, then lookup that ingredient and pass it back in settings
		if (id) {
			console.log("passed an id...");
			const ingredient = await ctx.db.query.ingredient({ where: { id }},`{ id }`);
			console.warn(ingredient);
			if (ingredient) {
				settings.currentIngredientID = ingredient.id;
				settings.isCardEnabled = true;
			}
		}
*/	
		const getSettings = (currentIngredientID = null, ingredients = [], id = 0, isExpanded = true) => {
			let hasCurrentIngredient = false;
			if (currentIngredientID) {
				// verify that this ingredient is in this container
				hasCurrentIngredient = (currentIngredientID && ingredients.findIndex(i => i.id === currentIngredientID) > -1) ? true : false; 
			}

			return {
				currentIngredientID: (hasCurrentIngredient) ? currentIngredientID : false,
				id,
        isCardEnabled: (hasCurrentIngredient) ? true : false,
        isExpanded,
        __typename: "IngredientViewState"
			};
		}

		// TODO consider paginating containers above a certain threshold (1000?)

		// filter ingredients by view
		switch(view) {
			case 'new':
				ingredients = ingredients.filter(i => !i.isValidated);
				message = (ingredients.length === 0) ? "No new ingredients exist." : "";
				break;
			case 'search':
				// TODO search ingredients by search term
				message = "No ingredients matching that term were found.";
				break;
			default:
				// return all ingredients by default
				if (ingredients.length === 0) message = "No ingredients exist.";
				break;
		}

		let uuid;

		// containerize ingredients into groups
		switch(group) {
			// TODO expand once we've connected ingredient refrences, for now, this loads everything
			case 'count':
				uuid = uuidv1();

				containers.push({
					id: uuid,
					label: "0 References",
					ingredients: ingredients,
					message,
					settings: getSettings(id, ingredients, uuid)
				});
				break;
			case 'property':
				const labels = [ 'meat', 'poultry', 'fish', 'dairy', 'soy', 'gluten', 'other' ];
				
				containers = labels.map(label => {
					let containerIngredients = [];

					if (label !== 'other') {
						containerIngredients = ingredients.filter(i => i.properties && i.properties[label]);
					} else {
  					// if this ingredient didn't get put into any other containers
  					containerIngredients = ingredients.filter(i => {
							let result = true;
							for (let p in i.properties) {
								if (i.properties[p]) {
									result = false;
									break;
								}
							}
							return result;
						});
  				}

  				if (containerIngredients.length > 0) {
  					uuid = uuidv1();
  					return {
  						id: uuid,
							label: label.charAt(0).toUpperCase() + label.slice(1),
							ingredients: containerIngredients,
							message,
							settings: getSettings(id, containerIngredients, uuid)
  					};
  				}
				}).filter(c => c);

				break;
			case 'relationship':
				const parentIngredients = ingredients.filter(i => !i.parent);
				const childIngredients = ingredients.filter(i => i.parent);

				// root level ingredients
				uuid = uuidv1();
				containers.push({
					id: uuid,
					label: "Parent Ingredients",
					ingredients: parentIngredients,
					message,
					settings: getSettings(id, parentIngredients, uuid)
				});

				// child level ingredients
				uuid = uuidv1();
				containers.push({
					id: uuid,
					label: "Child Ingredients",
					ingredients: [ ...childIngredients ],
					message,
					settings: getSettings(id, childIngredients, uuid)
				});
				break;
			default: // name
				// if we only have a small batch of ingredients, we'll return a single container
				if (ingredients.length < 500) {
					uuid = uuidv1();

					containers.push({
						id: uuid,
						label: "All Ingredients",
						ingredients,
						message,
						settings: getSettings(id, ingredients, uuid)
					});
				}
				// otherwise we'll return a container per letter
				else {
					// TODO
				}
				break;
		}

		// remove any empty containers that don't have any contents
		containers = containers.filter(c => c.ingredients.length > 0);

		console.log(containers);

    return containers;
	},
	
	async counts(parent, args, ctx, info) {
		const ingCount = await ctx.db.query.ingredientsConnection(
      {},
      `{ aggregate { count } }`,
    );

    const newCount = await ctx.db.query.ingredientsConnection(
      { where: { isValidated: false }},
      `{ aggregate { count } }`,
    );

    return {
    	ingredients: ingCount.aggregate.count,
			newIngredients: newCount.aggregate.count
    };
	},

	ingredient: forwardTo('db'),
	ingredients: forwardTo('db'),
	
	recipe: forwardTo('db'),
	recipes: forwardTo('db'),
	
	tags: forwardTo('db'),
};

module.exports = Query;