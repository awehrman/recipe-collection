import { Component } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import IngredientCard from './IngredientCard';

const ContainerStyles = styled.div`
	margin-bottom: 16px; 
	display: flex;
	flex-wrap: wrap;
	border-bottom: 1px solid #ddd;

	&:last-of-type {
		margin-bottom: 40px;
	}

	&.hidden {
		border-bottom: 0;
	}

	ul.hidden {
		display: none;
	}
`;

const Message = styled.div`
	font-style: italic;
	padding: 20px 0;
`;

const ContainerHeader = styled.div`
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
	flex-basis: 100%;
	margin: 0;
	list-style-type: none;
	line-height: 1.4;
	padding: 10px;
	max-height: 450px;
	overflow: scroll;
	position: relative;

	li .header {
		font-size: 2em;
		display: inline-block;
		width: 100%;
		font-weight: 600;
	}

	li.child a {
		font-style: italic;
	}

	li.active a {
		display: inline-block;
		background: ${ props => props.theme.headerBackground };
		width: 100%;
	}

	li.invalid a {
		color: silver;
	}

	li a {
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
		}
	}

	@media (min-width: 900px) {
		column-count: 4;
	}

	@media (min-width: 1100px) {
		column-count: 5;
	}
`;

// TODO this doesn't need to be a class
class IngredientsContainer extends Component {
	render() {
		const { container, refreshView, view } = this.props;
		let { className } = this.props;
		const { ingredients, label, message, settings } = container;
		const { currentIngredientID, isCardEnabled, isExpanded } = settings;
		let ingredientsList = [];

		// sort ingredients
		ingredients.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

		// TODO move this into a function
  	// if we have more than 100 ingredients in this container, we'll group these by letter
  	if (ingredients && (ingredients.length > 100) && (ingredients.length <= 500)) {
  		const hasSymbols = ingredients.map(i => i.name.charAt(0)).filter(char => !char.match(/[a-z]/i)).length > 0;
  		const letters = ingredients.map(i => i.name.charAt(0)).filter((char, index, self) => self.indexOf(char) === index && char.match(/[a-z]/i));

  		if (hasSymbols) {
  			// push header symbol
  			ingredientsList.unshift({
  				id: '@_header',
	  			name: '@',
  				type: 'header',
	  		});

	  		// push all ingredients that start with a non-alphanumeric value
	  		ingredientsList = ingredientsList.concat(
	  											...ingredients
														.filter(i => !i.name.charAt(0).match(/[a-z]/i))
														.map(i => {
															return {
																id: i.id,
												  			name: i.name,
												  			isChild: i.parent,
												  			isValid: i.isValidated,
											  				type: 'ingredient',
															};
														})
													);
  		}

  		// loop through the used letters and push their ingredient groups
  		ingredientsList = ingredientsList.concat(...letters.map(char => {
									  			let grouping = [];
									  			// push header letter
									  			grouping.push({
									  				id: `${char}_header`,
										  			name: char,
									  				type: 'header',
									  			});

									  			// push ingredients under that letter group
									  			grouping = grouping.concat(...ingredients.filter(i => i.name.charAt(0) === char)
									  									.map(i => {
									  										return {
									  											id: i.id,
																	  			name: i.name,
																	  			isChild: i.parent,
												  								isValid: i.isValidated,
																  				type: 'ingredient',
									  										}
									  									})
									  								);

									  			return grouping;
									  		}));
  	} else {
  		ingredientsList = ingredientsList.concat(
  												...ingredients.map(i => {
			  										return {
			  											id: i.id,
											  			name: i.name,
											  			isChild: i.parent,
						  								isValid: i.isValidated,
										  				type: 'ingredient',
			  										}
									  			})
  											);
  	}

		return (
			<ContainerStyles className={ (ingredients && (ingredients.length === 0)) ? `hidden ${ className }` : className }>
				{/* Container Message */}
  			<Message>
  				{ message }
  			</Message>

				{/* Container Header */}
				{
					(ingredients && ingredients.length > 0)
		  			? <ContainerHeader onClick={ this.props.onContainerClick } className={ className }>
			  				{ label }
			  				<span className="count">{ ingredients.length }</span>
			  			</ContainerHeader>
			  		: null
			  }

  			{/* Expanded Card */}
				{
    			(isCardEnabled && (currentIngredientID !== null))
		    		? <IngredientCard
		    				container={ container }
		    				currentIngredientID={ currentIngredientID }
		    				/* TODO double check */
		    				ingredients={ [ ...this.props.ingredients ] /* make sure you're passing all ingredients and not just the containers */}
		    				key={ currentIngredientID }
		    				refreshView={ refreshView }
		    				view={ view }
		    			/>
						: null
				}

				{/* Container Ingredients */}
				{
					(ingredients && ingredients.length > 0)
						? <IngredientsList className={ (isCardEnabled) ? `expanded ${ className }` : className }>
							{
								ingredientsList.map((i, index) => {
									let href = { pathname: '/ingredients' };
									// TODO there's still a bug where something is still holding onto the current id and its not adding to this into the url
									if (!currentIngredientID || (currentIngredientID && (currentIngredientID !== i.id))) {
										href.query = { id: i.id };
									}

									let ingClassName = i.type;
									if (i.type !== 'header') {
								  	ingClassName += (isCardEnabled && (currentIngredientID === i.id)) ? ' active ' : '';
								  	ingClassName += (i.isChild) ? ' child' : '';
								  	ingClassName += (!i.isValid && view !== 'new') ? ' invalid' : '';
								  }

									return (
										<li key={ `${ index }_${ label }_${ i.id }` } className={ ingClassName }>
											{
												(i.type === 'header')
												? <span className="header">{ i.name }</span>
												: <Link href={ href }>
														<a onClick={ this.props.onIngredientClick } id={ i.id }>{ i.name }</a>
													</Link>
											}
							  		</li>
							  	);
								})
							}
						</IngredientsList>
						: null
					}
			</ContainerStyles>
		);		
	}
}

IngredientsContainer.defaultProps = {
	container: {
		id: 0,
		ingredients: [],
		label: "All Ingredients",
		message: "Loading...",
		settings: {
			currentIngredientID: null,
			isCardEnabeld: false,
			isExpanded: true,
			typename: "__IngredientViewState"
		}
	},
	onContainerClick: () => {},
	onIngredientClick: () => {},
	view: 'all',
};

IngredientsContainer.propTypes = {
	className: PropTypes.string,
	container: PropTypes.object,
	onContainerClick: PropTypes.func,
	onIngredientClick: PropTypes.func,
	refreshView: PropTypes.func,
	view: PropTypes.string,
};

export default IngredientsContainer;