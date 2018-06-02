import axios from 'axios';
import React, { Component } from 'react';
import { NotificationManager } from 'react-notifications';

import './Index.css';

class Index extends Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {
				data: 0,
				parsing: 0,
				semantic: 0,
				total: 0

			},
			ingredients: 0,
			lines: 0,
			recipes: 0
		};
	}

	componentDidMount() {
    this.getErrorCount();
    this.getIngredientCount();
    this.getLineCount();
    this.getRecipeCount();
  }

	getErrorCount() {
		axios.get('/ingredients/errors/count')
      .then(res => {
      	this.setState({
      		errors: res.data.errors
      	});
      })
      .catch(err => {
      	NotificationManager.error('', 'Could not get error count', 3000);
      });
	}

	getIngredientCount() {
		axios.get('/ingredients/count')
      .then(res => {
      	this.setState({
      		ingredients: res.data.count
      	});
      })
      .catch(err => {
      	NotificationManager.error('', 'Could not get ingredient count', 3000);
      });
	}

	getLineCount() {
		axios.get('recipes/ingredientLines/count')
      .then(res => {
      	this.setState({
      		lines: res.data.count
      	});
      })
      .catch(err => {
      	NotificationManager.error('', 'Could not get line count', 3000);
      });
	}

	getRecipeCount() {
		axios.get('/recipes/count')
      .then(res => {
      	this.setState({
      		recipes: res.data.count
      	});
      })
      .catch(err => {
      	NotificationManager.error('', 'Could not get recipe count', 3000);
      });
	}

	render() {
		const { errors, ingredients, lines, recipes } = this.state;

		return (
			<article id="dashboard">
				<header>
					<h1>Dashboard</h1>
				</header>
				<section>
					<div>Errors: { (errors && errors.hasOwnProperty('total')) ? errors.total : 0 }</div>
					<div>Ingredients: { ingredients }</div>
					<div>Lines: { lines }</div>
					<div>Recipes: { recipes }</div>

					<h2>Percentages</h2>
					<div>Overall Accuracy: { (errors && errors.hasOwnProperty('total') && lines && (lines > 0)) ? `${(100 - (((errors.total) / lines) * 100)).toFixed(2)}%` : null }</div>
					<div>Adjusted Accuracy: { (errors && errors.hasOwnProperty('parsing') && errors.hasOwnProperty('semantic') && lines && (lines > 0)) ? `${(100 - (((errors.parsing + errors.semantic) / lines) * 100)).toFixed(2)}%` : null }</div>
					<div>Parse Rate: { (errors && errors.hasOwnProperty('parsing') && lines && (lines > 0)) ? `${(100 - (((errors.parsing) / lines) * 100)).toFixed(2)}%` : null }</div>
					<div>Data Accuracy: { (errors && errors.hasOwnProperty('data') && lines && (lines > 0)) ? `${(100 - (((errors.data) / lines) * 100)).toFixed(2)}%` : null }</div>


					<h2>Errors</h2>
					{ /* an error that caused the grammar to fail */ }
					<div>Parsing Errors: { (errors && errors.hasOwnProperty('parsing')) ? errors.parsing : 0 }</div>

					{ /* the parsed ingredient was incomplete or incorrect */ }
					<div>Semantic Errors: { (errors && errors.hasOwnProperty('semantic')) ? errors.semantic : 0 }</div>

					{ /* an error caused by bad input data from the original note */ }
					<div>Data Errors: { (errors && errors.hasOwnProperty('data')) ? errors.data : 0 }</div>
				</section>
			</article>
		);
	}
}

export default Index;