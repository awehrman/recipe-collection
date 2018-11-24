import axios from 'axios';
import React, { Component } from 'react';
import { NotificationManager } from 'react-notifications';

import './Index.css';

class Index extends Component {
	constructor(props) {
		super(props);

		this.state = {
			recipes: []
		};
	}

	componentDidMount() {
    this.getRecipes();
  }

	getRecipes() {
		axios.get('/recipes')
      .then(res => {
      	const recipes = res.data.recipes.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
      	console.log(res.data);
      	this.setState({
      		recipes
      	});
      })
      .catch(err => {
      	NotificationManager.error('', 'Could not get recipes', 3000);
      });
	}

	render() {
		const { recipes } = this.state;

		return (
			<article id="recipes">
				<header>
					<h1>Recipes</h1>
				</header>
				<section>
					<ul>
						{ recipes.map(i => <li key={ i.recipeID }>{ i.title }</li>) }
					</ul>
				</section>
			</article>
		);
	}
}

export default Index;