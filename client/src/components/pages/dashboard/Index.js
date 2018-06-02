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

		// TODO list errors by error type

		return (
			<article id="dashboard">
				<h1>Dashboard</h1>
				<div>Errors: { (errors && errors.total) ? errors.total : 0 }</div>
				<div>Ingredients: { ingredients }</div>
				<div>Lines: { lines }</div>
				<div>Recipes: { recipes }</div>

				<div>Parse Rate: { (errors && errors.total & lines && (lines > 0)) ? `${(100 - ((errors.total / lines) * 100)).toFixed(2)}%` : null }</div>

				<h2>Errors</h2>
				{ /* an error that caused the grammar to fail */ }
				<div>Parsing Errors: { (errors && errors.parsing) ? errors.parsing : 0 }</div>

				{ /* the parsed ingredient was incomplete or incorrect */ }
				<div>Semantic Errors: { (errors && errors.semantic) ? errors.semantic : 0 }</div>

				{ /* an error caused by bad input data from the original note */ }
				<div>Data Errors: { (errors && errors.data) ? errors.data : 0 }</div>

			</article>
		);
	}
}

export default Index;