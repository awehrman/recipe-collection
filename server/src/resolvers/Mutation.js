const Mutations = {
	/*----------  Categories  ----------*/
	async createCategory(parent, args, ctx, info) {
		console.log('createCategory'.green);
		const category = await ctx.db.mutation.createCategory({
			data: {
				...args
			}
		}, info);

		return category;
	},

	// TODO deleteCategory

	// TODO updateCategory


	/*----------  Ingredients  ----------*/
	async createIngredient(parent, args, ctx, info) {
		console.log('createIngredient'.green);
		let parentRelation;
		let { parentID, parentName,
					name, plural, properties,
					alternateNames, relatedIngredients, substitutes,
					references, isValidated
				} = args;

		name = (name) ? name.toLowerCase() : '';
		plural = (plural) ? plural.toLowerCase() : '';

		if (!properties) {
			properties = {
				meat: false,
			  poultry: false,
			  fish: false,
			  dairy: false,
			  soy: false,
			  gluten: false
			};
		}

		if (parentID) {
			parentRelation = { connect: { id: parentID } };
		} else if (parentName) {
			// TODO test with existing ingredient to make sure this doesn't duplicate
			// if not found, then create ingredient with parent parentName
      parentRelation = { create: { name: parentName, properties: { create: properties } } };
		}

		alternateNames = (alternateNames && alternateNames.length > 0)
											? alternateNames.map(a => a.toLowercase())
											: [];

		relatedIngredients = (relatedIngredients)
			? { connect: relatedIngredients.map(i => { return { id: i }; }) }
			: [];

		substitutes = (substitutes)
			? { connect: substitutes.map(i => { return { id: i }; }) }
			: [];

		isValidated = isValidated || false;

		let ingredient = {
			parent: parentRelation,
			name,
			plural,
			properties: { create: properties },
			alternateNames: { set: alternateNames },
			relatedIngredients,											// TODO
			substitutes,														// TODO
			references,															// TODO
			isValidated
		};

		console.log(ingredient);

		ingredient = await ctx.db.mutation.createIngredient({
      data: {
      	...ingredient
      }
    }, info);

		return ingredient;
	},

	// TODO deleteIngredient

	// TODO updateIngredient


	/*----------  Recipes  ----------*/
	async createRecipe(parent, args, ctx, info) {
		console.log('createRecipe'.green);
		const recipe = await ctx.db.mutation.createRecipe({
			data: {
				...args
			}
		}, info);

		return recipe;
	},

	async updateRecipe(parent, args, ctx, info) {
		console.log('updateRecipe'.blue);
    const updates = { ...args };
    let recipe = {};
    delete updates.id;

    // handle category updates
  	const categories = {
	  	...(updates.categoryConnections && { connect: updates.categoryConnections.map(u => { return { id: u }; }) }),
	  	...(updates.categoryDisconnections && { disconnect: updates.categoryDisconnections.map(u => { return { id: u }; }) })
		};

		if (updates.categoryConnections) delete updates.categoryConnections;
		if (updates.categoryDisconnections) delete updates.categoryDisconnections;

		// handle tag updates
  	const tags = {
	  	...(updates.tagConnections && { connect: updates.tagConnections.map(u => { return { id: u }; }) }),
	  	...(updates.tagDisconnections && { disconnect: updates.tagDisconnections.map(u => { return { id: u }; }) })
		};

		if (updates.tagConnections) delete updates.tagConnections;
		if (updates.tagDisconnections) delete updates.tagDisconnections;

	  // update the remainder of the fields
	  return await ctx.db.mutation.updateRecipe(
	      {
	        data: {
	        	categories,		// connect and/or disconnect category changes
	        	tags,					// connect and/or disconnect tag changes
	        	...updates		// update any other changed recipe fields (title, evernoteGUID, source, image, etc.)
	        },
	        where: {
	          id: args.id,
	        },
	      },
	      info
	    );
	},


	/*----------  Tags  ----------*/
	async createTag(parent, args, ctx, info) {
		console.log('createTag'.green);
		const tag = await ctx.db.mutation.createTag({
			data: {
				...args
			}
		}, info);

		return tag;
	},

	// TODO deleteTag

	// TODO updateTag
};


module.exports = Mutations;
