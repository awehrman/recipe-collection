import gql from 'graphql-tag';

export const getContainer = gql`
	fragment getContainer on Container {
		id
		ingredientID
		ingredients {
			id
			isValidated
			name
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
		isExpanded
		label
	}
`;

export const setCurrentCard = gql`
	fragment setCurrentCard on Container {
		ingredientID
	}
`;

export const setIsExpanded = gql`
	fragment setIsExpanded on Container {
		isExpanded
	}
`;

export default [
	getContainer,
	setCurrentCard,
	setIsExpanded,
];
