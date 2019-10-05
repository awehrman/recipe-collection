import { hasProperty } from '../lib/util';

const GET_ALL_INGREDIENT_FIELDS = `
	{
		alternateNames {
			name
		}
		id
		isValidated
		isComposedIngredient
		name
		parent {
			id
		}
		plural
		properties {
			meat
		  poultry
		  fish
		  dairy
		  soy
		  gluten
		}
		relatedIngredients {
			id
			name
		}
		substitutes {
			id
			name
		}
	}
`;

const GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION = `
	{
		alternateNames {
			name
		}
		isComposedIngredient
		isValidated
		id
		name
		parent {
			id
		}
		plural
		properties {
			meat
		  poultry
		  fish
		  dairy
		  soy
		  gluten
		}
	}
`;

export default {
	Query: {
		ingredientAggregate: async (parent, args, ctx) => {
			console.log('ingredientAggregate');
			const ingredientsCount = await ctx.prisma.ingredientsConnection().aggregate().count();
			const newIngredientsCount = await ctx.prisma.ingredientsConnection({ where: { isValidated: false } }).aggregate().count();

			return {
				ingredientsCount,
				newIngredientsCount,
			};
		},
		ingredient: async (parent, args, ctx) => {
			const { where } = args || {};
			const { id } = where || {};
			return ctx.prisma.ingredient({ id }).$fragment(GET_ALL_INGREDIENT_FIELDS);
		},
		ingredients: async (parent, args, ctx) => {
			console.warn('ingredients');
			const ingredients = await ctx.prisma.ingredients().$fragment(GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION);
			console.log(ingredients.map(i => i.name));
			return ingredients;
		},
	},

	Mutation: {
		createIngredient: async (parent, args, ctx, info) => {
			console.log('createIngredient');
			const {
				alternateNames,
				isComposedIngredient,
				isValidated,
				name,
				parentID,
				parentName,
				plural,
				properties,
				relatedIngredients,
				references,
				substitutes,
			} = args;

			let ingredient = {
				name: (name && (name.length > 0)) ? name.trim().toLowerCase() : '',
				plural: (plural && (plural.length > 0)) ? plural.trim().toLowerCase() : null,
				isValidated: isValidated || false,
				isComposedIngredient: isComposedIngredient || false,
			};

			ingredient.properties = (!properties)
				? {
					create: {
						meat: false,
						poultry: false,
						fish: false,
						dairy: false,
						soy: false,
						gluten: false,
					},
				}
				: { create: properties };

			if (parentID) {
				ingredient.parent = { connect: { id: parentID } };
			} else if (parentName) {
				// TODO test with existing ingredient to make sure this doesn't duplicate
				// if not found, then create ingredient with parent parentName
				ingredient.parent = {
					create: {
						name: parentName,
						properties: { create: properties },
					},
				};
			}

			if (alternateNames && alternateNames.length > 0) {
				ingredient.alternateNames = { create: alternateNames.map(a => ({ name: (a && (a.length > 0)) ? a.toLowerCase() : '' })) };
			}

			if (relatedIngredients && relatedIngredients.length > 0) {
				ingredient.relatedIngredients = { connect: relatedIngredients.map(i => ({ id: i })) };
			}

			if (substitutes && substitutes.length > 0) {
				ingredient.substitutes = { connect: substitutes.map(i => ({ id: i })) };
			}

			if (references && references.length > 0) {
				ingredient.references = { connect: references.map(i => ({ id: i })) };
			}

			try {
				ingredient = await ctx.prisma.createIngredient({ ...ingredient }, info);
				// TODO look into why prisma isn't returning properties
				if (!ingredient.properties) {
					ingredient.properties = (!properties)
						? {
							meat: false,
							poultry: false,
							fish: false,
							dairy: false,
							soy: false,
							gluten: false,
						}
						: { ...properties };
				}
				console.log(ingredient);

				return ingredient;
			} catch (err) {
				console.log(err);
			}
			return null;
		},

		deleteIngredient: async () => {
			console.log('deleteIngredient');
			// TODO
		},

		updateIngredient: async (parent, args, ctx) => {
			console.log('updateIngredient');

			if (!hasProperty(args, 'id')) {
				throw new Error('Ingredient update requires an ingredient id to update!');
			}

			const updates = { ...args };	// TODO double check
			delete updates.id;
			let existing = null;
			let existingQueryParams = [];
			const properties = {};
			const validationList = [];

			/* ----------  Step 1 - Prep input for name, plural, and alternateNames updates ---------- */

			// for each of these fields that contain updates, we're going to
			//		- clean up text input
			//		- add the new value to validationList for validation
			//		- for alternate names, construct the object that keeps track of creations and deletions
			// name updates
			if (hasProperty(updates, 'name')) {
				updates.name = updates.name.trim().toLowerCase();
				validationList.push(updates.name);
			}

			// plural updates
			if (hasProperty(updates, 'plural')) {
				updates.plural = updates.plural.trim().toLowerCase();
				validationList.push(updates.plural);
			}

			// alternate names updates
			if (hasProperty(updates, 'alternateNames_Create')) {
				updates.alternateNames_Create.filter(u => u && (typeof u === 'string'))
					.forEach(u => validationList.push(u));
			}

			if (hasProperty(updates, 'alternateNames_Delete')) {
				updates.alternateNames_Delete.filter(u => u && (typeof u === 'string'));
			}

			// alternate names updates
			if (hasProperty(updates, 'alternateNames_Create')) {
				updates.alternateNames_Create.filter(u => u && (typeof u === 'string'))
					.forEach(u => validationList.push(u));
			}

			if (hasProperty(updates, 'alternateNames_Delete')) {
				updates.alternateNames_Delete.filter(u => u && (typeof u === 'string'));
			}

			/* ----------  Step 2 - Validate input for name, plural, alternateNames updates ---------- */

			// for each value in the validationList, build a where clause to check if we use these values in any other ingredient field
			existingQueryParams = [].concat(...validationList.map(p => [
				{ name: p },
				{ plural: p },
				{ alternateNames_some: { name: p } },
			]));
			// TODO check syntax after moving from prisma bindings to prisma client
			// existing = await ctx.prisma.ingredients({ where: { OR: existingQueryParams } }, GET_ALL_INGREDIENT_FIELDS);
			existing = await ctx.prisma.ingredient({ OR: existingQueryParams }).$fragment(GET_ALL_INGREDIENT_FIELDS);

			const shouldCopyValue = (value) => {
				let shouldCopy = true;
				const adjustedValue = (typeof value === 'string') ? value.toLowerCase() : null;

				if (shouldCopy && hasProperty(updates, 'name')) {
					shouldCopy = (adjustedValue === updates.name) ? false : shouldCopy;
				}

				if (shouldCopy && hasProperty(updates, 'plural')) {
					shouldCopy = (adjustedValue === updates.plural) ? false : shouldCopy;
				}

				if (shouldCopy && hasProperty(updates, 'alternateNames_Create')) {
					shouldCopy = (updates.alternateNames_Create.filter(i => adjustedValue === i).length > 0) ? false : shouldCopy;
				}

				return shouldCopy;
			};

			await Promise.all(existing.map(async (ing) => {
				// TODO i'm sure this can be refactored in a more sensible way
				console.log('>>> ---------------------------'.blue);
				// eslint-disable-next-line
				console.log({ name: ing.name, plural: ing.plural, alt: JSON.stringify(ing.alternateNames) });
				// we'll check each value field to see if this needs to be added into our updates, or if we can ignore it since its already included

				// ing.name
				// if this ingredient's name isn't already used already in any of the other update fields, then add it as an alternate name
				const name = ing.name.toLowerCase();
				if (shouldCopyValue(name)) {
					if (hasProperty(updates, 'alternateNames_Create')) {
						updates.alternateNames_Create.push(name);
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

					if (!hasProperty(updates, 'plural')) {
						// if we don't have a plural value already, add it here
						updates.plural = plural;
					} else if (hasProperty(updates, 'alternateNames_Create')) {
					// otherwise just add it as a new alternate name
						updates.alternateNames_Create.push(plural);
					} else {
						updates.alternateNames_Create = [ plural ];
					}
				}

				// alternateNames
				// for each alternate name, if it isn't already in use, add it as an alternate name to our current batch of updates
				if (ing.alternateNames.length > 0) {
					ing.alternateNames.forEach((n) => {
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
				// TODO check syntax after moving from prisma bindings to prisma client
				const removed = await ctx.prisma.deleteIngredient({ where: { id: ing.id } }, '{ id }');
				console.log(removed);

				console.log('--------------------------- <<<'.blue);
			}));

			/* ----------  Step 3 - Update Relationships  ---------- */

			// parent assignment
			if (hasProperty(updates, 'parentID') || hasProperty(updates, 'parentName')) {
				// TODO handle parent create/connect assignments
			}

			// related ingredient updates
			const relatedIngredients = {
				...(updates.relatedIngredients_Connect && { connect: updates.relatedIngredients_Connect.map(u => ({ id: u })) }),
				...(updates.relatedIngredients_Disconnect && { disconnect: updates.relatedIngredients_Disconnect.map(u => ({ id: u })) }),
			};

			if (updates.relatedIngredients_Connect) delete updates.relatedIngredients_Connect;
			if (updates.relatedIngredients_Disconnect) delete updates.relatedIngredients_Disconnect;

			// substitute updates
			const substitutes = {
				...(updates.substitutes_Connect && { connect: updates.substitutes_Connect.map(u => ({ id: u })) }),
				...(updates.substitutes_Disconnect && { disconnect: updates.substitutes_Disconnect.map(u => ({ id: u })) }),
			};

			if (updates.substitutes_Connect) delete updates.substitutes_Connect;
			if (updates.substitutes_Disconnect) delete updates.substitutes_Disconnect;

			// references updates
			if (hasProperty(updates, 'references')) console.log('...REFERENCES'.yellow);
			// TODO

			const alternateNames = {
				...(updates.alternateNames_Create && { create: updates.alternateNames_Create.map(u => ({ name: u.trim().toLowerCase() })) }),
				...(updates.alternateNames_Delete && { delete: updates.alternateNames_Delete.map(u => ({ name: u.trim().toLowerCase() })) }),
			};

			console.log(alternateNames.create);

			// clean up alternate name create/delete strings now that we're done with merging
			if (updates.alternateNames_Create) delete updates.alternateNames_Create;
			if (updates.alternateNames_Delete) delete updates.alternateNames_Delete;

			// TODO check syntax after moving from prisma bindings to prisma client
			const ingredient = await ctx.prisma.updateIngredient(
				{
					data: {
						properties,
						alternateNames,
						relatedIngredients,
						substitutes,
						...updates,					// update any other changed ingredient fields
					},
					where: { id: args.id },
				}, GET_ALL_INGREDIENT_FIELDS,
			);

			console.log('___________________________'.green);

			console.log(ingredient);
			return ingredient;
		},
	},
};
