import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { NotificationManager } from 'react-notifications';

import { clone } from '../../../lib/util';
import Card from './Card';
import Search from './../../layout/Search';

import './Index.css';

class Index extends Component {
	constructor(props) {
		super(props);

		this.containerIngredientRefs = {};

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
		this.onIngredientClick = this.onIngredientClick.bind(this);
		this.findListItemTarget = this.findListItemTarget.bind(this);
		this.updateView = this.updateView.bind(this);
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

  findListItemTarget(e, container, ingredient) {
  	e.preventDefault();
  	e.stopPropagation();
		let { currentView } = this.state;
		let target = e.target;

  	// if we didn't click on an ingredient from the container list, then update our target to the item in the container's list
  	if (!target || !target.classList.contains('offset')) {
  		target = this.containerIngredientRefs[container.label + ingredient.ingredientID + "_ing"];
  		target = (target) ? target.childNodes[0] : null;

  	
  		if (!target) {
  			currentView = 'all';
  		}
  	}

  	target = (!target) ? e.target : target;

  	const cb = (target, e, container, ingredient) => {
			this.renderIngredients(container);

			if (!target || (target.classList && !target.classList.contains('offset'))) {
				target = this.containerIngredientRefs[container.label + ingredient.ingredientID + "_ing"];
				target = (target) ? target.childNodes[0] : null;
			}

			// update the URL
			this.props.history.push(`/ingredients/all`);

			if (target) {
				this.onIngredientClick(e, container, ingredient, target);
			}
		};

  	this.updateView(currentView, ingredient, [], "", cb(target, e, container, ingredient));
  }

  onIngredientClick(e, container, ingredient, target = null) {
  	e.preventDefault();
  	e.stopPropagation(); // prevent event from bubbling up to onContainerClick()

  	target = (!target) ? e.target : target;
  	let containers = clone(this.state.containers);

  	// if no cards were expanded, then open the clicked on item
  	if (container.currentIngredient === null && !container.isCardEnabled) {
  		container.currentIngredient = clone(ingredient);
  		container.isCardEnabled = true;
  	}
  	// if we clicked on the same item that's currently expanded, close the card
  	else if (container.currentIngredient !== null && (container.currentIngredient && ingredient && (container.currentIngredient.ingredientID === ingredient.ingredientID))) {
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
  	}, () => {
  		this.scrollToListItem(container, ingredient, target);
  	});
  }

  scrollToListItem(container, ingredient, target) {
  	const ingredients = clone(this.state.ingredients);
  	const hasSymbols = container.ingredients.map(i => i.name.charAt(0)).filter(char => !char.match(/[a-z]/i)).length > 0;
  	let letters = container.ingredients.map(i => i.name.charAt(0)).filter((char, index, self) => self.indexOf(char) === index && char.match(/[a-z]/i));
  	if (hasSymbols) {
  		letters.unshift('@');
  	}
  	const HEADER_HEIGHT = 44;

  	if (container && ingredient && target) {
	  	// find the position of the ingredient in the list
			const index = container.ingredients.findIndex(i => i.ingredientID === ingredient.ingredientID);
			const letterIndex = letters.findIndex(l => l === ingredient.name.charAt(0)) + 1;

			// determine offset
  		let offset = (container.ingredients && (container.ingredients.length > 100) && (ingredients.length <= 500))
  			? (HEADER_HEIGHT * letterIndex)		// if we have subheader's in our container
  			: 0;	// if we just have a list of ingredients
  		offset -= 24;
  		const yPosition = (index * target.clientHeight) + offset;

			// and scroll to that position times the height of the list item itself
			target.parentNode.scrollTo(0, yPosition);
			target.parentNode.parentNode.scrollIntoView();
		}
  }

