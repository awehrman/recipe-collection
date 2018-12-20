import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import styled from 'styled-components';
import { adopt } from 'react-adopt';

import Error from './ErrorMessage';
import CategoriesList from './CategoriesList';
import TagsList from './TagsList';

const SINGLE_RECIPE_QUERY = gql`
	query SINGLE_RECIPE_QUERY($id: ID!) {
		recipe(where: { id: $id }) {
			id
			evernoteGUID
			title
			image
			source
			categories {
				id
				name
			}
			tags {
				id
				name
			}
			ingredients {
				id
				blockIndex
				lineIndex
				reference
			}
			instructions {
				id
				blockIndex
				reference
			}
		}
	}
`;

const UPDATE_RECIPE_MUTATION = gql`
  mutation UPDATE_RECIPE_MUTATION(
  	$id: ID!,
    $evernoteGUID: String,
    $title: String,
    $image: String,
    $source: String,
    $categoryConnections: [ ID! ],
		$categoryDisconnections: [ ID! ],
		$tagConnections: [ ID! ],
		$tagDisconnections: [ ID! ]
  ) {
    updateRecipe(
    	id: $id, 
      evernoteGUID: $evernoteGUID,
      title: $title,
      image: $image,
      source: $source,
      categoryConnections: $categoryConnections,
      categoryDisconnections: $categoryDisconnections,
      tagConnections: $tagConnections,
      tagDisconnections: $tagDisconnections
    ) {
      id
      evernoteGUID
      title
      image
      source
      categories {
      	id
      	name
      }
      tags {
      	id
      	name
      }
    }
  }
`;

const Composed = adopt({
	getRecipe: ({ render, getRecipeVariables }) => <Query query={ SINGLE_RECIPE_QUERY } variables={ { id: getRecipeVariables } }>{ render }</Query>,
	updateRecipe: ({ render, updateRecipeVariables }) => <Mutation mutation={ UPDATE_RECIPE_MUTATION } variables={ updateRecipeVariables }>{ render }</Mutation>
});

const FormStyles = styled.form`
  label {
    display: block;
    margin-bottom: 1rem;
  }
  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid black;
    &:focus {
      outline: 0;
      border-color: ${ props => props.theme.highlight };
    }
  }
  button,
  input[type='submit'] {
    width: auto;
    background: ${ props => props.theme.highlight };
    color: white;
    border: 0;
    font-size: 2rem;
    font-weight: 600;
    padding: 0.5rem 1.2rem;
  }
  fieldset {
    border: 0;
    padding: 0;

    &[disabled] {
      opacity: 0.5;
    }
    &[aria-busy='true']::before {
      background-size: 50% auto;
     /* animation: ${loading} 0.5s linear infinite;*/
    }
  }
`;

class UpdateRecipe extends Component {
	state = { 
		isDraftMode: false, // TODO move this into Apollo's local cache
		updates: {}
	};

	handleChange = e => {
		const { name, type, value } = e.target;

		this.setState({
			[name]: value
		});
	};

	uploadImage = async e => {
		const files = e.target.files;

		const data = new FormData();
		data.append('file', files[0]);
		data.append('upload_preset', 'rp_collection');

		const res = await fetch('https://api.cloudinary.com/v1_1/zsh2v1/image/upload', {
      method: 'POST',
      body: data,
    });

    const file = await res.json();

    // not sure if this is has the applied transformation or not
    this.setState({
      image: file.secure_url
    });
	};

	addCategory = (category) => {
		let { updates } = this.state;

		if (updates.categoryConnections) {
			updates.categoryConnections.push(category);
		} else {
			updates.categoryConnections = [ category ];
		}

		this.setState({
			isDraftMode: true,
			updates
		});
	};

	removeCategory = (category) => {
		let { updates } = this.state;

		if (updates.categoryDisconnections) {
			updates.categoryDisconnections.push(category);
		} else {
			updates.categoryDisconnections = [ category ];
		}

		this.setState({
			isDraftMode: true,
			updates
		});
	};

	addTag = (tag) => {
		let { updates } = this.state;

		if (updates.tagConnections) {
			updates.tagConnections.push(tag);
		} else {
			updates.tagConnections = [ tag ];
		}

		this.setState({
			isDraftMode: true,
			updates
		});
	};

	removeTag = (tag) => {
		let { updates } = this.state;

		if (updates.tagDisconnections) {
			updates.tagDisconnections.push(tag);
		} else {
			updates.tagDisconnections = [ tag ];
		}

		this.setState({
			isDraftMode: true,
			updates
		});
	};

	updateRecipe = async (e, updateRecipeMutation) => {
		e.preventDefault();
		const updates = { ...this.state.updates };
 
		// trim category updates down to just the id's
		if (updates.categoryDisconnections) {
			updates.categoryDisconnections = updates.categoryDisconnections.map(c => c.id);
		}

		if (updates.categoryConnections) {
			updates.categoryConnections = updates.categoryConnections.map(c => c.id);
		}

		if (updates.tagDisconnections) {
			updates.tagDisconnections = updates.tagDisconnections.map(c => c.id);
		}

		if (updates.tagConnections) {
			updates.tagConnections = updates.tagConnections.map(c => c.id);
		}

		await updateRecipeMutation({
			variables: {
				id: this.props.id,
				...updates
			}
		});

		this.setState({
			isDraftMode: false,
			updates: {}
		});
	};

