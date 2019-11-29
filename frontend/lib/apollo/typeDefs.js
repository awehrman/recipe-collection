import gql from 'graphql-tag';

export default gql`
	# Authentication
		type AuthenticationResponse {
			errors: [ String ]
			isAuthenticationPending: Boolean
			isAuthenticated: Boolean
			authURL: String
		}

	# Categories
		type Category {
			id: ID!
			evernoteGUID: String
			name: String!
		}

		type CategoryAggregate {
			id: ID!
			categoriesCount: Int!
		}

		type CategoryResponse {
			category: Category
			errors: [ String ]
		}

	# Containers
		type ContainersResponse {
			errors: [ String ]
			containers: [ Container ]
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

	# Ingredients
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
			references: [ RecipeReference! ]!
		}

		type RecipeReference {
			id: ID! @id
			recipe: Recipe!
			line: RecipeIngredient!
		}

		type AlternateName {
			id: ID!
			name: String!
		}

		type Properties {
			id: ID!
			meat: Boolean!
			poultry: Boolean!
			fish: Boolean!
			dairy: Boolean!
			soy: Boolean!
			gluten: Boolean!
		}

		type IngredientAggregate {
			id: ID!
			ingredientsCount: Int!
			newIngredientsCount: Int!
		}

		type IngredientResponse {
			errors: [ String ]
			ingredient: Ingredient
		}

	# Notes
		type Note {
			id: ID!
			evernoteGUID: String
			title: String!
			source: String
			categories: [ String ]
			tags: [ String ]
			image: String
			content: String
			ingredients: [ RecipeIngredient ]
			instructions: [ RecipeInstruction ]
		}

		type NoteAggregate {
			id: ID!
			count: Int!
			importDefault: Int!
		}

		type EvernoteResponse {
			errors: [ String ]
			notes: [ Note ]
		}

	# Recipes
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

		type RecipeInstruction {
			id: ID!
			blockIndex: Int!
			reference: String!
		}

		type RecipeIngredient {
			id: ID!
			blockIndex: Int!
			lineIndex: Int!
			reference: String!
			rule: String
			isParsed: Boolean!
			parsed: [ ParsedSegment! ]
		}

		type ParsedSegment {
			id: ID!
			rule: String!
			type: String!
			value: String!
			ingredient: Ingredient
		}

		type RecipeResponse {
			errors: [ String ]
			recipe: Recipe
		}

		type RecipesResponse {
			errors: [ String ]
			count: Int
			recipes: [ Recipe ]
		}

		type RecipeAggregate {
			id: ID!
			recipesCount: Int!
		}

	# Suggestions
		type Suggestion {
			id: String!
			name: String!
		}

	# Tags
		type Tag {
			id: ID!
			evernoteGUID: String
			name: String!
		}

		type TagAggregate {
			id: ID!
			tagsCount: Int!
		}

		type TagResponse {
			errors: [ String ]
			tag: Tag
		}

	# Query & Mutations

		type Query {
			container(id: String!): Container
			containers: [ Container ]!
			ingredient(value: String!): ContainerIngredient
			notes: [ Note! ]
			suggestions: [ Suggestion ]!
			viewIngredients: [ ContainerIngredient ]!
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
