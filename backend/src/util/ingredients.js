import { determinePluralization } from './strings';
import { GET_BASIC_INGREDIENT_FIELDS, GET_ID } from '../graphql/fragments';

export const lookupIngredient = async (ctx, value) => {
	const { name, plural } = determinePluralization(value);
	const values = [ ...new Set([
		name,
		plural,
		value,
	]) ].filter((v) => v);

	// check if this ingredient exists
	const existing = await ctx.prisma.ingredients({
		where: {
			OR: [
				{ name_in: values },
				{ plural_in: values },
				{ alternateNames_some: { name_in: values } },
			],
		},
	}).$fragment(GET_BASIC_INGREDIENT_FIELDS)
		.catch((err) => { console.log({ err }); });

	if (existing && (existing.length > 0)) {
		return { id: existing[0].id };
	}

	return null;
};

export const findOrCreateIngredient = async (ctx, value) => {
	const { name, plural } = determinePluralization(value);
	const values = [ ...new Set([
		name,
		plural,
		value,
	]) ].filter((v) => v);

	// check if this ingredient exists
	const existing = await ctx.prisma.ingredients({
		where: {
			OR: [
				{ name_in: values },
				{ plural_in: values },
				{ alternateNames_some: { name_in: values } },
			],
		},
	}).$fragment(GET_BASIC_INGREDIENT_FIELDS)
		.catch((err) => { console.log({ err }); });

	if (existing && (existing.length > 0)) {
		return { id: existing[0].id };
	}

	// eslint-disable-next-line no-use-before-define
	const newIng = await createIngredient(ctx, { name }, name);
	return { id: newIng };
};

export const updateIngredient = async (ctx, data, where, ing, retryAttempts = 3) => {
	if (retryAttempts < 3) {
		console.log(`updateIngredient ${ retryAttempts }`.cyan);
		console.log({ data });
	}
	if (retryAttempts === 0) { return null; }

	let retry = false;
	const id = await ctx.prisma.updateIngredient({
		data,
		where,
	}).$fragment(GET_ID)
		.catch((err) => {
			console.log({ err });
			console.log({ ing });
			retry = true;
		});

	if (id && !retry) {
		return id;
	}

	// try again until we get an ingredient
	const nextAttempt = await updateIngredient(ctx, data, where, ing, (retryAttempts - 1));
	return nextAttempt;
};

export const createIngredient = async (ctx, data, name, retryAttempts = 3) => {
	console.log(`createIngredient ${ name } - ${ retryAttempts }`.cyan);
	if (retryAttempts === 0) { return null; }

	let retry = false;
	const properties = {
		create: {
			meat: false,
			poultry: false,
			fish: false,
			dairy: false,
			soy: false,
			gluten: false,
		},
	};
	const created = await ctx.prisma.createIngredient({
		properties,
		...data,
	})
		.$fragment(GET_ID)
		.catch(() => {
			retry = true;
		});

	if (created && !retry) {
		return created.id;
	}

	// lookup ingredient if we didn't successfully create the ingredient
	const connect = await lookupIngredient(ctx, name);
	console.log(`found ${ name } once i looked it up again!`.magenta);
	if (connect) {
		return connect.id;
	}

	// try again until we get an ingredient
	const nextAttempt = await createIngredient(ctx, data, name, (retryAttempts - 1));
	return nextAttempt;
};

export const processIngredients = async (ctx, notes, isCreateIngredient = false) => {
	let ingredients = [];
	const lines = notes.map((note) => note.ingredients.filter((line) => line.isParsed && line.parsed)).flat();
	lines.forEach((line) => {
		const newIngredients = line.parsed.filter((p) => p.type === 'ingredient')
			.map((p) => p.value);
		ingredients.push([ ...newIngredients ]);
	});

	ingredients = [ ...new Set(ingredients.flat()) ];

	// go thru and create these ingredients
	if (isCreateIngredient) {
		const resolveIngredients = ingredients.map(async (value) => {
			const ing = await findOrCreateIngredient(ctx, value);
			return { ...ing };
		});

		ingredients = await Promise.all(resolveIngredients)
			.catch((err) => { console.log(err); });
	}

	return {
		ingredients,
		notes,
	};
};

export default {
	lookupIngredient,
	updateIngredient,
	createIngredient,
	processIngredients,
};
