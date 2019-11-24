import { determinePluralization } from './strings';
import { GET_BASIC_INGREDIENT_FIELDS, GET_ID } from '../graphql/fragments';

// TODO cache these values to save lookups
export const lookupIngredient = async (ctx, value) => {
	console.log(`looking up ingredient ${ value }....`);
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
		.catch((err) => { console.log(err); });

	if (existing && (existing.length > 0)) {
		console.log({ existing });
		return { id: existing[0].id };
	}

	return null;
};

export const updateIngredient = async (ctx, data, where, ing, retryAttempts = 3) => {
	console.log(`updateIngredient ${ retryAttempts }`.cyan);
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

export default { lookupIngredient };
