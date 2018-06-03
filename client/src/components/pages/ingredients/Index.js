import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { NotificationManager } from 'react-notifications';

import './Index.css';

class Index extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ingredients: [],
			status: 'Loading Ingredients ...',

			currentGroup: 'relationship',
			groups: [ 'name', 'property', 'count', 'relationship' ],

			currentView: 'all',
			views: [ 'all', 'new', 'search' ],

			containers: [{
				label: 'All Ingredients',
				count: 0,
				ingredients: [],
				isExpanded: true,
				isCardView: false,
				currentIngredient: null
			}]
		};
	}

	componentDidMount() {
    this.getIngredientList();
  }

	getIngredientList() {
		const { views, currentView } = this.state;

		// check if we're passing a view in through our URL
		let view = this.props.location.pathname.split('/ingredients')[1];
		view = (view !== '' && view !== '/') ? view.split('/')[1] : null;

		// if this is an invalid view in the URL, just use the previous currentView
		if (!view || (views.indexOf(view) === -1)) {
			view = currentView;
		}

		axios.get('/ingredients/list')
      .then(res => {
      	const ingredients = res.data.ingredients.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

      	this.setState({
      		ingredients,
      		currentView: view
      	}, () => this.updateView(view));
      })
      .catch(err => {
      	NotificationManager.error('', 'Could not get ingredients', 3000);
      });
	}

	updateGroup() {
		const { currentGroup, groups } = this.state;
		const currentIndex = groups.findIndex(g => g === currentGroup);
		const nextGroup = (currentIndex !== (groups.length - 1)) ? groups[currentIndex + 1] : groups[0];

  	this.setState({
  		currentGroup: nextGroup
  	}, () => this.updateView());
	}

	updateView(view = null) {
		let containers = [];
		
		let { currentGroup, currentView, status } = this.state;
		// TODO how deep of a clone do we need here?
		let viewIngredients = [ ...this.state.ingredients ];

		if (!view) {
			view = currentView;
		}

		// filter ingredients by view conditions
		switch(view) {
			case 'new':
				viewIngredients = viewIngredients.filter(i => !i.isValidated);

				// set view message if we don't have any new unverified ingredients
				if (viewIngredients && viewIngredients.length === 0) {
		  		status = "No new ingredients have been added.";
		  	} else {
		  		status = '';
		  	}

				break;
			case 'search':
				// TODO
				//viewIngredients = (resultSet) ? resultSet : [];
				//status = resultStatus;

				break;
			default: // all
				// set view message if we don't have any ingredients
				if (viewIngredients && viewIngredients.length === 0) {
		  		status = "No ingredients have been added.";
		  	} else {
		  		status = '';
		  	}
				break;
		}

		// group ingredients into containers
		switch(currentGroup) {
  		case 'property':
  			const labels = [ 'meat', 'poultry', 'fish', 'dairy', 'soy', 'gluten', 'other' ];

  			containers = labels.map(label => {
  				let containerIngredients = [];

  				if (label !== 'other') {
  					containerIngredients = viewIngredients.filter(i => i.properties.hasOwnProperty(label) && i.properties[label]);
  				} else {
  					// if this ingredient didn't get put into any other containers
  					containerIngredients = viewIngredients.filter(i => {
							let result = true;
							for (let p in i.properties) {
								if (i.properties[p]) {
									result = false;
									break;
								}
							}
							return result;
						});
  				}

					if (containerIngredients.length > 0) {
						return {
							label: label.charAt(0).toUpperCase() + label.slice(1),
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: true, // TODO
							isCardView: false, // TODO
							currentIngredient: null // TODO
						};
					} return null;
				}).filter(c => c);
  			break;
  		case 'count':
  			// get the largest references count from the bunch
  			const upperBound = viewIngredients.map(i => i.referenceCount).reduce((prev, current) => (prev > current) ? prev : current);
  			
  			// determine exception categories for ingredients with 0 and/or 1 references
  			const zeroReferences = (viewIngredients.filter(i => i.referenceCount === 0).length > 0) ? 1 : 0;
  			const singleReferences = (viewIngredients.filter(i => i.referenceCount === 1).length > 0) ? 1 : 0;
  			
  			const containerSize = Math.ceil(upperBound / 10) + zeroReferences + singleReferences;

  			// setup label ranges
  			let rangeStart = 2;
  			let rangeEnd = 10;

  			// create an appropriately sized array
  			containers = [ ...Array(containerSize) ];
  			containers = containers.map((c, index) => {
  				let containerIngredients = [];

  				// put any ingredients with zero references in their own group
  				if (index === 0 && zeroReferences) {
  					containerIngredients = viewIngredients.filter(i => i.referenceCount === 0);

  					return {
							label: "0 References",
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: true, // TODO
							isCardView: false, // TODO
							currentIngredient: null // TODO
						};
  				}

  				// put any ingredients with a singular references in their own group
  				if ((index === 0 || index === 1) && singleReferences) {
  					containerIngredients = viewIngredients.filter(i => i.referenceCount === 1);

  					return {
							label: "1 Reference",
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: true, // TODO
							isCardView: false, // TODO
							currentIngredient: null // TODO
						};
  				}

					// adjust the index based on whether we have any exception groups  				
  				const adjustedIndex = (index - zeroReferences - singleReferences);
  				
  				if (adjustedIndex > 0) {
	  				rangeStart = (adjustedIndex * 10) + 1;
	  				rangeEnd = (adjustedIndex * 10) + 10;
	  			}

	  			containerIngredients = viewIngredients.filter(i => i.referenceCount >= rangeStart && i.referenceCount <= rangeEnd);

  				return {
						label: `${rangeStart}-${rangeEnd} References`,
						count: containerIngredients.length,
						ingredients: containerIngredients,
						isExpanded: true, // TODO
						isCardView: false, // TODO
						currentIngredient: null // TODO
					};
  			}).filter(c => c);

  			break;
  		case 'relationship':
  			const parentIngredients = viewIngredients.filter(i => i.parentIngredientID);
  			const childIngredients = viewIngredients.filter(i => !i.parentIngredientID);

  			if (parentIngredients.length > 0) {
					containers.push({
						label: `Parent Ingredients`,
						count: parentIngredients.length,
						ingredients: parentIngredients,
						isExpanded: true, // TODO
						isCardView: false, // TODO
						currentIngredient: null // TODO
					});
				}

  			if (childIngredients.length > 0) {
					containers.push({
						label: `Child Ingredients`,
						count: childIngredients.length,
						ingredients: childIngredients,
						isExpanded: true, // TODO
						isCardView: false, // TODO
						currentIngredient: null // TODO
					});
				}
  			break;
  		default: // name
  			containers.push({
					label: (currentView === 'search') ? `Search Results` : `${currentView.charAt(0).toUpperCase() + currentView.slice(1)} Ingredients`,
					count: viewIngredients.length,
					ingredients: viewIngredients,
					isExpanded: true, // TODO
					isCardView: false, // TODO
					currentIngredient: null // TODO
				});
  			break;
  	}

  	console.warn(view);
  	console.log(containers);

		this.setState({
			currentView: view,
			containers,
			status
		});
	}

	renderIngredients(container) {
		let ingredientList = [];

  	// if we have more than 100 ingredients in this container, we'll group these by letter
  	if (container.ingredients && container.ingredients.length > 100) {
  		const alphabet = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  		let nonAlphaCharacters = container.ingredients.filter(i => !~alphabet.indexOf(i.name[0]));

  		// TODO consider adding symbol header

  		// handle any non-alpha characters as a single grouping
  		ingredientList.push(nonAlphaCharacters.map(i =>
  			<li className="ingredient" key={ `li_${i.ingredientID}` }>
					{ i.name }
				</li>
  		));

  		ingredientList.push(alphabet.map(a => {
  			// create a placeholder for the letter ('A')
  			const header = [ <li className="header"  key={ `li_${a}` }>{ a }</li> ];
  			// create list items for each ingredient under than letter ('aleppo chili pepper', 'allspice', 'almond')
  			const groupingByLetter = container.ingredients.map(i => {
					if (a === i.name.toLowerCase().charAt(0)) {
						return (
							<li className="ingredient"  key={ `li_${i.ingredientID}` }>
								{ i.name }
							</li>
						);
					} return null;
				}).filter(i => i);

				return (groupingByLetter.length > 0) ? header.concat(groupingByLetter) : null;
  		}));
  	} else {
  		// otherwise we'll just list out the ingredients
  		ingredientList.push(container.ingredients.map(i =>
  			<li className="ingredient" key={ `li_${i.ingredientID}` }>
					{ i.name }
				</li>
  		));
  	}

  	return ingredientList;
	}

	renderFilters() {
		const { currentGroup, currentView, ingredients } = this.state;
		const newIngCount = ingredients.filter(i => !i.isValidated);

		let newClassList = (currentView === 'new') ? 'active' : '';
  	// if we have unverified ingredients, add an additional class for color
  	newClassList += (newIngCount.length !== 0) ? ' new' : '';

		return (
			<div className="filters">
  			{/* View Selection */}
	  		<div className="left">
					<Link to={ `/ingredients` } className={ (currentView === 'all') ? 'active' : '' } onClick={ () => this.updateView('all') }>
						{ `View All ${ingredients.length}` }
					</Link>
					<Link to={ `/ingredients/new` } className={ newClassList } onClick={ () => this.updateView('new') }>
						{ `Newly Imported ${newIngCount.length}` }
					</Link>
	  		</div>

	  		{/* group Selection */}
	  		<div className="right">
					<div className="groupBy">
						Group By
						<button type="button" className="group" onClick={ () => this.updateGroup() }>{ currentGroup }</button>
					</div>
	  		</div>
	  	</div>
		);
	}

	renderView() {
		const { containers } = this.state;

		return (
			<div className="view">
				<ul className="containers">
		  		{
			  		containers.map(c => {
				  		return (
				  			<li className="container" key={ c.label }>
				  				{/* Container Header */}
					  			<div className="line">
					  				{ c.label }
					  				<span className="count">{ c.count }</span>
					  			</div>

					  			{/* Container Ingredients */}
					  			<ul className="ingredients" id={ c.label }>
										{ this.renderIngredients(c) }
									</ul>

									{/* TODO Container Card */}
					  		</li>
					  	)
				  	})
			  	}
			  </ul>
			</div>
		);
	}

	render() {
		const { status } = this.state;

		return (
			<article id="ingredients">
				<header>
					<h1>Ingredients</h1>
				</header>
				<section>
					{ this.renderFilters() }
					{
						(status && status.length > 0)
							? <span className="status">{ status }</span>
							: this.renderView()
					}
				</section>
			</article>
		);
	}
}

export default Index;