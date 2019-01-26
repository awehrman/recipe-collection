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
	max-height: 500px;
	overflow: scroll;
	position: relative;
	
	.hidden {
		display: none;
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

class IngredientsContainer extends Component {
	render() {
		const { container, className, view } = this.props;
		const { currentIngredientID, ingredients, isCardEnabled, isExpanded, label, message } = this.props.container;

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
    			(isCardEnabled && currentIngredientID)
		    		? <IngredientCard
		    				container={ container }
		    				currentIngredientID={ currentIngredientID }
		    				view={ view }
		    				ingredients={ this.props.ingredients /* make sure you're passing all ingredients and not just the containers */}
		    				key={ currentIngredientID }
		    				ingredientCounts={ this.props.ingredientCounts }
								localState={ this.props.localState }
								populateContainers={ this.props.populateContainers }
								refreshContainers={ this.props.refreshContainers }
								updateContainer={ this.props.updateContainer }
		    			/>
						: null
				}

				{/* Container Ingredients */}
				{
					(ingredients && ingredients.length > 0)
						? <IngredientsList className={ (isCardEnabled) ? 'expanded' : '' }>
							{/* TODO check against the current ingredient to see if we need to pass an id or clear it out */
								ingredients.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
									.map(i =>
										<li key={ `${ label }_${ i.id }` } className={ className }>
								  		<Link href={ { pathname: '/ingredients', query: { id: i.id } } }>
												<a onClick={ this.props.onIngredientClick } id={ i.id }>{ i.name }</a>
											</Link>
							  		</li>
									)
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
		currentIngredientID: null,
		ingredients: [],
		isCardEnabeld: false,
		isExpanded: true,
		label: "All Ingredients",
		message: "Loading..."
	},
	view: 'all',
	onContainerClick: () => {},
	onIngredientClick: () => {},
	updateContainer: () => {}
};

IngredientsContainer.propTypes = {
	className: PropTypes.string,
	container: PropTypes.object,
	view: PropTypes.string,
	onContainerClick: PropTypes.func,
	onIngredientClick: PropTypes.func,
	localState: PropTypes.object,
	populateContainers: PropTypes.object,
	refreshContainers: PropTypes.func,
	updateContainer: PropTypes.func
};

export default IngredientsContainer;