	getIngredientList(currentIngredientID = null) {
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

	updateView(view = null, currentIngredient = null, searchResults = [], searchValue = "", cb) {
		let { currentGroup, currentView, isPagerEnabled, status } = this.state;
		let viewIngredients = clone(this.state.ingredients);
		let pagerLabels = [ ...this.state.pagerLabels ];
		let containers = [];
		let nextCurrent;
		let currentContainers = clone(this.state.containers);
		let currentContainer;
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
				viewIngredients = (searchResults) ? searchResults : [];
				if (viewIngredients && viewIngredients.length === 0) {
					status = `No ingredients found for ${searchValue}`;
				} else {
					status = '';
				}

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

  				currentContainer = currentContainers.find(c => c.label.toLowerCase() === label);

  				// check if this currentContainer has our active ingredient
  				if (currentIngredient && currentContainer) {
  					nextCurrent = getNextIngredient(containerIngredients, currentIngredient.name);
  					//console.warn(nextCurrent);
  				}

					if (containerIngredients.length > 0) {
						return {
							label: label.charAt(0).toUpperCase() + label.slice(1),
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: true, // TODO
							isCardEnabled:  (nextCurrent) ? true : false,
							currentIngredient: (currentIngredient && nextCurrent) ? nextCurrent : null
						};
					} return null;
				}).filter(c => c);
  			break;
  		case 'count':
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

  					currentContainer = currentContainers.find(c => c.label === "0 References");

	  				// check if this currentContainer has our active ingredient
	  				if (currentIngredient && currentContainer) {
	  					nextCurrent = getNextIngredient(containerIngredients, currentIngredient.name);
	  					//console.warn(nextCurrent);
	  				}

