import { Map as ImmutableMap } from 'immutable';
import { useMutation, useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import React, { useContext, useRef } from 'react';
import { FixedSizeList } from 'react-window';
import pure from 'recompose/pure';
import styled from 'styled-components';
import Link from 'next/link';

import Card from './Card';
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';

import ContainerContext from '../../lib/contexts/ingredients/containerContext';
import ViewContext from '../../lib/contexts/ingredients/viewContext';
import { GET_CONTAINER_QUERY } from '../../lib/apollo/queries/containers';
import { TOGGLE_CONTAINER_MUTATION, UPDATE_CONTAINER_INGREDIENT_MUTATION } from '../../lib/apollo/mutations/containers';

// TODO on refresh if we have a currentIngredientID, adjust scrollTo
const Container = ({ id }) => {
	const ctx = useContext(ViewContext);
	const group = ctx.get('group');
	const view = ctx.get('view');
	const listRef = useRef(null);

	// query container
	const {
		data: containerData,
		loading,
		error,
	} = useQuery(GET_CONTAINER_QUERY, {
		context: {
			group,
			view,
		},
		variables: { id },
	});
	const { container } = containerData || {};

	// setup mutations
	const [ toggleContainer ] = useMutation(TOGGLE_CONTAINER_MUTATION);
	const [ toggleIngredientID ] = useMutation(UPDATE_CONTAINER_INGREDIENT_MUTATION);
	const handleIngredientToggle = (e, containerID, ingredientID) => {
		// lookup ingredient index
		setTimeout(() => {
			const index = container.ingredients.findIndex((i) => i.id === ingredientID);
			if (index && listRef.current) {
				listRef.current.scrollToItem(index - 1, 'start');
			}
		}, 0);

		toggleIngredientID({
			variables: {
				id: containerID,
				ingredientID,
			},
		});
	};

	function getQueryParams(_id) {
		const currentIngredientID = container.ingredientID;
		const params = {
			group,
			view,
		};
		if (currentIngredientID !== _id) {
			params.id = _id;
		}
		return params;
	}

	/* eslint-disable react/prop-types */
	const Row = ({ data, index, style }) => {
		const ingredient = data[index];
		const ingClassName = [];
		if (!ingredient.isValidated) ingClassName.push('invalid');
		if (ingredient.hasParent) ingClassName.push('child');
		if (ingredient.id === container?.ingredientID) ingClassName.push('active');

		// then return each item individually
		return (
			<IngredientRow key={ index } className={ ingClassName.join(', ') } style={ style }>
				<Link href={ {
					pathname: '/ingredients',
					query: getQueryParams(ingredient.id),
				} }
				>
					<a
						onClick={ (e) => handleIngredientToggle(e, container.id, ingredient.id) }
						onKeyPress={ (e) => handleIngredientToggle(e, container.id, ingredient.id) }
						role="link"
						tabIndex="0"
					>
						{ ingredient.name }
					</a>
				</Link>
			</IngredientRow>
		);
	};

	if (error) return <ErrorMessage error={ error } />;
	if (loading) return <Loading />;

	const className = (`${ (!container.isExpanded) ? 'hidden' : '' } ${ (container.ingredientID) ? 'expanded' : '' }`).trim();
	const containerContext = ImmutableMap({ nextIngredientID: container.nextIngredientID || null });

	return (
		<ContainerContext.Provider value={ containerContext }>
			<ContainerStyles className={ (container.isExpanded) ? 'expanded' : '' }>
				{/* container header */}
				<HeaderStyles
					onClick={
						/* TODO move these mutations into reducers */
						() => toggleContainer({
							variables: {
								id: container.id,
								isExpanded: !container.isExpanded,
							},
						})
					}
				>
					{ container.label }
					<span className="count">{ container.referenceCount }</span>
				</HeaderStyles>

				{/* ingredients list */}
				<IngredientsList className={ `${ className } ${ (container?.ingredients.length < 10) ? 'small' : '' }` }>
					{
						(container?.ingredientID)
							? (
								<Combined>
									<List
										ref={ listRef }
										height={ 500 }
										itemCount={ container.ingredients.length }
										itemData={ container.ingredients }
										itemSize={ 22 }
										width={ 180 } // TODO this will need to adjust put screen size
									>
										{ Row }
									</List>
									<CardStyles>
										{/* current ingredient card */
											(container.ingredientID)
												? (
													<Card
														className={ className }
														id={ container.ingredientID }
													/>
												)
												: null
										}
									</CardStyles>
								</Combined>
							) : (
								// TODO i'll eventually get around to virtualizing this too but ughhhhhhhh
								<Columns>
									{
										container.ingredients.map((i) => {
											const ingClassName = [];
											if (!i.isValidated) ingClassName.push('invalid');
											if (i.hasParent) ingClassName.push('child');
											if (i.id === container.ingredientID) ingClassName.push('active');
											return (
												<li className={ ingClassName.join(', ') } key={ i.id }>
													{
														(i.type === 'header')
															? <span className="header">{ i.name }</span>
															: (
																<Link href={ {
																	pathname: '/ingredients',
																	query: getQueryParams(i.id),
																} }
																>
																	<a
																		onClick={ (e) => handleIngredientToggle(e, container.id, i.id) }
																		onKeyPress={ (e) => handleIngredientToggle(e, container.id, i.id) }
																		role="link"
																		tabIndex="0"
																	>
																		{ i.name }
																	</a>
																</Link>
															)
													}
												</li>
											);
										})
									}
								</Columns>
							)
					}
				</IngredientsList>
			</ContainerStyles>
		</ContainerContext.Provider>
	);
};

// Container.whyDidYouRender = true;

Container.propTypes = { id: PropTypes.string.isRequired };

export default pure(Container);

const ContainerStyles = styled.div`
	width: 100%;
	position: relative;
	max-width: 1200px;
`;

const HeaderStyles = styled.div`
	flex-basis: 100%;
	font-size: 1.2em;
	padding: 12px 0;
	border-bottom: 1px solid #ddd;
	display: flex;
	justify-content: space-between;
	cursor: pointer;

	.count {
		color: ${ (props) => props.theme.lighterGrey };
		text-align: right;
	}
`;

const Combined = styled.div`
	display: flex;
	flex-wrap: wrap;
	width: 100%;
	position: absolute;
	border-bottom: 1px solid #ddd;
`;

const CardStyles = styled.div`
	background: #fff;
	order: 0;
	flex-basis: 100%;

	@media (min-width: ${ (props) => props.theme.desktopCardWidth }) {
		order: 1;
		position: absolute;
		top: 0;
		left: 220px;
		right: 0;
	}
`;

const List = styled(FixedSizeList)`
	order: 1;
	flex-basis: 100%;

	@media (min-width: ${ (props) => props.theme.desktopCardWidth }) {
		order: 0;
	}
`;

const IngredientRow = styled.div`
	display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
	flex-basis: 100%;
	/* make sure you give enough top/bottom padding for a focus state */
	padding: 0px 10px;
	position: relative;

	a.anchor {
		position: absolute;
		top: -24px;
	}

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
`;

const IngredientsList = styled.div`
	display: flex;
`;

const Columns = styled.ul`
	max-height: 500px;
	overflow-x: scroll;
	display: block;
	flex-basis: 100%;
	margin: 0;
	list-style-type: none;
	line-height: 1.4;
	overflow: scroll;
	position: relative;
	padding: 5px 0;
	border-bottom: 1px solid #ddd;

	a {
		cursor: pointer;
		text-decoration: none;
		color: #222;
		display: inline-block; /* need to give these links height for the scroll! */

		&:hover {
			color: ${ (props) => props.theme.highlight };
		}
	}

	li {
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
	}

	&.small {
		display: flex;
		align-items: start;
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
