import { adopt } from 'react-adopt';
import { Query, Mutation, withApollo } from 'react-apollo';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { GET_CONTAINER_QUERY } from '../../lib/apollo/queries';
import { UPDATE_CONTAINER_INGREDIENT_ID_MUTATION, UPDATE_IS_CONTAINER_EXPANDED_MUTATION } from '../../lib/apollo/mutations';

import { deepCopy } from '../../lib/util';
import Card from './Card';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';

const ContainerStyles = styled.div`
	margin-bottom: 16px;
	display: flex;
	flex-wrap: wrap;
	width: 100%;

	&.expanded {
		padding-bottom: 5px;
		border-bottom: 1px solid #ddd;
	}
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
		color: ${ (props) => props.theme.lighterGrey };
		text-align: right;
	}
`;

const IngredientsList = styled.ul`
	display: block;
	flex-basis: 100%;
	margin: 0;
	list-style-type: none;
	line-height: 1.4;
	max-height: 450px;
	overflow: scroll;
	position: relative;
	padding: 0;

	li {
		flex-basis: 100%;
		/* make sure you give enough top/bottom padding for a focus state */
		padding: 2px 10px;

		+ .active {
			display: inline-block;
			background: rgba(128, 174, 245, .08);
			width: 100%;
		}

		+ .child a {
			font-style: italic;
		}

		&.invalid > a {
			color: silver;
		}

		.header {
			font-size: 2em;
			display: inline-block;
			width: 100%;
			font-weight: 600;
		}

		a {
			cursor: pointer;
			text-decoration: none;
			color: #222;
			display: inline-block; /* need to give these links height for the scroll! */

			&:hover {
				color: ${ (props) => props.theme.highlight };
			}
		}
	}

	@media (min-width: 500px) {
		column-count: 2;
  	column-gap: 16px;
	}

	@media (min-width: 700px) {
		column-count: 3;
	}

	@media (min-width: ${ (props) => props.theme.desktopCardWidth }) {
		padding: 10px 0;

		/* swing the ingredient list over to the left */
		&.expanded {
			column-count: unset;
			flex-basis: 25%;
		}
	}

	@media (min-width: 900px) {
		column-count: 4;
	}

	@media (min-width: 1100px) {
		column-count: 5;
	}
`;

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getContainer: ({ id, render }) => (
		<Query fetchPolicy="network-only" notifyOnNetworkStatusChange query={ GET_CONTAINER_QUERY } variables={ { id } }>
			{ render }
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	setCurrentCard: ({ render }) => (
		<Mutation mutation={ UPDATE_CONTAINER_INGREDIENT_ID_MUTATION } refetchQueries={ [ GET_CONTAINER_QUERY ] }>
			{ render }
		</Mutation>
	),

	// eslint-disable-next-line react/prop-types
	setContainerIsExpanded: ({ render }) => (
		<Mutation mutation={ UPDATE_IS_CONTAINER_EXPANDED_MUTATION }>
			{ render }
		</Mutation>
	),
});