  					return {
							label: "0 References",
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: false,
							isCardEnabled:  (nextCurrent) ? true : false,
							currentIngredient: (currentIngredient && nextCurrent) ? nextCurrent : null
						};
  				}

  				// put any ingredients with a singular references in their own group
  				if ((index === 0 && !containsNoReferences) || (index === 1 && containsNoReferences)) {
  					containerIngredients = viewIngredients.filter(i => i.referenceCount === 1);

  					currentContainer = currentContainers.find(c => c.label.toLowerCase() === "1 Reference");

	  				// check if this currentContainer has our active ingredient
	  				if (currentIngredient && currentContainer) {
	  					nextCurrent = getNextIngredient(containerIngredients, currentIngredient.name);
	  					//console.warn(nextCurrent);
	  				}

  					return {
							label: "1 Reference",
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: false,
							isCardEnabled:  (nextCurrent) ? true : false,
							currentIngredient: (currentIngredient && nextCurrent) ? nextCurrent : null
						};
  				}

					// adjust the index based on whether we have any exception groups  				
  				const adjustedIndex = (index - containsNoReferences - containsSingleReference);
  				
  				if (adjustedIndex > 0) {
	  				rangeStart = (adjustedIndex * 10) + 1;
	  				rangeEnd = (adjustedIndex * 10) + 10;
	  			}

	  			containerIngredients = viewIngredients.filter(i => i.referenceCount >= rangeStart && i.referenceCount <= rangeEnd);

	  			currentContainer = currentContainers.find(c => c.label.toLowerCase() === `${rangeStart}-${rangeEnd} References`);

  				// check if this currentContainer has our active ingredient
  				if (currentIngredient && currentContainer) {
  					nextCurrent = getNextIngredient(containerIngredients, currentIngredient.name);
  					//console.warn(nextCurrent);
  				}

  				return {
						label: `${rangeStart}-${rangeEnd} References`,
						count: containerIngredients.length,
						ingredients: containerIngredients,
						isExpanded: false,
						isCardEnabled:  (nextCurrent) ? true : false,
						currentIngredient: (currentIngredient && nextCurrent) ? nextCurrent : null
					};
  			}).filter(c => c.ingredients.length > 0);

  			break;
  		case 'relationship':
  			const parentIngredients = viewIngredients.filter(i => !i.parentIngredientID);
  			const childIngredients = viewIngredients.filter(i => i.parentIngredientID);


				currentContainer = currentContainers.find(c => c.label.toLowerCase() === `Child Ingredients`);

				// check if this container has our active ingredient
				if (currentIngredient && currentContainer) {
					nextCurrent = getNextIngredient(childIngredients, currentIngredient.name);
					//console.warn(nextCurrent);
				}

  			if (childIngredients.length > 0) {
					containers.push({
						label: `Child Ingredients`,
						count: childIngredients.length,
						ingredients: childIngredients,
						isExpanded: true,
						isCardEnabled:  (nextCurrent) ? true : false,
						currentIngredient: (currentIngredient && nextCurrent) ? nextCurrent : null
					});
				}

				currentContainer = currentContainers.find(c => c.label.toLowerCase() === `Parent Ingredients`);

				// check if this container has our active ingredient
				if (currentIngredient && currentContainer) {
					nextCurrent = getNextIngredient(parentIngredients, currentIngredient.name);
					//console.warn(nextCurrent);
				}

  			if (parentIngredients.length > 0) {
					containers.push({
						label: `Parent Ingredients`,
						count: parentIngredients.length,
						ingredients: parentIngredients,
						isExpanded: true,
						isCardEnabled:  (nextCurrent) ? true : false,
						currentIngredient: currentIngredient ? nextCurrent : null
					});
				}

  			break;
  		default: // name
  			// if we have less than 500 ingredients, display them in a single container
  			if (viewIngredients.length <= 500) {
  				currentContainer = currentContainers.find(c => c.label.toLowerCase() === (currentView === 'search') ? `Search Results` : `${currentView.charAt(0).toUpperCase() + currentView.slice(1)} Ingredients`);
					
					// check if this currentContainer has our active ingredient
					if (currentIngredient && currentContainer) {
						nextCurrent = getNextIngredient(viewIngredients, currentIngredient.name);
						//console.warn(nextCurrent);
					}

	  			containers.push({
						label: (currentView === 'search') ? `Search Results` : `${currentView.charAt(0).toUpperCase() + currentView.slice(1)} Ingredients`,
						count: viewIngredients.length,
						ingredients: viewIngredients,
						isExpanded: true, // TODO
						isCardEnabled:  (nextCurrent) ? true : false,
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

						currentContainer = currentContainers.find(c => c.label.toLowerCase() === char);
						
						// check if this currentContainer has our active ingredient
						if (currentIngredient && currentContainer) {

							nextCurrent = getNextIngredient(containerIngredients, currentIngredient.name);
							if (char === 'b') {
								console.log(currentIngredient);
								console.log(currentContainer);
								console.warn(nextCurrent);
							}
						}

	  				return {
							label: char,
							count: containerIngredients.length,
							ingredients: containerIngredients,
							isExpanded: true,
							isCardEnabled: (nextCurrent) ? true : false,
							currentIngredient: (currentIngredient && nextCurrent) ? nextCurrent : null
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
		}, cb);
	}

	// TODO adjust height calculations based on wrapping ing names
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
												  	className += (container.currentIngredient && (container.currentIngredient.ingredientID === i.ingredientID)) ? ' active ' : '';
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
																		  	className += (container.currentIngredient && (container.currentIngredient.ingredientID === i.ingredientID)) ? ' active ' : '';
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
		  	className += (container.currentIngredient && (container.currentIngredient.ingredientID === i.ingredientID)) ? ' active ' : '';
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
  		<li key={ i.key } className={ i.className } onClick={ i.onClick } ref={ el => this.containerIngredientRefs[container.label + i.key] = el }>
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
							    				container={ c }
													ingredient={ c.currentIngredient }
													ingredients={ ingredients }
													key={ (c.currentIngredient && c.currentIngredient.ingredientID) ? c.currentIngredient.ingredientID : Math.random() }
													isEditMode={ (currentView === 'new') ? true : false }
													onIngredientClick={ this.findListItemTarget }
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
		const { currentGroup, currentView, status } = this.state;
		const ingredients = clone(this.state.ingredients); // TODO do i need this?

		return (
			<article id="ingredients">
				<header>
					<Search
						data={ ingredients }
						group={ currentGroup } // used onChange
						pageHeader="Ingredients"
						route="ingredients"
						updateView={ this.updateView }
						view={ currentView }
					/>
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