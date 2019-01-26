const uuid = require('uuid/v1');
const { forwardTo } = require('prisma-binding');

const Query = {
	categories: forwardTo('db'),

	async containers(parent, args, ctx, info) {
		console.log('querying containers!'.green);
		const { group, view } = args;
		console.log({ group, view });

		let containers = [];
		let ingredients = await ctx.db.query.ingredients({},`{
		  id
			name
			parent {
				id
			}
			properties {
				meat
			  poultry
			  fish
			  dairy
			  soy
			  gluten
			}
			isValidated
		}`);
		let message = '';

		// TODO currentIngredient/nextIngredient assignments

		// filter ingredients by view
		if (view === 'new') {
			ingredients = ingredients.filter(i => !i.isValidated);
			message = (ingredients.length === 0) ? "No new ingredients exist." : "";
		} else if (view === 'search') {
			// TODO
			message = "No ingredients matching that term were found.";
		} else if (ingredients.length === 0) {
			message = "No ingredients exist."
		}

		// containerize ingredients into groups
		switch(group) {
			case 'count':
				// TODO expand
				containers.push({
					id: uuid(),
					label: "0 References",
					ingredients: ingredients,
					message
				});
				break;
			case 'property':
				const labels = [ 'meat', 'poultry', 'fish', 'dairy', 'soy', 'gluten', 'other' ];
				
				containers = labels.map(label => {
					let containerIngredients = [];

					if (label !== 'other') {
						console.log(label);
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

  				// TODO currentIngredient

  				if (containerIngredients.length > 0) {
  					return {
  						id: uuid(),
							label: label.charAt(0).toUpperCase() + label.slice(1),
							ingredients: containerIngredients,
							message
  					};
  				}
				}).filter(c => c);

				break;
			case 'relationship':
				// root level ingredients
				containers.push({
					id: uuid(),
					label: "Parent Ingredients",
					ingredients: ingredients.filter(i => !i.parent),
					message
				});

				// child level ingredients
				containers.push({
					id: uuid(),
					label: "Child Ingredients",
					ingredients: ingredients.filter(i => i.parent),
					message
				});
				break;
			default: // name
				// if we only have a small batch of ingredients, we'll return a single container
				if (ingredients.length < 500) {
					containers.push({
						id: uuid(),
						label: "All Ingredients",
						ingredients,
						message
					});
				}
				// otherwise we'll return a container per letter
				else {
					// TODO
				}
				break;
		}

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