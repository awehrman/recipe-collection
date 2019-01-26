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
					references, isValidated, isComposedIngredient
				} = args;

		name = (name) ? name.trim().toLowerCase() : '';
		plural = (plural) ? plural.trim().toLowerCase() : '';

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
											? alternateNames.map(a => a.toLowerCase())
											: [];

		relatedIngredients = (relatedIngredients)
			? { connect: relatedIngredients.map(i => { return { id: i }; }) }
			: [];

		substitutes = (substitutes)
			? { connect: substitutes.map(i => { return { id: i }; }) }
			: [];

		isValidated = isValidated || false;
		isComposedIngredient = isComposedIngredient || false;

		let ingredient = {
			parent: parentRelation,
			name,
			plural,
			properties: { create: properties },
			alternateNames: { set: alternateNames },
			relatedIngredients,
			substitutes,
			references,
			isValidated,
			isComposedIngredient
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

	async updateIngredient(parent, args, ctx, info) {
		console.log('updateIngredient'.cyan);
		console.log('------------------------'.cyan);
    console.log(args);

    const updates = { ...args };
    let properties = {};
    delete updates.id;

    if (updates.hasOwnProperty('name')) {
    	console.log('...NAME'.yellow);
    	updates.name = updates.name.trim().toLowerCase();
    }

    if (updates.hasOwnProperty('plural')) {
    	console.log('...PLURAL'.yellow);
    	updates.plural = updates.plural.trim().toLowerCase();
    }

    if (updates.hasOwnProperty('parentID') || updates.hasOwnProperty('parentName')) {
    	console.log('...PARENT'.yellow);
    	// TODO
    }

    // handle alternate names updates
    if (updates.hasOwnProperty('alternateNames') && updates.alternateNames.length > 0) {
    	updates.alternateNames = { set: [ ...updates.alternateNames || null ] };
    } else if (updates.hasOwnProperty('alternateNames') && updates.alternateNames.length === 0) {
    	updates.alternateNames = { set: [] };
    }

    const relatedIngredients = {
	  	...(updates.relatedIngredients_Connect && { connect: updates.relatedIngredients_Connect.map(u => { return { id: u }; }) }),
	  	...(updates.relatedIngredients_Disconnect && { disconnect: updates.relatedIngredients_Disconnect.map(u => { return { id: u }; }) })
		};

		if (updates.relatedIngredients_Connect) delete updates.relatedIngredients_Connect;
		if (updates.relatedIngredients_Disconnect) delete updates.relatedIngredients_Disconnect;

    const substitutes = {
	  	...(updates.substitutes_Connect && { connect: updates.substitutes_Connect.map(u => { return { id: u }; }) }),
	  	...(updates.substitutes_Disconnect && { disconnect: updates.substitutes_Disconnect.map(u => { return { id: u }; }) })
		};

		if (updates.substitutes_Connect) delete updates.substitutes_Connect;
		if (updates.substitutes_Disconnect) delete updates.substitutes_Disconnect;

    if (updates.hasOwnProperty('references')) {
    	console.log('...REFERENCES'.yellow);
    	// TODO
    }


		console.log('------------------------'.green);
  	console.log({
    	relatedIngredients,
    	substitutes,
    	properties,					// update properties
    	...updates					// update any other changed ingredient fields
    });

	  // update the remainder of the fields
	  return await ctx.db.mutation.updateIngredient(
      {
        data: {
        	relatedIngredients,
        	substitutes,
        	properties,					// update properties
        	...updates					// update any other changed ingredient fields
        },
        where: {
          id: args.id
        },
      },
      info
    );
	},


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
