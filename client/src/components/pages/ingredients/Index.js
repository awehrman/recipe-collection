import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { NotificationManager } from 'react-notifications';

import { clone } from '../../../lib/util';
import Card from './Card';

import './Index.css';

class Index extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ingredients: [],
			ingredientsCount: 0,
			newIngredientsCount: 0,
			status: 'Loading Ingredients ...',

			currentGroup: 'name',
			groups: [ 'name', 'property', 'count', 'relationship' ],

			currentView: 'all',
			views: [ 'all', 'new', 'search' ],

			isPagerEnabled: false,
			pagerLabels: [],

			containers: [{
				label: 'All Ingredients',
				count: 0,
				ingredients: [],
				isExpanded: true,
				isCardEnabled: false,
				currentIngredient: null
			}]
		};

		this._source = axios.CancelToken.source();
		this.getIngredientList = this.getIngredientList.bind(this);
	}

	componentDidMount() {
    this.getIngredientList();
  }

  componentWillUnmount() {
    this._source.cancel('Cancelling request due to unmount.');
	}

  onContainerClick(e, container) {
  	// only hide container if we're clicking on the div itself
  	if (e.target.nodeName === 'DIV') {

	  	let containers = clone(this.state.containers);

	  	containers = containers.map(c => {
	  		// find and update the group that contains this ingredient
	  		if (c.label === container.label) {
	  			c.isExpanded = !c.isExpanded;
	  			c.isCardEnabled = false;
	  		} return c;
	  	});

	  	this.setState({
	  		containers
	  	});
	  }
  }

  onIngredientClick(e, container, ingredient) {
  	e.stopPropagation(); // prevent event from bubbling up to onContainerClick()

  	let containers = clone(this.state.containers);

  	// if no cards were expanded, then open the clicked on item
  	if (container.currentIngredient === null && !container.isCardEnabled) {
  		container.currentIngredient = clone(ingredient);
  		container.isCardEnabled = true;
  	}
  	// if we clicked on the same item that's currently expanded, close the card
  	else if (container.currentIngredient !== null && container.currentIngredient.ingredientID === ingredient.ingredientID) {
  		container.currentIngredient = null;
  		container.isCardEnabled = false;
  	}

  	// otherwise switch to the clicked on item
  	else {
  		container.currentIngredient = clone(ingredient);
  		container.isCardEnabled = true;
  	}

  	containers = containers.map(c => {
  		// find and update the group that contains this ingredient
  		if (c.label === container.label) {
  			c.currentIngredient = container.currentIngredient;
  			c.isCardEnabled = container.isCardEnabled;
  		}
  		return c;
  	});

  	this.setState({
  		containers
  	});
  }

	getIngredientList(currentIngredientID = null) {
		console.warn('getIngredientList');
		const { currentView } = this.state;
		const views = [ ...this.state.views ];

		// check if we're passing a view in through our URL
		let view = this.props.location.pathname.split('/ingredients')[1];
		view = (view !== '' && view !== '/') ? view.split('/')[1] : null;

		// if this is an invalid view in the URL, just use the previous currentView
		if (!view || (views.indexOf(view) === -1)) {
			view = currentView;
		}

		axios.get('/ingredients/list', { cancelToken: this._source.token })
      .then(res => {
      	const ingredients = res.data.ingredients.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

      	this.setState({
      		ingredients,
      		ingredientsCount: res.data.ingredients.length,
      		newIngredientsCount: res.data.ingredients.filter(i => !i.isValidated).length,
      		currentView: view
      	}, () => this.updateView(view, currentIngredientID));
      })
      .catch(err => {
      	NotificationManager.error('', 'Could not get ingredients', 3000);
      });
	}

	updateGroup() {
		const { currentGroup } = this.state;
		const groups = [ ...this.state.groups ];
		const currentIndex = groups.findIndex(g => g === currentGroup);
		const nextGroup = (currentIndex !== (groups.length - 1)) ? groups[currentIndex + 1] : groups[0];

  	this.setState({
  		currentGroup: nextGroup
  	}, () => this.updateView());
	}

	updateView(view = null, currentIngredient = null) {
		console.warn(`updateView: ${view} ${currentIngredient}`);
		let { currentGroup, currentView, isPagerEnabled, status } = this.state;
		let viewIngredients = clone(this.state.ingredients);
		let pagerLabels = [ ...this.state.pagerLabels ];
		let containers = [];
		let nextCurrent;
		currentIngredient = (currentIngredient) ? clone(currentIngredient) : null;

		// use the existing view if we didn't pass a new one
		view = (!view) ? currentView : view;

		// if we passed a currentIngredient, determine what the next ingredient should be
		const getNextIngredient = (ingredients, currentName) => {
			let i = 0;
			while (ingredients[i] && ingredients[i].hasOwnProperty('name') && currentName && (ingredients[i].name < currentName))
				{ i++; }

			if (ingredients[i]) {
				return ingredients[i];
			} else if (ingredients && ingredients.length > 0) {
				return ingredients[0];
			} return null;
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

  				// check if this container has our active ingredient
  				if (currentIngredient) {
  					nextCurrent = getNextIngredient(containerIngredients, currentIngredient.name);
  				}

					if (containerIngredients.length > 0) {
						return {
							label: label.charAt(0).toUpperCase() + label.slice(1),
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: true, // TODO
							isCardEnabled:  currentIngredient ? true : false,
							currentIngredient: currentIngredient ? nextCurrent : null
						};
					} return null;
				}).filter(c => c);
  			break;
  		case 'count':
  			console.log(viewIngredients.map(i => i.referenceCount));
  			// get the largest references count from the bunch
  			const upperBound = viewIngredients
									  				.map(i => i.referenceCount)
									  				.reduce((prev, current) => (prev > current) ? prev : current);
  			
  			// determine exception categories for ingredients with 0 and/or 1 references
  			const containsNoReferences = (viewIngredients.filter(i => i.referenceCount === 0).length > 0) ? 1 : 0;
  			const containsSingleReference = (viewIngredients.filter(i => i.referenceCount === 1).length > 0) ? 1 : 0;
  			
  			// determine number of groups needed outside of our two exception groups
  			let containerSize = (upperBound > 1) ? Math.ceil(upperBound / 10) : 0;
  			// add in the exception group count
  			containerSize += containsNoReferences + containsSingleReference;

  			// setup label ranges
  			let rangeStart = 2;
  			let rangeEnd = 10;

  			// create an appropriately sized array
  			containers = [ ...Array(containerSize) ];
  			containers = containers.map((c, index) => {
  				let containerIngredients = [];

  				// put any ingredients with zero references in their own group
  				if (index === 0 && containsNoReferences) {
  					containerIngredients = viewIngredients.filter(i => i.referenceCount === 0);

  					// check if this container has our active ingredient
	  				if (currentIngredient) {
	  					nextCurrent = getNextIngredient(containerIngredients, currentIngredient.name);
	  				}

  					return {
							label: "0 References",
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: true, // TODO
							isCardEnabled:  currentIngredient ? true : false,
							currentIngredient: currentIngredient ? nextCurrent : null
						};
  				}

  				// put any ingredients with a singular references in their own group
  				if ((index === 0 && !containsNoReferences) || (index === 1 && containsNoReferences)) {
  					containerIngredients = viewIngredients.filter(i => i.referenceCount === 1);

  					// check if this container has our active ingredient
	  				if (currentIngredient) {
	  					nextCurrent = getNextIngredient(containerIngredients, currentIngredient.name);
	  				}

  					return {
							label: "1 Reference",
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: true, // TODO
							isCardEnabled:  currentIngredient ? true : false,
							currentIngredient: currentIngredient ? nextCurrent : null
						};
  				}

					// adjust the index based on whether we have any exception groups  				
  				const adjustedIndex = (index - containsNoReferences - containsSingleReference);
  				
  				if (adjustedIndex > 0) {
	  				rangeStart = (adjustedIndex * 10) + 1;
	  				rangeEnd = (adjustedIndex * 10) + 10;
	  			}

	  			containerIngredients = viewIngredients.filter(i => i.referenceCount >= rangeStart && i.referenceCount <= rangeEnd);

	  			// check if this container has our active ingredient
  				if (currentIngredient) {
  					nextCurrent = getNextIngredient(containerIngredients, currentIngredient.name);
  				}

  				return {
						label: `${rangeStart}-${rangeEnd} References`,
						count: containerIngredients.length,
						ingredients: containerIngredients,
						isExpanded: true, // TODO
						isCardEnabled:  currentIngredient ? true : false,
						currentIngredient: currentIngredient ? nextCurrent : null
					};
  			}).filter(c => c);

  			break;
  		case 'relationship':
  			const parentIngredients = viewIngredients.filter(i => !i.parentIngredientID);
  			const childIngredients = viewIngredients.filter(i => i.parentIngredientID);


				// check if this container has our active ingredient
				if (currentIngredient) {
					nextCurrent = getNextIngredient(childIngredients, currentIngredient.name);
				}

  			if (childIngredients.length > 0) {
					containers.push({
						label: `Child Ingredients`,
						count: childIngredients.length,
						ingredients: childIngredients,
						isExpanded: true, // TODO
						isCardEnabled:  currentIngredient ? true : false,
						currentIngredient: currentIngredient ? nextCurrent : null
					});
				}

				if (currentIngredient) {
					nextCurrent = getNextIngredient(parentIngredients, currentIngredient.name);
				}

  			if (parentIngredients.length > 0) {
					containers.push({
						label: `Parent Ingredients`,
						count: parentIngredients.length,
						ingredients: parentIngredients,
						isExpanded: true, // TODO
						isCardEnabled:  currentIngredient ? true : false,
						currentIngredient: currentIngredient ? nextCurrent : null
					});
				}

  			break;
  		default: // name
				// check if this container has our active ingredient
				if (currentIngredient) {
					nextCurrent = getNextIngredient(viewIngredients, currentIngredient.name);
				}

  			// if we have less than 500 ingredients, display them in a single container
  			if (viewIngredients.length <= 500) {
	  			containers.push({
						label: (currentView === 'search') ? `Search Results` : `${currentView.charAt(0).toUpperCase() + currentView.slice(1)} Ingredients`,
						count: viewIngredients.length,
						ingredients: viewIngredients,
						isExpanded: true, // TODO
						isCardEnabled:  currentIngredient ? true : false,
						currentIngredient: currentIngredient ? nextCurrent : null
					});
	  		} else {
	  			// otherwise break up into containers by letter
	  			isPagerEnabled = true;

	  			// create an array of unique letters used
	  			pagerLabels = viewIngredients.map(i => i.name.charAt(0)).filter((char, index, self) => self.indexOf(char) === index && char.match(/[a-z]/i));
	  			const containsSymbols = viewIngredients.map(i => i.name.charAt(0)).filter(char => !char.match(/[a-z]/i)).length > 0;
	  			if (containsSymbols) {
	  				pagerLabels.unshift('@');
	  			}

	  			containers = pagerLabels.map((char, index) => {
	  				let containerIngredients = [];
	  				if (char === '@') {
	  					containerIngredients = viewIngredients.filter(i => !i.name.charAt(0).match(/[a-z]/i));
	  				} else {
	  					containerIngredients = viewIngredients.filter(i => i.name.charAt(0) === char);
						}

	  				return {
							label: char,
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: (index === 0) ? true : false, // TODO
							isCardEnabled: currentIngredient ? true : false,
							currentIngredient: currentIngredient ? nextCurrent : null
						};
	  			});

	  		}
  			break;
  	}

		this.setState({
			currentView: view,
			containers,
			isPagerEnabled,
			pagerLabels,
			status
		});
	}

	renderIngredients(container) {
		const ingredients = clone(this.state.ingredients);
		const { currentView } = this.state;
		let ingredientList = [];
		let className = '';

  	// if we have more than 100 ingredients in this container, we'll group these by letter
  	if (container.ingredients && (container.ingredients.length > 100) && (ingredients.length <= 500)) {
  		const hasSymbols = container.ingredients.map(i => i.name.charAt(0)).filter(char => !char.match(/[a-z]/i)).length > 0;
  		const letters = container.ingredients.map(i => i.name.charAt(0)).filter((char, index, self) => self.indexOf(char) === index && char.match(/[a-z]/i));

  		if (hasSymbols) {
  			// push header symbol
  			ingredientList.push({ key: '@_header', className: 'header', 'name': '@', onClick: e => e.stopPropagation() });
  			
  			// push grouping
  			ingredientList = ingredientList.concat(container.ingredients
													.filter(i => !i.name.charAt(0).match(/[a-z]/i))
													.map(i => {
														className = 'ingredient';
												  	//className += (isActive) ? 'active ' : '';
												  	className += (i.isParentIngredientID) ? ' child' : '';
												  	className += (!i.isValidated && currentView !== 'new') ? ' invalid' : '';

														return {
															key: `${i.ingredientID}_ing`,
															className: className || "",
															name: i.name,
															onClick: e => this.onIngredientClick(e, container, i)
														};
													})
												);
  		}

  		// loop through the used letters and push their ingredient groups
  		ingredientList = ingredientList.concat(...letters
								  			.map(char => {
									  			let grouping = [];
									  			// push header letter
									  			grouping.push({ key: `${char}_header`, className: 'header', 'name': char, onClick: e => e.stopPropagation() });

									  			// push grouping
									  			grouping = grouping.concat(container.ingredients
									  									.filter(i => i.name.charAt(0) === char)
									  									.map(i => {
																				className = 'ingredient';
																		  	//className += (isActive) ? 'active ' : '';
																		  	className += (i.isParentIngredientID) ? ' child' : '';
																		  	className += (!i.isValidated && currentView !== 'new') ? ' invalid' : '';
									  										return {
									  											key: `${i.ingredientID}_ing`,
																					className: className || "",
																					name: i.name,
																					onClick: e => this.onIngredientClick(e, container, i)
									  										}
									  									})
									  								);

									  			return grouping;
									  		})
									  	);
  	} else {
  		// just return everything
  		ingredientList = container.ingredients.map(i => {
  			className = 'ingredient';
		  	//className += (isActive) ? 'active ' : '';
		  	className += (i.isParentIngredientID) ? ' child' : '';
		  	className += (!i.isValidated && currentView !== 'new') ? ' invalid' : '';
  			return {
  				key: `${i.ingredientID}_ing`,
					className: className || "",
					name: i.name,
					onClick: e => this.onIngredientClick(e, container, i)
  			};
  		})
  	}

  	return ingredientList.map(i =>
  		<li key={ i.key } className={ i.className } onClick={ i.onClick }>
  			{ i.name }
  		</li>
  	);
	}

	renderFilters() {
		const { currentGroup, currentView, ingredientsCount, newIngredientsCount } = this.state;

		let newClassList = (currentView === 'new') ? 'active' : '';
  	// if we have unverified ingredients, add an additional class for color
  	newClassList += (newIngredientsCount.length !== 0) ? ' new' : '';

		return (
			<div className="filters">
  			{/* View Selection */}
	  		<div className="left">
					<Link to={ `/ingredients` } className={ (currentView === 'all') ? 'active' : '' } onClick={ () => this.updateView('all') }>
						{ `View${'\xa0'}All${'\xa0'}${ingredientsCount}` }
					</Link>
					<Link to={ `/ingredients/new` } className={ newClassList } onClick={ () => this.updateView('new') }>
						{ `Newly${'\xa0'}Imported${'\xa0'}${newIngredientsCount}` }
					</Link>
	  		</div>

	  		{/* Group Selection */}
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
		const { currentView } = this.state;
		const containers = clone(this.state.containers);
		const ingredients = clone(this.state.ingredients);

		return (
			<div className="view">
				{/* TODO (isPagerEnabled) ? this.renderPager() : null */}
				<ul className="containers">
		  		{
			  		containers.map(c => {
				  		return (
				  			<li className='container' key={ c.label } onClick={ (e) => this.onContainerClick(e, c) }>
				  				{/* Container Header */}
					  			<div className="line">
					  				{ c.label }
					  				<span className="count">{ c.count }</span>
					  			</div>


					  			{/* Expanded Card */}
									{
					    			(c.isCardEnabled)
							    		? <Card
													ingredient={ c.currentIngredient }
													ingredients={ ingredients }
													key={ c.currentIngredient.ingredientID }
													isEditMode={ (currentView === 'new') ? true : false }
													refresh={ this.getIngredientList }
												/>
											: null
									}

					  			{/* Container Ingredients */}
					  			{
					  				(c.isExpanded)
					  					? <ul className={ (c.isCardEnabled) ? 'ingredients expanded' : 'ingredients' } id={ c.label }>
													{ this.renderIngredients(c) }
												</ul>
											: null
					  			}

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