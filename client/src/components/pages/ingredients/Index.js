import axios from 'axios';
import React, { Component } from 'react';
import { NotificationManager } from 'react-notifications';

import './Index.css';

class Index extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ingredients: []
		};
	}

	componentDidMount() {
    this.getIngredients();
  }

	getIngredients() {
		axios.get('/ingredients')
      .then(res => {
      	const ingredients = res.data.ingredients.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

      	this.setState({
      		ingredients
      	});
      })
      .catch(err => {
      	NotificationManager.error('', 'Could not get ingredients', 3000);
      });
	}

	render() {
		const { ingredients } = this.state;

		return (
			<article id="ingredients">
				<header>
					<h1>Ingredients</h1>
				</header>
				<section>
					<ul>
						{ ingredients.map(i => <li key={ i.ingredientID }>{ i.name }</li>) }
					</ul>
				</section>
			</article>
		);
	}
}

export default Index;