class Container extends React.PureComponent {
	buildIngredientsList = (ingredients, ingredientID) => {
		const { view } = this.props;
		// add list item properties
		const ingList = ingredients.map((i) => {
			// NOTE: you better not mangle that ingredients array here
			const listItem = deepCopy(i);

			listItem.type = 'link';
			listItem.className = listItem.type;
			listItem.className += (ingredientID && (ingredientID === i.id)) ? ' active ' : '';
			listItem.className += (i.hasParent) ? ' child' : '';
			listItem.className += (!i.isValidated && view !== 'new') ? ' invalid' : '';

			listItem.href = { pathname: '/ingredients' };
			// only put the ingredient id in the URL if we don't have an open card
			// or its another card that the one we're on
			if (ingredientID !== i.id) {
				listItem.href.query = { id: i.id };
			}

			return listItem;
		});

		// sort alphabetically
		ingList.sort((a, b) => a.name.localeCompare(b.name));

		// if we have less than 100 ingredients in this container, return the result as is
		if (ingList.length < 100) return ingList;

		// otherwise we'll add in headers to separate letter groups
		let ingListWithHeaders = [];
		const hasSymbols = ingList.map((i) => i.name.charAt(0)).filter((char) => !char.match(/[a-z]/i)).length > 0;
		const letters = ingList.map((i) => i.name.charAt(0)).filter((char, index, self) => self.indexOf(char) === index && char.match(/[a-z]/i));

		if (hasSymbols) {
			// push header symbol
			ingListWithHeaders.push({
				id: '@_header',
				name: '@',
				type: 'header',
			});

			// push all ingredients that start with a non-alphanumeric value
			ingListWithHeaders = ingListWithHeaders.concat(...ingList.filter((i) => !i.name.charAt(0).match(/[a-z]/i)));
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
				const array = grouping.concat(
					...ingredients.filter((i) => i.name.charAt(0) === char)
						.sort((a, b) => {
							if (a.name < b.name) { return -1; }
							if (a.name > b.name) { return 1; }
							return 0;
						}),
				);
				return array;
			}),
		);

		return ingListWithHeaders;
	}

	onHeaderClick = (e, setContainerIsExpanded, id, isExpanded) => {
		e.preventDefault();
		// update the local cache
		setContainerIsExpanded({
			variables: {
				id,
				isExpanded: !isExpanded,
			},
		});
	}

	onIngredientClick = async (e, currentIngredientID) => {
		e.preventDefault();
		const targetIngredientID = e.target.id;

		const { client, id } = this.props;

		// update the url without causing a bunch of re-renders

		// TODO shallow rendering doesn't seem to be working
		// let href = `/ingredients?view=${ view }&group=${ group }`;
		// href += (currentIngredientID === targetIngredientID) ? '' : `&id=${ targetIngredientID }`;
		// const as = href.split('/ingredients')[1];
		// router.replace(href, as, { shallow: true });

		// update the local cache
		try {
			await client.mutate({
				mutation: UPDATE_CONTAINER_INGREDIENT_ID_MUTATION,
				variables: {
					id,
					ingredientID: (currentIngredientID === targetIngredientID) ? null : targetIngredientID,
				},
			});
		} catch (err) {
			console.error({ err });
		}
	}

	render() {
		const { id, view } = this.props;
		return (
			<Composed id={ id }>
				{
					({ getContainer, setContainerIsExpanded }) => {
						const { data, error, loading } = getContainer;
						// eslint-disable-next-line
						if (error) return <ErrorMessage error={ error } />;
						if (loading) return <Loading />;

						const { container } = data || {};
						const { ingredients, isExpanded, label, referenceCount } = container;
						const currentIngredientID = container.ingredientID;
						const ingList = this.buildIngredientsList(ingredients, currentIngredientID);
						const listClassName = (`${ (!isExpanded) ? 'hidden' : '' } ${ (currentIngredientID) ? 'expanded' : '' }`).trim();

						return (
							<ContainerStyles className={ (isExpanded) ? 'expanded' : '' }>
								<HeaderStyles onClick={ (e) => this.onHeaderClick(e, setContainerIsExpanded, id, isExpanded) }>
									{label}
									<span className="count">{ referenceCount }</span>
								</HeaderStyles>

								{
									(currentIngredientID)
										? (
											<Card
												className={ listClassName }
												id={ currentIngredientID }
												key={ currentIngredientID }
												view={ view }
											/>
										)
										: null
								}

								<IngredientsList className={ listClassName }>
									{
										ingList.map((i) => (
											<li className={ i.className } key={ i.id }>
												{
													(i.type === 'header')
														? <span className="header">{i.name}</span>
														: (
															<a
																id={ i.id }
																onClick={ (e) => this.onIngredientClick(e, currentIngredientID) }
																onKeyPress={ (e) => this.onIngredientClick(e, currentIngredientID) }
																role="link"
																tabIndex="0"
															>
																{i.name}
															</a>
														)
												}
											</li>
										))
									}
								</IngredientsList>
							</ContainerStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Container.propTypes = {
	client: PropTypes.shape({ mutate: PropTypes.func }).isRequired,
	// group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]).isRequired,
	id: PropTypes.string.isRequired,
	view: PropTypes.oneOf([ 'all', 'new' ]).isRequired,
};

export default withRouter(withApollo(Container));
