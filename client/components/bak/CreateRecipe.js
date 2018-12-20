import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import styled from 'styled-components';

import Error from './ErrorMessage';

/*
	$categories: [ Category! ]! @relation(name: "RecipeCategories")
	$tags: [ Tag! ]! @relation(name: "RecipeTags")
	$ingredients: [ RecipeIngredient! ]! @relation(name: "RecipeIngredients")
	$instructions: [ RecipeInstruction! ]! @relation(name: "RecipeInstructions")
*/

const CREATE_RECIPE_MUTATION = gql`
  mutation CREATE_RECIPE_MUTATION(
    $evernoteGUID: String
		$image: String
		$source: String
		$title: String!
  ) {
    createRecipe(
      evernoteGUID: $evernoteGUID
      image: $image
      source: $source
      title: $title
    ) {
      id
    }
  }
`;

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

class CreateRecipe extends Component {
	state = {
		evernoteGUID: '',
		image: '',
		source: '',
		title: ''
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

	render() {
		const { title, source, image, evernoteGUID } = this.state;

    return (
    	<Mutation mutation={ CREATE_RECIPE_MUTATION } variables={ this.state }>
    		{
    			(createRecipe, { loading, error, called, data }) => (
    				<FormStyles onSubmit={ async e => {
								e.preventDefault();

								// call mutation
								const res = await createRecipe();
								console.log(res);

								// redirect to recipe page
								Router.push({
									pathname: '/recipe',
									query: { id: res.data.createRecipe.id }
								})
							} }>
    					<Error error={ error } />
			    		<h2>Add Recipe</h2>
			    		<fieldset disabled={ loading } aria-busy={ loading }>
				    		<label htmlFor="title">
				    			Title
				    			<input
				    				type="text"
				    				id="title"
				    				name="title"
				    				placeholder="Steak Au Poivre with Red Wine Pan Sauce"
				    				required
				    				value={ title }
				    				onChange={ this.handleChange }
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
				    				placeholder="http://www.foodandwine.com/recipes/steak-au-poivre-red-wine-pan-sauce"
				    				value={ source }
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
				    			{
				    				image && (
		                  <img width="200" src={this.state.image} alt="Upload Preview" />
		                )
		              }
				    		</label>
			    		</fieldset>

			    		<fieldset disabled={ loading } aria-busy={ loading }>
				    		<label htmlFor="evernoteGUID">
				    			EvernoteGUID
				    			<input
				    				type="text"
				    				id="evernoteGUID"
				    				name="evernoteGUID"
				    				placeholder="00734858-a8ad-485c-bed1-90c42d2cba23"
				    				value={ evernoteGUID }
				    				onChange={ this.handleChange }
				    			/>
				    		</label>
			    		</fieldset>

			    		<button>Submit</button>
			    	</FormStyles>
    			)
    		}
    	</Mutation>
    );
  }
}

export default CreateRecipe;
export { CREATE_RECIPE_MUTATION };