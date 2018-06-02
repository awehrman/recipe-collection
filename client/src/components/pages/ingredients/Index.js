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
			status: '',

			currentGroup: 'name',
			groups: [
				{ group: 'name', labels: [ '@', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ] },
				{ group: 'property', labels: [ 'meat', 'poultry', 'fish', 'dairy', 'soy', 'gluten', 'other' ] },
				{ group: 'count', labels: [ '1', '2-9', '10-19', '20-29', '30-39', '40-49', '50+' ] },
				{ group: 'relationship', labels: [ 'child', 'parent' ] } 
			],

			currentView: {
				activeIngredient: null,
				containers: [],
				ingredients: [],
				view: 'all'
			},
			views: [ 'all', 'new', 'search' ],
		};
	}

	componentDidMount() {
		// TODO limit by view?
    this.getIngredients();
  }

	getIngredients() {
		// TODO may want to limit this result set down to ingredientID, name, isRootIngredient
		// and then do subsequent gets on card open
		axios.get('/ingredients')
      .then(res => {
      	const ingredients = res.data.ingredients.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

      	this.setState({
      		ingredients
      	}, () => this.updateView('all'));
      })
      .catch(err => {
      	NotificationManager.error('', 'Could not get ingredients', 3000);
      });
	}

	updateGroup() {
		// TODO
	}

	updateView(view = null, resultSet = [], resultStatus = []) {
		let containers = [];
		let filteredIngredients = [];
		let activeIngredient = null;
		
		let { currentGroup, currentView, status } = this.state;
		const ingredients = [ ...this.state.ingredients ]; // TODO is this sufficient for deep nesting?

		if (!view) {
			view = currentView.view;
		}

		console.warn(view);

		// filter ingredients by view conditions
		switch(view) {
			case 'all':
				filteredIngredients = ingredients; // TODO is this a safe copy?
				// set view message if we don't have any ingredients
				if (status === '' && filteredIngredients && filteredIngredients.length === 0) {
		  		status = "No ingredients have been added yet.";
		  	}

				break;
			case 'new':
				filteredIngredients = ingredients.filter(i => !i.isValidated);

				// set view message if we don't have any new unverified ingredients
				if (status === '' && filteredIngredients && filteredIngredients.length === 0) {
		  		status = "No new ingredients have been imported.";
		  	}

				break;
			case 'search':
				filteredIngredients = (resultSet) ? resultSet : [];
				status = resultStatus;

				break;
			default:
				filteredIngredients = resultSet;
				status = resultStatus;
				break;
		}

		// group ingredients into containers
		switch(currentGroup) {
  		case 'property':
  			/*const { propertyLabels } = this.state;

  			containers = propertyLabels.map((label, index) => {
  				let groupIngredients = [];

					switch (label) {
						case "Meat":
							groupIngredients = filteredIngredients.filter(i => i.properties.meat);
							break;
						case "Poultry":
							groupIngredients = filteredIngredients.filter(i => i.properties.poultry);
							break;
						case "Fish":
							groupIngredients = filteredIngredients.filter(i => i.properties.fish);
							break;
						case "Dairy":
							groupIngredients = filteredIngredients.filter(i => i.properties.dairy);
							break;
						case "Soy":
							groupIngredients = filteredIngredients.filter(i => i.properties.soy);
							break;
						case "Gluten":
							groupIngredients = filteredIngredients.filter(i => i.properties.gluten);
							break;
						default: // other
							groupIngredients = filteredIngredients.filter(i => {
								let result = true;
								for (let p in i.properties) {
									if (i.properties[p]) {
										result = false;
										break;
									}
								}
								return result;
							});
							break;
					}

					if (container && (container.label === label)) {
						if (view === 'new' && isInitialized) {
		  				activeIngredient = getNextIngredient(groupIngredients, container);
		  			}
		  		} else {
		  			activeIngredient = null;
		  		}

		  		isContainerExpanded = (containers && containers[index]) ? containers[index].isContainerExpanded : isContainerExpanded;

					if (groupIngredients.length > 0) {
						return {
							label,
							count: groupIngredients.length,
		  				ingredients: groupIngredients,
		  				isContainerExpanded,
		  				isCardExpanded: (activeIngredient) ? true : false,
		  				activeIngredient
						};
					} return null;
				}).filter(c => c !== null);*/
  			break;
  		case 'count':
  			/*const { countLabels } = this.state;

  			console.warn(filteredIngredients);

  			containers = countLabels.map((label, index) => {
  				let groupIngredients = [];

					switch (label) {
						case "1":
							groupIngredients = filteredIngredients.filter(i => i.references.length === 1);
							break;
						case "2-5":
							groupIngredients = filteredIngredients.filter(i => i.references.length > 1 && i.references.length <= 5);
							break;
						case "6-10":
							groupIngredients = filteredIngredients.filter(i => i.references.length > 5 && i.references.length <= 10);
							break;
						case "11-20":
							groupIngredients = filteredIngredients.filter(i => i.references.length > 10 && i.references.length <= 20);
							break;
						default: // 21+
							groupIngredients = filteredIngredients.filter(i => i.references.length > 20);
							break;
					}

					if (container && (container.label === label)) {
						if (view === 'new' && isInitialized) {
		  				activeIngredient = getNextIngredient(groupIngredients, container);
		  			}
		  		} else {
		  			activeIngredient = null;
		  		}

		  		isContainerExpanded = (containers && containers[index]) ? containers[index].isContainerExpanded : isContainerExpanded;

					if (groupIngredients.length > 0) {
						return {
							label,
							count: groupIngredients.length,
		  				ingredients: groupIngredients,
		  				isContainerExpanded,
		  				isCardExpanded: (activeIngredient) ? true : false,
		  				activeIngredient
						};
					} return null;
				}).filter(c => c !== null);*/
  			break;
  		case 'relation':
  			// TODO
  			break;
  		default: // name
  			if (view === 'new') {
  				// TODO
  				//activeIngredient = getNextIngredient(filteredIngredients, container);
  			}

	  		if (filteredIngredients && filteredIngredients.length > 0) {
	  			containers = [{
	  				label: (view === 'search') ? `Search Results` : `${view.charAt(0).toUpperCase() + view.slice(1)} Ingredients`,
	  				count: filteredIngredients.length,
	  				ingredients: filteredIngredients,
	  				// TODO
	  				//isContainerExpanded: true,
	  				//isCardExpanded: (container && container.isCardExpanded && filteredIngredients && filteredIngredients.length > 0 && activeIngredient) ? true : false, // TODO
	  			}];
	  		} else {
	  			containers = [];
	  		}
  			break;
  	}

		// TODO activeIngredient


		this.setState({
			currentView: {
				activeIngredient,
				containers,
				ingredients: filteredIngredients,
				view,
			},
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
  	const currentView = Object.assign({}, this.state.currentView);
  	const containers = (currentView && currentView.hasOwnProperty('containers') ? currentView.containers : []);

		return (
			<div className="view">
				<ul className="containers">
		  		{
			  		containers.map(c => {
				  		return (
				  			<li className="container" key={ c.label }>
				  				{/* Group Header */}
					  			<div className="line">
					  				{ c.label }
					  				<span className="count">{ c.count }</span>
					  			</div>

					  			{/* Ingredient List */}
					  			<ul className="ingredients" id={ c.label }>
										{ this.renderIngredients(c) }
									</ul>

									{/* TODO Expanded Card */}
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
					{ (status !== '') ? <span className="status">{ status }</span> : null }
					{ this.renderFilters() }
					{ this.renderView() }
				</section>
			</article>
		);
	}
}

export default Index;