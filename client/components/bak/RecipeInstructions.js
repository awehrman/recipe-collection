import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';

import List from './form/List';

const CURRENT_RECIPE_INSTRUCTIONS_QUERY = gql`
	query CURRENT_RECIPE_INSTRUCTIONS_QUERY {
		recipes {
			instructions {
				id
				blockIndex
				reference
			}
		}
	}
`;

const CREATE_CATEGORY_MUTATION = gql`
  mutation CREATE_CATEGORY_MUTATION(
    $name: String!,
  ) {
    createCategory(
      name: $name,
    ) {
      id
      name
    }
  }
`;

const Composed = adopt({
	getInstructions: ({ render }) => <Query query={ CURRENT_RECIPE_INSTRUCTIONS_QUERY }>{ render }</Query>,
	addInstruction: ({ render, addInstructionVariables }) => <Mutation mutation={ CREATE_CATEGORY_MUTATION } variables={ addInstructionVariables }>{ render }</Mutation>
});

class RecipeInstructions extends Component {
	state = {};

	addInstruction = async (instruction, addInstructionMutation) => {
		const res = await addInstructionMutation({
			variables: {
				name: instruction
			}
		});

		this.props.addInstruction(res.data.createRecipeInstruction);
	};

  render() {
  	const { loading } = this.props;

	  	return (
	  		<Composed addInstructionVariables={ this.state }>
    		{
    			({ getInstructions, addInstruction }) => {
    				const { data, loading } = getInstructions;

						return (
							<ListStyles disabled={ loading } aria-busy={ loading }>
								{/* List Label */}
								<label htmlFor={ name }>{ label }</label>
							</ListStyles>
						);
					}
				}
				</Composed>
			);
	}
}

export default RecipeInstructions;