import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';

import List from './form/List';

const ALL_CATEGORIES_QUERY = gql`
	query ALL_CATEGORIES_QUERY {
		categories {
			id
			name
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
	getCategories: ({ render }) => <Query query={ ALL_CATEGORIES_QUERY }>{ render }</Query>,
	addCategory: ({ render, addCategoryVariables }) => <Mutation mutation={ CREATE_CATEGORY_MUTATION } variables={ addCategoryVariables }>{ render }</Mutation>
});

class CategoriesList extends Component {
	state = {};

	addCategory = async (category, addCategoryMutation) => {
		const res = await addCategoryMutation({
			variables: {
				name: category
			}
		});

		this.props.addCategory(res.data.createCategory);
	};

  render() {
  	const { loading, list } = this.props;

	  	return (
	  		<Composed addCategoryVariables={ this.state }>
    		{
    			({ getCategories, addCategory }) => {
    				const { data, loading } = getCategories;

						return (
							<List
								allowDelete={ true }
								allListItems={ data.categories }
								addToList={ this.props.addCategory }
			    			isEditMode={ true }
			    			label="Categories"
								list={ list }
								loading={ loading }
								onDeleteClick={ this.props.onDeleteClick }
								onCreateListItem={ this.addCategory }
								addListItemMutation={ addCategory }
			    		/>
						);
					}
				}
				</Composed>
			);
	}
}

export default CategoriesList;