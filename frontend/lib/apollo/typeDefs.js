import { gql } from '@apollo/client';

export default gql`
	# Categories
		type Category {
			id: ID!
			evernoteGUID: String
			name: String!
		}

		type CategoryAggregate {
			count: Int!
		}

	# Containers
		type Container {
			id: String!
			ingredientID: String
			ingredients: [ Ingredient ]!
			isExpanded: Boolean!
			label: String!
			nextIngredientID: String
			referenceCount: Int!
		}

		type ContainerResult {
			errors: [ String ]
			result: Container
		}

		type ContainersResult {
			errors: [ String ]
			result: [ Container ]!
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
			hasParent: Boolean! @client
			parent: Ingredient
			relatedIngredients: [ Ingredient! ]!
			substitutes: [ Ingredient! ]!
			references: [ RecipeReference! ]!
			referenceCount: Int! @client
		}

		type RecipeReference {
			id: ID!
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
			count: Int!
			unverified: Int!
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

		type RecipeAggregate {
			count: Int!
		}

	# Query & Mutations

		type Query {
			container(id: String): Container
			containers(currentIngredientID: String, group: String!, view: String!): [ Container ]
		}

		type Mutation {
			createContainers: ContainersResult
			toggleContainer: ContainerResult
		}
`;
