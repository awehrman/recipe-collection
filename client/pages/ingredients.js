import { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import gql from 'graphql-tag';
import Link from 'next/link';
import styled from 'styled-components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// TODO there's a pretty bad case of FOUT in next
import faPlus from '@fortawesome/fontawesome-pro-regular/faPlus';

import getNextIngredientGroup from '../lib/util';
import Button from '../components/form/Button';
import CreateIngredient from '../components/ingredients/CreateIngredient';
import ErrorMessage from '../components/ErrorMessage';
import Header from '../components/Header';
import IngredientsContainer from '../components/ingredients/IngredientsContainer';

/*----------  Queries & Mutations  ----------*/

const GET_CONTAINERS_QUERY = gql`
	query GET_CONTAINERS_QUERY($group: String!, $id: ID, $view: String!) {
		containers(group: $group, id: $id, view: $view) {
			id
			label
			ingredients {
				id
				name
				plural
				alternateNames {
					name
				}
				properties {
					meat
				  poultry
				  fish
				  dairy
				  soy
				  gluten
				}
				parent {
					id
				}
				isValidated
			}
			message
			settings {
				currentIngredientID
				id
				isCardEnabled
				isExpanded
			}
		}
	}
`;

const GET_INGREDIENTS_QUERY = gql`
  query GET_INGREDIENTS_QUERY {
  	ingredients {
  		id
  		name
  		plural
  		alternateNames {
  			name
  		}
  	}
  }
`;

const GET_INGREDIENTS_COUNT_QUERY = gql`
  query GET_INGREDIENTS_COUNT_QUERY {
  	counts {
	  	ingredients
			newIngredients
		}
  }
`;

const UPDATE_LOCAL_CACHE_MUTATION = gql`
  mutation updateLocalCache($containerID: ID, $ingredientID: ID, $settings: IngredientViewState) {
    updateLocalCache(containerID: $containerID, ingredientID: $ingredientID, settings: $settings) @client
  }
`;

const Composed = adopt({
  getContainers: ({ group, id, render, view }) => <Query query={ GET_CONTAINERS_QUERY } variables={ { group, id, view } }>{ render }</Query>,
  getIngredients: ({ render }) => <Query query={ GET_INGREDIENTS_QUERY }>{ render }</Query>,
  getIngredientsCount: ({ render }) => <Query query={ GET_INGREDIENTS_COUNT_QUERY }>{ render }</Query>,
  updateLocalCache: ({ render }) => <Mutation mutation={ UPDATE_LOCAL_CACHE_MUTATION }>{ render }</Mutation>,
});

/*----------  Local Styles  ----------*/

const IngredientsPageStyles = styled.article`
	// TODO oh boy oh boy this got messed up
	/*
	.slide-enter {
    height: 0px;
	}

	.slide-enter.slide-enter-active {
    height: 1000px;
    -webkit-transition: height .5s ease;
	}
	*/
`;

const Containers = styled.div`
	margin: 20px 0;
`;

const Filters = styled.div`
	display: flex;
	font-size: .875em;
	color: #222;

	.left {
		flex: 1;

		a {
			text-decoration: none;
			margin-right: 20px;
			color: #222;

			+.new {
				color: ${ props => props.theme.highlight };
			}
		}

		a.active {
			font-weight: 600;
		}
	}

	.right {
			flex: 1;
			text-align: right;
			font-weight: 600;

			a {
				text-decoration: none;
				margin-left: 16px;
				text-transform: capitalize; /* TODO well this sure isn't working */
				color: ${ props => props.theme.lighterGrey };
				font-size: 1em;
				padding: 0;
				cursor: pointer;
				background: white;
				outline: 0;
			}
		}
`;

const AddNewIngredient = styled.div`
	background: ${ props => props.theme.greenBackground };
	padding: 16px 40px 6px;
	position: fixed;
	bottom: 0;
	left: 0px;
	right: 0px;
	//box-shadow: 0 0 10px 0 rgba(50, 50, 50, .15) inset;
  max-height: 60%;
  overflow-y: scroll;
	z-index: 1000;

	button {
		cursor: pointer;
		border: 0;
		background: transparent;
		color: ${ props => props.theme.altGreen };
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 10px;
		padding: 0;

		.fa-plus {
			height: 18px;
			margin-right: 10px;
		}
	}

	@media (min-width: ${ props => props.theme.tablet }) {
		left: 40px;
	}
`;

/*----------  Ingredients Component  ----------*/

class Ingredients extends Component {
	state = {
		group: 'name',
		view: 'all',

		isCreateEnabled: false, // TODO move this into local cache in settings
	};

	componentDidMount = () => {
		const { id, group, view } = this.state;
		const { query } = this.props;

		// update the view and group settings based on any provided query params
		if (query.hasOwnProperty('group') || query.hasOwnProperty('view')) {
			this.setState({
				group: (query.group || group),
				view: (query.view || view)
			});
		}
	}

	// show/hide individual components
	toggleContainer = (e, container, updateLocalCache) => {
		e.preventDefault();

		updateLocalCache({
			variables: {
				contanerID: container.id,
				settings: {
					isExpanded: !container.isExpanded
				}
			}
		});
	}

	// switch to ingredient or collapse if clicked on the active ingredient
	toggleIngredient = (e, container, updateLocalCache) => {
		e.persist(); // stop warnings about synthetic events
		const ingredientID = e.target.id;
		const { id, settings } = container;
		let { currentIngredientID, isCardEnabled } = settings;
		currentIngredientID = (isCardEnabled && (currentIngredientID === ingredientID)) ? null : ingredientID;
  	
		updateLocalCache({
			variables: {
				containerID: id,
				ingredientID,
				settings: {
					currentIngredientID,
					// if we've clicked on a previous current ingredient that was just open, then close the card
			    isCardEnabled: (currentIngredientID === null) ? false : true
				}
			}
		});

		//  if this is another ingredient, scroll to it in the list
		if (currentIngredientID) {
			this.scrollToListItem(e, ingredientID, container.ingredients);
		}
	}

	// scrolls the ingredient list to the ingredient clicked on
	scrollToListItem(e, id, ingredients) {
		// ensure that our ingredients list is sorted properly
		ingredients.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  	const hasSymbols = (ingredients.map(i => i.name.charAt(0))
  																 .filter(char => !char.match(/[a-z]/i))
  																 .length > 0);

  	let alphaInstances = ingredients.map(i => i.name.charAt(0))			// get the first character of each name
				  													.filter((char, index, self) => (
																 			char.match(/[a-z]/i									// only return alphanumeric instances
																 			&& (self.indexOf(char) === index))	// that are unique
																	 	));

  	// if we do have symbols, add them as their own group under the '@' header
  	if (hasSymbols) alphaInstances.unshift('@');

  	if (id && ingredients) {
  		const HEADER_HEIGHT = 44,		// TODO this shold be dynamically determined instead of ham-fisted in
	  				ingIndex = ingredients.findIndex(i => i.id === id),
	  				ingredient = ingredients.find(i => i.id === id),
						letterIndex = alphaInstances.findIndex(l => l === ingredient.name.charAt(0)) + 1;

			// determine offset
  		let offset = (ingredients && (ingredients.length > 100) && (ingredients.length <= 500))
  			? (HEADER_HEIGHT * letterIndex)		// if we have subheader's in our container
  			: 0;															// if we just have a list of ingredients
  		offset -= 12;
  		const yPosition = (ingIndex * e.target.clientHeight) + offset;

			// and scroll to that position times the height of the list item itself
			e.target.parentNode.parentNode.scrollTo(0, yPosition);
		}
  }

  // TODO sure seems like something that could be updated with hooks
  // updates group and view states
	updateView = (e, name, value) => {
		this.setState({
			[name]: value
		});
	}

	refreshView = () => {
		console.warn('refreshView');
		// TODO
		// for a refetch for getContainers, getIngredients, getIngredientsCount
		// this can happen automatically if we trigger a render here
		this.forceUpdate();
	}

	render() {
		const { isCreateEnabled, group, view } = this.state;
		const { query } = this.props;
		// if we've passed an id as a query parameter, pass this to getContainers
		const currentIngredientID = (query && query.id) ? query.id : null;

		const defaultContainer = {
			id: 0,
			ingredients: [],
			label: "All Ingredients",
			message: "Loading...",
			settings: {
				currentIngredientID: null,
				isCardEnabeld: false,
				isExpanded: true,
				typename: "__IngredientViewState"
			}
    };

		const defaultCounts = {
			ingredients: 0,
			newIngredients: 0
		}	;							  

		console.warn('ingredients render');

		return (
			<Composed group={ group } id={ currentIngredientID } view={ view }>
    		{
    			({ getContainers, getIngredients, getIngredientsCount, updateLocalCache }) => {
    				// TODO think about this more
    				const { loading, error } = getContainers.data || {};
						if (loading) return <p>Loading...</p>;
						if (error) return <ErrorMessage error={ error } />;

    				const { containers } = getContainers.data || defaultContainer;
    				const { counts } = getIngredientsCount.data || defaultCounts;
    				let { ingredients } = getIngredients.data || [];

    				return (
							<IngredientsPageStyles>
								<Header pageHeader="Ingredients" />
								<section>
									{/* View and Group By Filters */}
									<Filters>
										{/* View Selection */}
							  		<div className="left">
							  			<Link href={{ pathname: '/ingredients', query: { view: 'all', group } }}>
												<a className={ (view === 'all') ? 'active' : '' } onClick={ e => this.updateView(e, 'view', 'all') }>
													{ `View${'\xa0'}All${'\xa0'}${ (counts) ? counts.ingredients : 0 }` }
												</a>
											</Link> 

											<Link href={{ pathname: '/ingredients', query: { view: 'new', group  } }}>
												<a className={ (view === 'new') ? 'active' : '' } onClick={ e => this.updateView(e, 'view', 'new') }>
													{ `Newly${'\xa0'}Imported${'\xa0'}${ (counts) ? counts.newIngredients : 0 }` }
												</a>
											</Link>            
							  		</div>

							  		{/* Group By Selection */}
							  		<div className="right">
											<div className="groupBy">
												Group By
												<Link href={{ pathname: '/ingredients', query: { view, group: getNextIngredientGroup(group) } }}>
													<a onClick={ e => this.updateView(e, 'group', getNextIngredientGroup(group)) }>{ group.charAt(0).toUpperCase() + group.substr(1) }</a>
												</Link> 
											</div>
										</div>
									</Filters>

									{/* Ingredient Containers */}
									{/* TODO consider renaming Containers to Groups */}
									<Containers>
										{
											containers && containers.map(c =>
													<IngredientsContainer 
														className={ (!c.settings.isExpanded) ? 'hidden' : '' }
														container={ c }
														ingredients={ ingredients }
														key={ c.label } 
														onContainerClick={ e => this.toggleContainer(e, c, updateLocalCache) }
														onIngredientClick={ e => this.toggleIngredient(e, c, updateLocalCache) }
														getIngredientsCount={ getIngredientsCount }
														getContainers={ getContainers }
														refreshView={ this.refreshView }
														updateLocalCache={ updateLocalCache }
														view={ view }
													/>
												)
										}
									</Containers>
									
									{/* Add New Ingredient */}
									<AddNewIngredient>
										{/* TODO this whole slide transition needs to be revisited */}
										<ReactCSSTransitionGroup transitionName="slide" transitionEnterTimeout={ 500 } transitionLeaveTimeout={ 300 }>
											<Button
												icon={ <FontAwesomeIcon icon={ faPlus } /> }
												label="Add Ingredient"
												onClick={ e => this.updateView(e, 'isCreateEnabled', !isCreateEnabled) }
											/>

											{/* TODO this should be factored to better incorporate the shared functionality of card */}
											{
												(isCreateEnabled)
													? <CreateIngredient
															getIngredientsCount={ getIngredientsCount }
															ingredients={ ingredients }
															getContainers={ getContainers }
														/>
													: null
											}
										</ReactCSSTransitionGroup>
									</AddNewIngredient>
								</section>
							</IngredientsPageStyles>
    				);
					}
				}
			</Composed>
		);		
	};
}

export default Ingredients;
export { GET_INGREDIENTS_QUERY, GET_INGREDIENTS_COUNT_QUERY, GET_CONTAINERS_QUERY, UPDATE_LOCAL_CACHE_MUTATION };
