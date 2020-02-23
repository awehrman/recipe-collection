import { lookupIngredient, updateIngredient, createIngredient } from './ingredients';
import { determinePluralization } from './strings';
import { GET_ID, GET_ALL_RECIPE_FIELDS } from '../graphql/fragments';

export const createParsedSegment = async (ctx, parsed, isCreateIngredient = false) => {
	const segment = { ...parsed };

	// for ingredient segments, lookup these ingredients from the db
	if (segment.type === 'ingredient') {
		const existing = await lookupIngredient(ctx, parsed.value);
		if (existing) {
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
			// if we're allowed to create the ingredient, go ahead and create it then connect it
			const id = await createIngredient(ctx, data, name);
			if (id) {
				segment.ingredient = { connect: { id } };
			}
		}
	}

	if (segment.id) {
		delete segment.id;
	}

	const { id } = await ctx.prisma.createParsedSegment({ ...segment })
		.$fragment(GET_ID)
		.catch((err) => {
			console.log({ err });
			return { id: null };
		});
	return { id };
};

export const createRecipe = async (ctx, note) => {
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

		if (ingLine.parsed && (ingLine.parsed.length === 0)) {
			delete ingLine.parsed;
			ingLine.isParsed = false;
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
	const { id } = recipe;
	const resolveIngredients = recipe.ingredients.map(async (line) => {
		if (!line.isParsed || !line.parsed) {
			return line;
		}

		// then we need to pick out the ingredients from the parsed segment
		// and update those with our references
		const ingredients = line.parsed.filter((p) => p.ingredient);
		const resolveIngredientReferences = ingredients.map(async (ing) => {
			const data = {
				references: {
					create: [ {
						recipe: { connect: { id } }, 				// RecipeCreateOneInput!
						line: { connect: { id: line.id } }, // RecipeIngredientCreateOneInput!
					} ],
				},
			};
			const where = { id: ing.ingredient.id };
			const updated = await updateIngredient(ctx, data, where, ing.ingredient);
			if (updated) {
				return updated;
			}
			console.warn(`couldn't update ingredient ${ ing.ingredient.name }!!!`.red);
			// TODO do something?
			return null;
		});

		const refs = await Promise.all(resolveIngredientReferences)
			.catch((err) => { throw err; });
		return refs;
	});

	return Promise.all(resolveIngredients)
		.catch((err) => { throw err; });
};

export const updateIngredientReferences = async (ctx, recipes) => {
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
