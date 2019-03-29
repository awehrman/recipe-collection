import { adopt } from 'react-adopt';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import PropTypes from 'prop-types';
import { Component } from 'react';
import styled from 'styled-components';

import { deepCopy } from '../../lib/util';
import Card from './Card';

const UPDATE_CURRENT_INGREDIENT_ID_MUTATION = gql`
	mutation setCurrentCard(
		$id: ID!,
		$currentIngredientID: Boolean
		$isCardEnabled: Boolean
	) {
		setCurrentCard(
			id: $id,
			currentIngredientID: $currentIngredientID
			isCardEnabled: $isCardEnabled
		) @client
	}
`;

const UPDATE_IS_CONTAINER_EXPANDED_MUTATION = gql`
	mutation setIsContainerExpanded(
		$id: ID!,
		$isContainerExpanded: Boolean
	) {
		setIsContainerExpanded(
			id: $id,
			isContainerExpanded: $isContainerExpanded
		) @client
	}
`;

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	setCurrentCard: ({ render }) => (
		<Mutation mutation={ UPDATE_CURRENT_INGREDIENT_ID_MUTATION }>
			{ render }
		</Mutation>
	),

	// eslint-disable-next-line react/prop-types
	setIsContainerExpanded: ({ render }) => (
		<Mutation mutation={ UPDATE_IS_CONTAINER_EXPANDED_MUTATION }>{ render }</Mutation>
	),
});

const ContainerStyles = styled.div`
	margin-bottom: 16px; 
	display: flex;
	flex-wrap: wrap;
	border-bottom: 1px solid #ddd;
	width: 100%;
`;

const HeaderStyles = styled.div`
	flex-basis: 100%;
	font-size: 1.2em;
	padding-bottom: 16px;
	border-bottom: 1px solid #ddd;
	display: flex;
	justify-content: space-between;
	cursor: pointer;

	.count {
		color: ${ props => props.theme.lighterGrey };
		text-align: right;
	}
`;

const IngredientsList = styled.ul`
	display: flex;
	flex-basis: 100%;
	margin: 0;
	list-style-type: none;
	line-height: 1.4;
	max-height: 450px;
	overflow: scroll;
	position: relative;
	padding: 0;

	li {
		/* make sure you give enough top/bottom padding for a focus state */
		padding: 2px 10px;
	}

	li .header {
		font-size: 2em;
		display: inline-block;
		width: 100%;
		font-weight: 600;
	}

	li.child a {
		font-style: italic;
	}

	li.active {
		display: inline-block;
		/*background: ${ props => props.theme.headerBackground };*/
		background: rgba(128, 174, 245, .05);
		width: 100%;
	}

	li.invalid a {
		color: silver;
	}

	li a {
		cursor: pointer;
		text-decoration: none;
		color: #222;
		display: inline-block; /* need to give these links height for the scroll! */

		&:hover {
			color: ${ props => props.theme.highlight };
		}
	}

	@media (min-width: 500px) {
		column-count: 2;
  	column-gap: 16px;
	}

	@media (min-width: 700px) {
		column-count: 3;
	}

	@media (min-width: ${ props => props.theme.desktopCardWidth }) {
		/* swing the ingredient list over to the left */
		&.expanded {
			column-count: unset;
			flex-basis: 25%;

			li:first-of-type {
				padding-top: 10px;
			}

			li:last-of-type {
				padding-bottom: 10px;
			}
		}
	}

	@media (min-width: 900px) {
		column-count: 4;
	}

	@media (min-width: 1100px) {
		column-count: 5;
	}
`;

class Container extends Component {
	buildIngredientsList = (ingredients) => {
		const { currentIngredientID, isCardEnabled, view } = this.props;

		// add list item properties
		const ingList = ingredients.map((i) => {
			// NOTE: you better not mangle that ingredients array here
			const listItem = deepCopy(i);

			listItem.type = 'link';

			listItem.className = listItem.type;
			listItem.className += (isCardEnabled && (currentIngredientID === i.id)) ? ' active ' : '';
			listItem.className += (i.parent !== null) ? ' child' : '';
			listItem.className += (!i.isValidated && view !== 'new') ? ' invalid' : '';

			listItem.href = { pathname: '/ingredients' };
			// TODO re-test this
			// only put the ingredient id in the URL if we don't have an open card
			// or its another card that the one we're on
			if (!isCardEnabled || (currentIngredientID !== i.id)) {
				listItem.href.query = { id: i.id };
			}

			return listItem;
		});

		// sort alphabetically
		ingList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

		// if we have less than 100 ingredients in this container, return the result as is
		if (ingList.length < 100) return ingList;

		// otherwise we'll add in headers to separate letter groups
		let ingListWithHeaders = [];
		const hasSymbols = ingList.map(i => i.name.charAt(0)).filter(char => !char.match(/[a-z]/i)).length > 0;
		const letters = ingList.map(i => i.name.charAt(0)).filter((char, index, self) => self.indexOf(char) === index && char.match(/[a-z]/i));

		if (hasSymbols) {
			// push header symbol
			ingListWithHeaders.push({
				id: '@_header',
				name: '@',
				type: 'header',
			});

			// push all ingredients that start with a non-alphanumeric value
			ingListWithHeaders = ingListWithHeaders.concat(...ingList.filter(i => !i.name.charAt(0).match(/[a-z]/i)));
		}

		// loop through the used letters and push their ingredient groups
		ingListWithHeaders = ingListWithHeaders.concat(
			...letters.map((char) => {
				const grouping = [ {
					id: `${ char }_header`,
					name: char,
					type: 'header',
				} ];

				// push ingredients under that letter group
				return grouping.concat(...ingredients.filter(i => i.name.charAt(0) === char));
			}),
		);

		return ingListWithHeaders;
	}

