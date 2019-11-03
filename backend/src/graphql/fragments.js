export const GET_ALL_CATEGORY_FIELDS = `
	{
		id
		evernoteGUID
		name
	}
`;

export const GET_ALL_TAG_FIELDS = `
	{
		id
		evernoteGUID
		name
	}
`;

export const GET_ALL_NOTE_FIELDS = `
	{
		id
		evernoteGUID
		title
		source
		categories
		tags
		image
		content
		ingredients {
			blockIndex
			id
			reference
			isParsed
			parsed {
				type
				value
				ingredient {
					id
					name
				}
			}
		}
		instructions {
			id
			blockIndex
			reference
		}
	}
`;

export const GET_NOTE_CONTENT_FIELDS = `
	{
		id
		content
		title
		ingredients {
			blockIndex
			id
			reference
			isParsed
			parsed {
				value
				ingredient {
					id
					name
				}
			}
		}
		instructions {
			id
			blockIndex
			reference
		}
	}
`;

export const GET_ALL_INGREDIENT_FIELDS = `
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
		references {
			id
			reference
		}
	}
`;

export const GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION = `
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

export const GET_ALL_RECIPE_FIELDS = `
	{
		id
		evernoteGUID
		title
		source
		categories {
			id
			name
		}
		tags {
			id
			name
		}
		image
		ingredients {
			id
			blockIndex
			lineIndex
			reference
			isParsed
			parsed {
				id
				rule
				type
				value
				ingredient {
					id
					name
				}
			}
		}
		instructions {
			id
			blockIndex
			reference
		}
	}
`;

export const GET_ALL_RECIPE_FIELDS_FOR_VALIDATION = `
	{
		id
		evernoteGUID
		title
		source
	}
`;

export default [
	GET_ALL_CATEGORY_FIELDS,
	GET_ALL_TAG_FIELDS,
	GET_ALL_NOTE_FIELDS,
	GET_NOTE_CONTENT_FIELDS,
	GET_ALL_INGREDIENT_FIELDS,
	GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION,
	GET_ALL_RECIPE_FIELDS,
	GET_ALL_RECIPE_FIELDS_FOR_VALIDATION,
];
