const RETURN_ALL_INGREDIENT_FIELDS = `
	{
		id
		parent {
			id
			name
		}
		name
		plural
		properties {
			meat
			poultry
			fish
			dairy
			soy
			gluten
		}
		alternateNames {
			name
		}
		relatedIngredients {
			id
			name
		}
		substitutes {
			id
			name
		}
		references {
			id
			reference
		}
		isValidated
	 	isComposedIngredient
	}
`;

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

    if (!args.hasOwnProperty('id')) {
    	throw new Error('Ingredient update requires an ingredient id to update!');
    }

    const updates = { ...args };	// TODO double check
    delete updates.id;
    let existing, existingQueryParams = [], properties = {}, validationList = [];

		/*----------  Step 1 - Prep input for name, plural, and alternateNames updates ----------*/
  
	    // for each of these fields that contain updates, we're going to
	    //		- clean up text input
	    //		- add the new value to validationList for validation
	    //		- for alternate names, construct the object that keeps track of creations and deletions

	    // name updates
	    if (updates.hasOwnProperty('name')) {
	    	updates.name = updates.name.trim().toLowerCase();
	    	validationList.push(updates.name);
	    }

	    // plural updates
	    if (updates.hasOwnProperty('plural')) {
	    	updates.plural = updates.plural.trim().toLowerCase();
	    	validationList.push(updates.plural);
	    }

	    // alternate names updates
	    if (updates.hasOwnProperty('alternateNames_Create')) {
		  	updates.alternateNames_Create.filter(u => u && (typeof u === 'string'))
													  					.forEach(u => {
													  						validationList.push(u);
													  					});
			}

			if (updates.hasOwnProperty('alternateNames_Delete')) {
		  	updates.alternateNames_Delete.filter(u => u && (typeof u === 'string'));
		  }

	  /*----------  Step 2 - Validate input for name, plural, alternateNames updates ----------*/
	  
			// for each value in the validationList, build a where clause to check if we use these values in any other ingredient field
	    existingQueryParams = [].concat(...validationList.map(p => [ { name: p }, { plural: p }, { alternateNames_some: { name: p } }]));
	    existing = await ctx.db.query.ingredients({ where: { OR: existingQueryParams } }, RETURN_ALL_INGREDIENT_FIELDS); 
	    
	    let shouldCopyValue = (value) => {
	    	let shouldCopy = true;
	    	value = (typeof value === 'string') ? value.toLowerCase() : null;

	    	if (shouldCopy && updates.hasOwnProperty('name')) {
	    		shouldCopy = (value === updates.name) ? false : shouldCopy;
	    	}

	    	if (shouldCopy && updates.hasOwnProperty('plural')) {
    			shouldCopy = (value === updates.plural) ? false : shouldCopy;
	    	}

	    	if (shouldCopy && updates.hasOwnProperty('alternateNames_Create')) {
	    		shouldCopy = (updates.alternateNames_Create.filter(i => value === i).length > 0) ? false : shouldCopy;
	    	}

	    	return shouldCopy;
	    }

	    await Promise.all(existing.map(async ing => {
	    //existing.forEach(ing => {
	    	// TODO i'm sure this can be refactored in a more sensible way
	    	console.log('>>> ---------------------------'.blue);
	    	console.log({ name: ing.name, plural: ing.plural, alt: JSON.stringify(ing.alternateNames) });
	    	// we'll check each value field to see if this needs to be added into our updates, or if we can ignore it since its already included

	    	// ing.name
	    	// if this ingredient's name isn't already used already in any of the other update fields, then add it as an alternate name
				const name = ing.name.toLowerCase();
				if (shouldCopyValue(name)) {
	    		if (updates.hasOwnProperty('alternateNames_Create')) {
	    			updates.alternateNames_Create.push(name)
	    		} else {
	    			updates.alternateNames_Create = [ name ];
	    		}
	    	}

	    	// ing.plural
	    	// if this ingredient's plural value isn't already used already in any of the other update fields,
	    	// then add it as our current plural value if non-exists or as an alternate name
	    	const plural = (ing.plural) ? ing.plural.toLowerCase() : null;
	    	if (shouldCopyValue(plural)) {
	    		// TODO what if the ing has an existing plural, but the update doesn't

					if (!updates.hasOwnProperty('plural')) {
						// if we don't have a plural value already, add it here
	    			updates.plural = plural;
	    		} else {
	    			// otherwise just add it as a new alternate name
						if (updates.hasOwnProperty('alternateNames_Create')) {
		    			updates.alternateNames_Create.push(plural)
		    		} else {
		    			updates.alternateNames_Create = [ plural ];
		    		}
					}
		    }

	    	// alternateNames
	    	// for each alternate name, if it isn't already in use, add it as an alternate name to our current batch of updates
	    	if (ing.alternateNames.length > 0) {
	    		ing.alternateNames.forEach(n => {
			    	const alt = n.name.toLowerCase();
						if (shouldCopyValue((alt))) (updates.alternateNames_Create = updates.alternateNames_Create || []).push(alt);
	    		});
	    	}

	    	// TODO properties
	    	// transfer any positive values

	  		// TODO parent
	    	// assign the parent to the related ingredient if its not already there

	    	// TODO relatedIngredients
	    	// transfer

	    	// TODO substitutes
	    	// transfer

	    	// TODO references
	    	// transfer

	    	// TODO will need a way to restore this is anything else fails in the update process
	    	const removed = await ctx.db.mutation.deleteIngredient({
	        where: {
	          id: ing.id
	        },
	      }, `{ id }`);
	      console.log(removed);

	    	console.log('--------------------------- <<<'.blue);
	    }));

	   

		/*----------  Step 3 - Update Relationships  ----------*/
		
	    // parent assignment
	    if (updates.hasOwnProperty('parentID') || updates.hasOwnProperty('parentName')) {
	    	// TODO handle parent create/connect assignments
	    }

	    // related ingredient updates
	    const relatedIngredients = {
		  	...(updates.relatedIngredients_Connect && { connect: updates.relatedIngredients_Connect.map(u => { return { id: u }; }) }),
		  	...(updates.relatedIngredients_Disconnect && { disconnect: updates.relatedIngredients_Disconnect.map(u => { return { id: u }; }) })
			};

			if (updates.relatedIngredients_Connect) delete updates.relatedIngredients_Connect;
			if (updates.relatedIngredients_Disconnect) delete updates.relatedIngredients_Disconnect;

			// substitute updates
	    const substitutes = {
		  	...(updates.substitutes_Connect && { connect: updates.substitutes_Connect.map(u => { return { id: u }; }) }),
		  	...(updates.substitutes_Disconnect && { disconnect: updates.substitutes_Disconnect.map(u => { return { id: u }; }) })
			};

			if (updates.substitutes_Connect) delete updates.substitutes_Connect;
			if (updates.substitutes_Disconnect) delete updates.substitutes_Disconnect;

			// references updates
	    if (updates.hasOwnProperty('references')) {
	    	console.log('...REFERENCES'.yellow);
	    	// TODO
	    }

    const alternateNames = {
	  	...(updates.alternateNames_Create && {
						create: updates.alternateNames_Create.map(u => { return { name: u.trim().toLowerCase() }; })
	  			}),
	  	...(updates.alternateNames_Delete && {
	  				delete: updates.alternateNames_Delete.map(u => { return { name: u.trim().toLowerCase() }; })
	  			})
		};

    console.log(alternateNames.create);


		 // clean up alternate name create/delete strings now that we're done with merging
    if (updates.alternateNames_Create) delete updates.alternateNames_Create;
		if (updates.alternateNames_Delete) delete updates.alternateNames_Delete;

	  // update the remainder of the fields
	  /*const ingredient = {
	        	relatedIngredients,
	        	substitutes,
	        	...updates					// update any other changed ingredient fields

	        	,id: args.id // debug only
	        };
    ingredient.properties = {
				meat: false,
			  poultry: false,
			  fish: false,
			  dairy: false,
			  soy: false,
			  gluten: false,
			  __typename: "Property"
			};
		ingredient.alternateNames = alternateNames;
		*/
	  const ingredient = await ctx.db.mutation.updateIngredient(
      {
        data: {
        	properties,
        	alternateNames,
        	relatedIngredients,
        	substitutes,
        	...updates					// update any other changed ingredient fields
        },
        where: {
          id: args.id
        },
      },
      RETURN_ALL_INGREDIENT_FIELDS
    );
    console.log('___________________________'.green);

    console.log(ingredient);
    return ingredient;
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