	render() {
    return (
    	<Composed getRecipeVariables={ this.props.id } updateRecipeVariables={ this.state }>
    		{
    			({ getRecipe, updateRecipe }) => {
    				const { data, loading } = getRecipe;

						if (loading) return <p>Loading...</p>;
						if (!data || !data.recipe) return <p>No recipe found for { this.props.id }</p>;

						const { isDraftMode, updates } = this.state;
						// merge category drafts with current data
						let categoriesDraft = [ ...data.recipe.categories ];
						let tagsDraft = [ ...data.recipe.tags ];
						let index = -1;

						// apply pending category updates
						if (updates.categoryConnections && updates.categoryConnections.length > 0) {
							updates.categoryConnections.forEach(cat => {
								categoriesDraft.push(cat);
							});
						}

						if (updates.categoryDisconnections && updates.categoryDisconnections.length > 0) {
	    				updates.categoryDisconnections.forEach(cat => {
								index = categoriesDraft.findIndex(c => c.id === cat.id);
						    if (index > -1) {
						      categoriesDraft.splice(index, 1);
						    }
							});
	    			}

	    			// apply pending tag updates
						if (updates.tagConnections && updates.tagConnections.length > 0) {
							updates.tagConnections.forEach(tag => {
								tagsDraft.push(tag);
							});
						}

						if (updates.tagDisconnections && updates.tagDisconnections.length > 0) {
	    				updates.tagDisconnections.forEach(tag => {
								index = tagsDraft.findIndex(t => t.id === tag.id);
						    if (index > -1) {
						      tagsDraft.splice(index, 1);
						    }
							});
	    			}

						return (
				    	<FormStyles onSubmit={ e => this.updateRecipe(e, updateRecipe) }>
								<Error error={ updateRecipe.error } />
				    		{
				  				(this.state.image || data.recipe.image) && (
				            <img width="50%" src={ this.state.image ? this.state.image : data.recipe.image } alt="Upload Preview" />
				          )
				        }
				    		<fieldset disabled={ loading } aria-busy={ loading }>
					    		<label htmlFor="evernoteGUID">
					    			EvernoteGUID
					    			<input
					    				type="text"
					    				id="evernoteGUID"
					    				name="evernoteGUID"
					    				defaultValue={ data.recipe.evernoteGUID }
					    				onChange={ this.handleChange }
					    			/>
					    		</label>
				    		</fieldset>

				    		<fieldset disabled={ loading } aria-busy={ loading }>
					    		<label htmlFor="title">
					    			Title
					    			<input
					    				type="text"
					    				id="title"
					    				name="title"
					    				defaultValue={ data.recipe.title }
					    				onChange={ this.handleChange }
					    			/>
					    		</label>
				    		</fieldset>

				    		<fieldset disabled={ loading } aria-busy={ loading }>
					    		<label htmlFor="image">
					    			Image
					    			<input
					    				type="file"
					    				id="image"
					    				name="image"
					    				placeholder="Upload an image"
					    				onChange={ this.uploadImage }
					    			/>
					    		</label>
				    		</fieldset>

				    		<fieldset disabled={ loading } aria-busy={ loading }>
					    		<label htmlFor="source">
					    			Source
					    			<input
					    				type="text"
					    				id="source"
					    				name="source"
					    				defaultValue={ data.recipe.source }
					    				onChange={ this.handleChange }
					    			/>
					    		</label>
				    		</fieldset>
								
								<CategoriesList
									loading={ loading }
									list={ isDraftMode ? categoriesDraft : data.recipe.categories }
									onDeleteClick={ this.removeCategory }
									addCategory={ this.addCategory }
								/>

								<TagsList
									loading={ loading }
									list={ isDraftMode ? tagsDraft : data.recipe.tags }
									onDeleteClick={ this.removeTag }
									addTag={ this.addTag }
								/>

								<fieldset disabled={ loading } aria-busy={ loading }>
									<label htmlFor={ "ingredients" }>Ingredients</label>
									<ul>
									{
										(data.recipe.ingredients && data.recipe.ingredients.map(i =>
											<li key={ i.id }>{ i.reference }</li>
										))
									}
									</ul>
								</fieldset>

								<fieldset disabled={ loading } aria-busy={ loading }>
									<label htmlFor={ "instructions" }>Instructions</label>
									<ul>
									{
										(data.recipe.instructions && data.recipe.instructions.map(i =>
											<li key={ i.id }>{ i.reference }</li>
										))
									}
									</ul>
								</fieldset>

				    		<button type="submit">Sav{loading ? 'ing' : 'e'} Changes</button>
				    	</FormStyles>
				    );    				
    			}
    		}
    	</Composed>
    );
  }
}

export default UpdateRecipe;