	onHeaderClick = (e, setIsContainerExpanded, id, isContainerExpanded) => {
		console.warn('onHeaderClick');
		e.preventDefault();

		// update the local cache
		setIsContainerExpanded({
			variables: {
				id,
				isContainerExpanded: !isContainerExpanded,
			},
		});
	}

	onIngredientClick = (targetIngredientID, setCurrentCard) => {
		console.warn('onIngredientClick');
		const { currentIngredientID, group, id, isCardEnabled, view } = this.props;

		// update the url without causing a bunch of re-renders
		let href = `/ingredients?view=${ view }&group=${ group }`;
		if (!isCardEnabled || (currentIngredientID !== targetIngredientID)) href += `&id=${ targetIngredientID }`;
		const as = href;
		Router.push(href, as, { shallow: true });

		// update the local cache
		setCurrentCard({
			variables: {
				id,
				currentIngredientID: targetIngredientID,
				isCardEnabled: (!isCardEnabled || (currentIngredientID !== targetIngredientID)),
			},
		});
	}

	render() {
		console.warn('[Container] render');
		const { className, currentIngredientID, id, ingredients, isCardEnabled, isContainerExpanded, label, view } = this.props;
		const ingList = this.buildIngredientsList(ingredients);
		// eslint-disable-next-line object-curly-newline
		console.log({ currentIngredientID, isCardEnabled, isContainerExpanded });

		return (
			<Composed>
				{
					({ setCurrentCard, setIsContainerExpanded }) => (
						<ContainerStyles className={ className }>
							{/* Header */}
							<HeaderStyles onClick={ e => this.onHeaderClick(e, setIsContainerExpanded, id, isContainerExpanded) }>
								{ label }
								<span className="count">{ ingredients.length }</span>
							</HeaderStyles>

							{/* Card */}
							{
								(isCardEnabled && (currentIngredientID !== null))
									? (
										<Card
											className={ className }
											id={ currentIngredientID }
											key={ currentIngredientID }
											view={ view }
										/>
									)
									: null
							}

							{/* Ingredients */}
							<IngredientsList className={ (isCardEnabled) ? `expanded ${ className }` : className }>
								{
									ingList.map(i => (
										<li className={ i.className } key={ i.id }>
											{
												(i.type === 'header')
													? <span className="header">{ i.name }</span>
													: (
														<a
															onClick={ () => this.onIngredientClick(i.id, setCurrentCard) }
															onKeyPress={ () => this.onIngredientClick(i.id, setCurrentCard) }
															role="link"
															tabIndex="0"
														>
															{ i.name }
														</a>
													)
											}
										</li>
									))
								}
							</IngredientsList>
						</ContainerStyles>
					)
				}
			</Composed>
		);
	}
}

Container.defaultProps = {
	className: '',
	currentIngredientID: null,
	ingredients: [],
	isCardEnabled: false,
	isContainerExpanded: true,
	label: 'All Ingredients',
};

const arrayOfLength = (expectedLength, props, propName, component) => {
	// eslint-disable-next-line react/destructuring-assignment
	const { length } = props[propName];
	if (length < expectedLength) {
		const message = `Invalid array length ${ length } for prop ${ propName } supplied to ${ component }. Validation failed.`;
		return new Error(message);
	}
	return null;
};

Container.propTypes = {
	className: PropTypes.string,
	currentIngredientID: PropTypes.string,
	group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]).isRequired,
	id: PropTypes.string.isRequired,
	ingredients: arrayOfLength.bind(null, 1),
	isCardEnabled: PropTypes.bool,
	isContainerExpanded: PropTypes.bool,
	label: PropTypes.string,
	view: PropTypes.oneOf([ 'all', 'new' ]).isRequired,
};

export default Container;
export {
	UPDATE_CURRENT_INGREDIENT_ID_MUTATION,
	UPDATE_IS_CONTAINER_EXPANDED_MUTATION,
};
