import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';

import List from './form/List';

const ALL_TAGS_QUERY = gql`
	query ALL_TAGS_QUERY {
		tags {
			id
			name
		}
	}
`;

const CREATE_TAG_MUTATION = gql`
  mutation CREATE_TAG_MUTATION(
    $name: String!,
  ) {
    createTag(
      name: $name,
    ) {
      id
      name
    }
  }
`;

const Composed = adopt({
	getTags: ({ render }) => <Query query={ ALL_TAGS_QUERY }>{ render }</Query>,
	addTag: ({ render, addTagVariables }) => <Mutation mutation={ CREATE_TAG_MUTATION } variables={ addTagVariables }>{ render }</Mutation>
});

class TagsList extends Component {
	state = {};

	addTag = async (tag, addTagMutation) => {
		const res = await addTagMutation({
			variables: {
				name: tag
			}
		});

		this.props.addTag(res.data.createTag);
	};

  render() {
  	const { loading, list } = this.props;

	  	return (
	  		<Composed addTagVariables={ this.state }>
    		{
    			({ getTags, addTag }) => {
    				const { data, loading } = getTags;

						return (
							<List
								allowDelete={ true }
								allListItems={ data.tags }
								addToList={ this.props.addTag }
			    			isEditMode={ true }
			    			label="Tags"
								list={ list }
								loading={ loading }
								onDeleteClick={ this.props.onDeleteClick }
								onCreateListItem={ this.addTag }
								addListItemMutation={ addTag }
			    		/>
						);
					}
				}
				</Composed>
			);
	}
}

export default TagsList;