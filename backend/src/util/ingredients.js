import { determinePluralization } from './strings';
import { GET_BASIC_INGREDIENT_FIELDS } from '../graphql/fragments';

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
		console.log(`finished looking up ${ value }`.cyan);
		return { id: existing[0].id };
	}

	console.log(`finished looking up ${ value }`.cyan);
	return null;
};

export default { lookupIngredient };
