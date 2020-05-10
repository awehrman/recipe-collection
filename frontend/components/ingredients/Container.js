import { Map as ImmutableMap } from 'immutable';
import { useMutation, useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import Card from './Card';
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';

import ContainerContext from '../../lib/contexts/ingredients/containerContext';
import ViewContext from '../../lib/contexts/ingredients/viewContext';
import { GET_CONTAINER_QUERY } from '../../lib/apollo/queries/containers';
import { TOGGLE_CONTAINER_MUTATION, UPDATE_CONTAINER_INGREDIENT_MUTATION } from '../../lib/apollo/mutations/containers';

// TODO virtualize that ingredients list
// TODO scroll to list item on click

const Container = ({ id }) => {
	// console.log('Container', id);
	const ctx = useContext(ViewContext);
	const group = ctx.get('group');
	const view = ctx.get('view');

	// eslint-disable-next-line object-curly-newline
	// console.log('Container', { group, view });

	// query container
	const {
		data,
		loading,
		error,
	} = useQuery(GET_CONTAINER_QUERY, {
		context: {
			group,
			view,
		},
		variables: { id },
	});
	const { container } = data || {};

	// setup mutations
	const [ toggleContainer ] = useMutation(TOGGLE_CONTAINER_MUTATION);
	const [ toggleIngredientID ] = useMutation(UPDATE_CONTAINER_INGREDIENT_MUTATION);
	const handleIngredientToggle = (containerID, ingredientID) => {
		toggleIngredientID({
			variables: {
				id: containerID,
				ingredientID,
			},
		});
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

				{/* ingredients list */}
				<IngredientsList className={ `${ className } ${ (container.ingredients.length < 10) ? 'small' : '' }` }>
					{
						container.ingredients.map((i) => (
							<li className={ i.className } key={ i.id }>
								{
									(i.type === 'header')
										? <span className="header">{ i.name }</span>
										: (
											<a
												id={ i.id }
												onClick={ (e) => handleIngredientToggle(container.id, e.target.id) }
												onKeyPress={ (e) => handleIngredientToggle(container.id, e.target.id) }
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
		</ContainerContext.Provider>
	);
};

// Container.whyDidYouRender = true;

Container.propTypes = { id: PropTypes.string.isRequired };

export default pure(Container);


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
	padding: 5px 0;

	&.small {
		display: flex;
		align-items: start;
	}

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
