import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Category from './Category';

const ALL_CATEGORIES_QUERY = gql`
	query ALL_CATEGORIES_QUERY {
		categories {
			id
			name
		}
	}
`;

const CategoriesStyles = styled.div`

`;

const CategoryList = styled.div`

`;

class Categories extends Component {
	render() {
		return (
			<CategoriesStyles>
				<h2>Categories</h2>
				<Query query={ ALL_CATEGORIES_QUERY }>
					{
						({ data, error, loading }) => {
							if (loading) return <p>Loading...</p>;
							if (error) return <p>Error: { error.message }</p>;

							return ( 
								<CategoryList>
									{
										data.categories.map(c => 
											<Category category={ c } key={ c.id } />
										)
									}
								</CategoryList>
							);
						}
					}
				</Query>
			</CategoriesStyles>
		)
	}
}

export default Categories;
export { ALL_CATEGORIES_QUERY };