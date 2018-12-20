import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Tag from './Tag';

const ALL_TAGS_QUERY = gql`
	query ALL_TAGS_QUERY {
		tags {
			id
			name
		}
	}
`;

const TagsStyles = styled.div`

`;

const TagList = styled.div`

`;

class Tags extends Component {
	render() {
		return (
			<TagsStyles>
				<h2>Tags</h2>
				<Query query={ ALL_TAGS_QUERY }>
					{
						({ data, error, loading }) => {
							if (loading) return <p>Loading...</p>;
							if (error) return <p>Error: { error.message }</p>;

							return ( 
								<TagList>
									{
										data.tags.map(t => 
											<Tag tag={ t } key={ t.id } />
										)
									}
								</TagList>
							);
						}
					}
				</Query>
			</TagsStyles>
		)
	}
}

export default Tags;
export { ALL_TAGS_QUERY };