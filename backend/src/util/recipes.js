import { lookupIngredient, updateIngredient } from './ingredients';
import { determinePluralization } from './strings';
import { GET_ID, GET_ALL_RECIPE_FIELDS } from '../graphql/fragments';

export const createParsedSegment = async (ctx, parsed, isCreateIngredient = false) => {
	const segment = { ...parsed };

	// for ingredient segments, lookup these ingredients from the db
	if (parsed.type === 'ingredient') {
		const existing = await lookupIngredient(ctx, parsed.value);
		console.log({
			value: parsed.value,
			existing,
		});
		if (existing) {
			console.log(`existing ingredient ${ parsed.value }!`.green);
			// connect any existing ingredient
			segment.ingredient = { connect: { id: existing.id } };
		} else if (!existing && isCreateIngredient) {
			const { name, plural } = determinePluralization(parsed.value);
			const data = {
				name,
				plural,
				properties: {
					create: {
						meat: false,
						poultry: false,
						fish: false,
						dairy: false,
						soy: false,
						gluten: false,
					},
				},
			};
			console.log(`didn't find "${ name }" so attempting to create it....`.yellow);
			// if we're allowed to create the ingredient, go ahead and create it then connect it
			const { id } = await ctx.prisma.createIngredient({ ...data }).$fragment(GET_ID)
				.catch(async () => {
				// this can often fail due to how graphql is batching our queries to prisma
				// often a simply retry is successful but this could use a deeper look
					const retry = await lookupIngredient(ctx, name);
					if (retry) {
						console.log(`found ${ name } 2nd time around...`.magenta);
						console.log({ retry });
						return retry;
					}
					// TODO handle situations where a secondary retry isn't enough
					console.log(`${ name } - fuck whoops`.red);
					return null;
				});
			// eslint-disable-next-line
			console.log({ name, id });

			if (id) {
				segment.ingredient = { connect: { id } };
				console.log(`created ingredient "${ parsed.value }"`.green);
			} else {
				console.log(`NOPE COULDN'T MAKE "${ parsed.value }"`.red);
			}
		}
	}

	if (segment.id) {
		delete segment.id;
	}

	console.log(`creating parsed segment ${ parsed.value }!`.magenta);
	const { id } = await ctx.prisma.createParsedSegment({ ...segment })
		.$fragment(GET_ID)
		.catch((err) => {
			throw err;
		});
	return { id };
};

export const createRecipe = async (ctx, note) => {
	console.log('createRecipe'.green);
	const data = {
		evernoteGUID: note.evernoteGUID,
		image: note.image,
		ingredients: { connect: note.ingredients },
		instructions: { connect: note.instructions },
		// TODO categories and tags
		source: note.source,
		title: note.title,
	};
	delete data.id;
	const recipe = await ctx.prisma.createRecipe({ ...data }).$fragment(GET_ALL_RECIPE_FIELDS);
	return recipe;
};

export const createRecipes = async (ctx, notes) => {
	console.log('createRecipes'.cyan);

	// then go through each note and save out their ingredient and instruction lines
	const resolveRecipes = notes.map(async (note) => {
		// create the recipe
		const recipe = await createRecipe(ctx, note);
		// then remove the note
		await ctx.prisma.deleteNote({ id: note.id });

		return recipe;
	});

	const notesRes = await Promise.all(resolveRecipes)
		.catch((err) => { throw err; });
	return notesRes;
};

export const createIngredientLines = async (ctx, ingredients, isCreateIngredient = false) => {
	console.log('createIngredientLines'.cyan);
	const resolveIngredients = ingredients.map(async (line) => {
		const ingLine = { ...line };

		if (line.isParsed && line.parsed) {
			// otherwise we'll need to create the parsed segment first
			const resolveParsedSegments = line.parsed.map(
				async (p) => createParsedSegment(ctx, p, isCreateIngredient),
			);

			const parsed = await Promise.all(resolveParsedSegments)
				.catch((err) => console.log(err));
			ingLine.parsed = { connect: parsed };
		}

		if (ingLine.id) {
			delete ingLine.id;
		}

		if (!ingLine.rule) {
			ingLine.rule = '';
		}

		const ing = await ctx.prisma
			.createRecipeIngredient({ ...ingLine })
			.$fragment(GET_ID)
			.catch((err) => { throw err; });

		return ing;
	});
	const ids = await Promise.all(resolveIngredients)
		.catch((err) => { throw err; });
	return ids;
};

export const createInstructions = async (ctx, instructions) => {
	console.log('createInstructions'.blue);
	const resolveInstructions = instructions.map(
		async (line) => ctx.prisma.createRecipeInstruction({
			blockIndex: line.blockIndex,
			reference: line.reference,
		}).$fragment(GET_ID)
			.catch((err) => { throw err; }),
	);

	const ids = await Promise.all(resolveInstructions)
		.catch((err) => { throw err; });
	return ids;
};

export const updateRecipeReference = async (ctx, recipe) => {
	console.log('updateRecipeReference'.yellow);
	const { id } = recipe;
	const resolveIngredients = recipe.ingredients.map(async (line) => {
		if (!line.isParsed || !line.parsed) {
			return line;
		}

		// then we need to pick out the ingredients from the parsed segment
		// and update those with our references
		const ingredients = line.parsed.filter((p) => p.ingredient);
		const resolveIngredientReferences = ingredients.map(async (ing) => {
			console.log(`${ ing.ingredient.name } ${ ing.ingredient.id }`.magenta);
			const data = {
				references: {
					create: [ {
						recipe: { connect: { id } },
						line: { connect: { id: line.id } },
					} ],
				},
			};
			const where = { id: ing.ingredient.id };
			const updated = await updateIngredient(ctx, data, where, ing);
			if (updated) {
				return updated;
			}
			console.warn(`couldn't update ingredient ${ ing.name }!`.red);
			// TODO do something?
			return null;
		});

		return Promise.all(resolveIngredientReferences)
			.catch((err) => { throw err; });
	});

	return Promise.all(resolveIngredients)
		.catch((err) => { throw err; });
};

export const updateIngredientReferences = async (ctx, recipes) => {
	console.log('updateIngredientReferences'.yellow);

	const resolveReferences = recipes.map(async (recipe) => updateRecipeReference(ctx, recipe));

	await Promise.all(resolveReferences)
		.catch((err) => { throw err; });

	return recipes;
};

export default {
	createIngredientLines,
	createInstructions,
	createParsedSegment,
	updateIngredientReferences,
	updateRecipeReference,
};
