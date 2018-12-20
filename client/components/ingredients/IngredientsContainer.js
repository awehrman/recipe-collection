import { Component } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

import IngredientCard from './IngredientCard';

const ContainerStyles = styled.div`
	margin-bottom: 16px; 
	display: flex;
	flex-wrap: wrap;
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

	@media (min-width: 900px) {
		column-count: 4;
	}

	@media (min-width: 1100px) {
		column-count: 5;
	}
`;

const ContainerHeader = styled.div`
	flex-basis: 100%;
	font-size: 1.2em;
	padding-bottom: 16px;
	border-bottom: 1px solid #ddd;
	display: flex;
	justify-content: space-between;
	cursor: pointer;

	&.hidden {
		display: none;
	}

	.count {
		color: ${ props => props.theme.lighterGrey };
		text-align: right;
	}
`;

const Message = styled.div`
	font-style: italic;
	padding: 20px 0;
`;

class IngredientsContainer extends Component {
	render() {
		const { className } = this.props;
		const { currentIngredientID, ingredients, isCardEnabled, label, message } = this.props.container;
		return (
			<ContainerStyles>
				{/* Container Message */}
  			<Message>
  				{ message }
  			</Message>

				{/* Container Header */}
  			<ContainerHeader onClick={ this.props.onContainerClick } className={ (message !== '') ? 'hidden' : '' }>
  				{ label }
  				<span className="count">{ ingredients.length }</span>
  			</ContainerHeader>

  			{/* Expanded Card */}
				{
    			(isCardEnabled)
		    		? <IngredientCard currentIngredientID={ currentIngredientID }/>
						: null
				}

				<IngredientsList>
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


export default IngredientsContainer;