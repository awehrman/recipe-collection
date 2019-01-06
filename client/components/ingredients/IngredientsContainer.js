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

	.hidden {
		display: none;
	}

	li a {
		text-decoration: none;
		color: #222;

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
			height: $desktopListHeight;
			overflow: scroll;
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
		const { className, currentView } = this.props;
		const { currentIngredientID, ingredients, isCardEnabled, label, message } = this.props.container;

		return (
			<ContainerStyles className={ className }>
				{/* Container Message */}
  			<Message>
  				{ message }
  			</Message>

				{/* Container Header */}
  			<ContainerHeader onClick={ this.props.onContainerClick } className={ className }>
  				{ label }
  				<span className="count">{ ingredients.length }</span>
  			</ContainerHeader>

  			{/* Expanded Card */}
				{
    			(isCardEnabled && currentIngredientID)
		    		? <IngredientCard
		    				currentIngredientID={ currentIngredientID }
		    				currentView={ currentView }
		    				ingredients={ this.props.ingredients /* make sure you're passing all ingredients and not just the containers */}
		    				key={ currentIngredientID }
		    			/>
						: null
				}

				{/* Container Ingredients */}
				<IngredientsList className={ (isCardEnabled) ? 'expanded' : '' }>
					{/* TODO check against the current ingredient to see if we need to pass an id or clear it out */
						ingredients.map(i =>
							<li key={ `${ label }_${ i.id }` } className={ className }>
					  		<Link href={ { pathname: '/ingredients', query: { id: i.id } } }>
									<a onClick={ this.props.onIngredientClick } id={ i.id }>{ i.name }</a>
								</Link>
				  		</li>
						)
					}
				</IngredientsList>
			</ContainerStyles>
		);		
	}
}

IngredientsContainer.defaultProps = {
	container: {
		currentIngredientID: null,
		ingredients: [],
		isCardEnabeld: false,
		label: "All Ingredients",
		message: "Loading..."
	},
	currentView: 'all',
	onContainerClick: () => {},
	onIngredientClick: () => {}
};

IngredientsContainer.propTypes = {
	className: PropTypes.string,
	container: PropTypes.object,
	currentView: PropTypes.string,
	onContainerClick: PropTypes.func,
	onIngredientClick: PropTypes.func,
};

export default IngredientsContainer;