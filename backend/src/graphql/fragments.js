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
		content
		evernoteGUID
		image
		ingredients {
			id
			blockIndex
			lineIndex
			isParsed
			parsed {
				id
				ingredient {
					id
					isValidated
					name
					plural
				}
				rule
				type
				value
			}
			reference
			rule
		}
		instructions {
			id
			blockIndex
			reference
		}
		source
		title
	}
`;

export const GET_BASIC_NOTE_CONTENT_FIELDS = `
	{
		id
		content
		title
	}
`;

export const GET_NOTE_CONTENT_FIELDS = `
	{
		id
		content
		title
		ingredients {
			id
			blockIndex
			isParsed
			lineIndex
			parsed {
				id
				ingredient {
					id
					isValidated
					name
				}
				rule
				type
				value
			}
			reference
			rule
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
			recipe {
				id
			}
			line {
				reference
			}
		}
	}
`;

export const GET_BASIC_INGREDIENT_FIELDS = `
	{
		id
		name
		isValidated
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
		references {
			id
			recipe {
				id
			}
			line {
				reference
			}
		}
	}
`;

export const GET_ALL_RECIPE_FIELDS = `
	{
		id
		evernoteGUID
		title
		source
		image
		ingredients {
			id
			blockIndex
			isParsed
			lineIndex
			parsed {
				id
				ingredient {
					id
					isValidated
					name
				}
				rule
				type
				value
			}
			rule
			reference
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

export const GET_ID = `
	{
		id
	}
`;

export const GET_EVERNOTE_GUID = `
	{
		evernoteGUID
		title
		id
	}
`;

export const GET_BASIC_RECIPE_INGREDIENT_FIELDS = `
	{
		id
		reference
		isParsed
	}
`;

export const GET_PARSED_FIELDS = `
	{
		id
		type
		value
		ingredient {
			id
			name
		}
	}
`;


export const GET_PARSING_ERRORS = `
	{
		id
		reference
	}
`;


export default [
	GET_ALL_CATEGORY_FIELDS,
	GET_ALL_TAG_FIELDS,
	GET_ALL_NOTE_FIELDS,
	GET_BASIC_NOTE_CONTENT_FIELDS,
	GET_NOTE_CONTENT_FIELDS,
	GET_BASIC_INGREDIENT_FIELDS,
	GET_ALL_INGREDIENT_FIELDS,
	GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION,
	GET_ALL_RECIPE_FIELDS,
	GET_ALL_RECIPE_FIELDS_FOR_VALIDATION,
	GET_ID,
	GET_BASIC_RECIPE_INGREDIENT_FIELDS,
	GET_PARSED_FIELDS,
	GET_EVERNOTE_GUID,
	GET_PARSING_ERRORS,
];
