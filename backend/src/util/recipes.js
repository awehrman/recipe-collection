/*
import { lookupIngredient } from './ingredients';
import { determinePluralization } from './strings';
import { removeNote } from './notes';
import { parseIngredients } from './parser';
import { GET_ID, GET_ALL_RECIPE_FIELDS } from '../graphql/fragments';

export const saveParsedSegment = async (ctx, parsed, isCreateIngredient = false) => {
	const segment = { ...parsed };
	if (parsed.type === 'ingredient') {
		// connect to any existing ingredients
		const existing = await lookupIngredient(ctx, parsed.value);

		if (existing) {
			segment.ingredient = { connect: { id: existing.id } };
			console.log('existing!'.green);
			console.log({ connect: { id: existing.id } });
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
			const id = await ctx.prisma.createIngredient({ ...data }).$fragment(GET_ID)
				.catch((err) => {
					// TODO i feel like we're always ending up down here; very suspicious
					segment.retry = true;
					console.log(`${ name }`.red);
					console.log({ ...data });
					console.log({ err });
				});

			if (id) {
				segment.ingredient = { connect: { id } };
				console.log('!'.blue);
				console.log(segment.ingredient);
			}
		}
	}

	if (!segment.retry) {
		const { id } = await ctx.prisma.createParsedSegment({ ...segment })
			.$fragment(GET_ID)
			.catch((err) => {
				console.log('A');
				throw err;
			});

		return { id };
	}
	console.log(`retrying ${ parsed.value }...`.red);
	const parsedSegment = await saveParsedSegment(ctx, parsed, isCreateIngredient);
	console.log({ parsedSegment });
	return parsedSegment;
};

export const createRecipe = async (ctx, note) => {
	console.log('createRecipe'.green);
	const data = {
		evernoteGUID: note.evernoteGUID || null,
		title: note.title,
		source: note.source,
		// TODO categories
		// TODO tags
		image: note.image,
	};

	// TODO need to re-save ingredients and instructions
	const resolveIngredients = parseIngredients(ctx, note.ingredients, true);
	const resolveInstructions = this.saveInstructions(ctx, note.instructions);

	const { ingredients, instructions } = await Promise.all([ resolveIngredients, resolveInstructions ])
		.then((ids) => ({
			ingredients: ids[0],
			instructions: ids[1],
		}))
		.catch((err) => { throw err; });

	data.ingredients = { connect: ingredients };
	data.instructions = { connect: instructions };

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
		await removeNote(ctx, note);

		return recipe;
	});

	const notesRes = await Promise.all(resolveRecipes)
		.catch((err) => { throw err; });
	return notesRes;
};

export const saveInstructions = async (ctx, instructions) => {
	console.log('saveInstructions'.blue);
	const resolveInstructions = instructions.map(
		async (line) => ctx.prisma
			.createRecipeInstruction({ ...line })
			.$fragment(GET_ID)
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
			const updated = await ctx.prisma.updateIngredient({
				data: {
					references: {
						create: {
							recipeID: { connect: { id } },
							reference: { connect: { id: line.id } },
						},
					},
				},
				where: { id: ing.id },
			}).$fragment(GET_ID)
				.catch((err) => { throw err; });

			return updated;
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
	createRecipe,
	createRecipes,
	saveParsedSegment,
	saveInstructions,
	updateRecipeReference,
	updateIngredientReferences,
};
*/
