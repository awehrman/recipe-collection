import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import styled from 'styled-components';
import { adopt } from 'react-adopt';

import Error from './ErrorMessage';

const SINGLE_INGREDIENT_QUERY = gql`
	query SINGLE_INGREDIENT_QUERY($id: ID!) {
		ingredient(where: { id: $id }) {
			id
			parent {
				id
				name
			}
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
			alternateNames
			relatedIngredients {
				id
				name
			}
			substitutes {
				id
				name
			}
			references {
				id
				title
			}
			isValidated
		}
	}
`;

const Composed = adopt({
	getIngredient: ({ render, getIngredientVariables }) => <Query query={ SINGLE_INGREDIENT_QUERY } variables={ { id: getIngredientVariables } }>{ render }</Query>,
});

const IngredientCard = styled.form`
  border: 2px solid tomato;
  display: flex;
	flex-direction: column;
	flex-flow: column !important;
	justify-content: center;
	align-content: flex-start;
	padding: 20px;

	.field {
		label {
			font-size: 1em;
		}
	}

`;

const TopFields = styled.div`
  background: pink;
  display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	flex: 1 0 auto;
	padding: 20px;
`;

const MiddleFields = styled.div`
  background: aqua;
  padding: 20px;
  display: flex;
	
	flex-basis: 100%;	
`;

const BottomFields = styled.div`
  background: indigo;
  padding: 20px;
  display: flex;
	flex-wrap: wrap;
	flex: 1 0 auto;
`;

class UpdateIngredient extends Component {
	state = { 
		isDraftMode: false, // TODO move this into Apollo's local cache
	};

	handleChange = e => {
		const { name, type, value } = e.target;

		this.setState({
			[name]: value
		});
	};

	render() {
    return (
    	<Composed getIngredientVariables={ this.props.id }>
    		{
    			({ getIngredient }) => {
    				const { data, loading } = getIngredient;

    				// TODO design loading icon
						if (loading) return <p>Loading...</p>;
						// TODO not found message
						if (!data || !data.ingredient) return <p>No ingredient found for { this.props.id }</p>;

						return (
				    	<IngredientCard autoComplete="off">
				    		<TopFields>
				    			
				    		</TopFields>

				    		<MiddleFields>
				    			
				    		</MiddleFields>

				    		<BottomFields>
				    			
				    		</BottomFields>
				    	</IngredientCard>
				    );    				
    			}
    		}
    	</Composed>
    );
  }
}

export default UpdateIngredient;