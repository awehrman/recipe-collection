import gql from 'graphql-tag';

export default gql`
	type AlternateName {
		id: ID!
		name: String!
	}

	type Category {
		id: String!
		evernoteGUID: String
		name: String!
	}

	type Container {
		id: String!
		ingredientID: String
		ingredients: [ ContainerIngredient ]!
		isExpanded: Boolean!
		label: String!
		referenceCount: Int!
	}

	type ContainerIngredient {
		hasParent: Boolean!
		id: String!
		isValidated: Boolean!
		name: String!
		plural: String
		properties: Properties!
		referenceCount: Int!
	}

	type ContainersResponse {
    containers: [ Container ]
  }

	type Ingredient {
		id: ID!
		name: String!
		plural: String
		alternateNames: [ AlternateName! ]!
		properties: Properties!
		isComposedIngredient: Boolean!
		isValidated: Boolean!
		parent: Ingredient
		relatedIngredients: [ Ingredient! ]!
		substitutes: [ Ingredient! ]!
		references: [ RecipeIngredient! ]!
	}

	type IngredientAggregate {
		ingredientsCount: Int!
		newIngredientsCount: Int!
	}

	type IngredientResponse {
		errors: [ String ]
		ingredient: Ingredient
	}

	type RecipeResponse {
		errors: [ String ]
		recipe: Recipe
	}

	type EvernoteResponse {
		errors: [ String ]
		notes: [ Note ]
	}

	type Note {
		id: ID!
		evernoteGUID: String
		title: String!
		source: String

		categories: [ String ]
		tags: [ String ]

		image: String
		content: String!
	}

	type ParsedSegment {
		id: ID!
		rule: String!
		type: String!
		value: String!
		ingredient: Ingredient
	}

	type Properties {
		id: String!
		meat: Boolean!
		poultry: Boolean!
		fish: Boolean!
		dairy: Boolean!
		soy: Boolean!
		gluten: Boolean!
	}

	type PropertiesCreateInput {
		id: String!
		meat: Boolean!
		poultry: Boolean!
		fish: Boolean!
		dairy: Boolean!
		soy: Boolean!
		gluten: Boolean!
	}

	type Recipe {
		id: ID!
		evernoteGUID: String
		title: String!
		source: String
		categories: [ Category! ]!
		tags: [ Tag! ]!
		image: String
		ingredients: [ RecipeIngredient! ]!
		instructions: [ RecipeInstruction! ]!
	}

	type RecipeAggregate {
		recipesCount: Int!
	}

	type RecipeIngredient {
		id: ID!
		blockIndex: Int!
		lineIndex: Int!
		reference: String!
		isParsed: Boolean!
		parsed: [ ParsedSegment! ]
	}

	type RecipeInstruction {
		id: ID!
		blockIndex: Int!
		reference: String!
	}

	type Suggestion {
		id: String!
		name: String!
	}

	type Tag {
		id: String!
		evernoteGUID: String
		name: String!
	}

	type Query {
		container(id: String!): Container
		containers: [ Container ]!
		ingredient(value: String!): ContainerIngredient
		viewIngredients: [ ContainerIngredient ]!
		suggestions: [ Suggestion ]!
	}

	type Mutation {
   	createContainers(
	  	group: String!
			ingredients: [ ContainerIngredient ]!
			view: String!
    ) : ContainersResponse
		setContainerIsExpanded(
	  	id: String!
			isExpanded: Boolean!
    ) : null
		setCurrentCard(
	  	id: String!
			ingredientID: String
    ) : null
	}
`;
