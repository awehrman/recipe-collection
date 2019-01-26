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

const INGREDIENT_COUNTS_QUERY = gql`
  query INGREDIENT_COUNTS_QUERY {
  	counts {
	  	ingredients
			newIngredients
		}
  }
`;

// TODO may need to add in property values here
const ALL_INGREDIENTS_QUERY = gql`
  query ALL_INGREDIENTS_QUERY {
  	ingredients {
  		id
  		name
  		plural
  		alternateNames
  	}
  }
`;

const POPULATE_CONTAINERS_QUERY = gql`
	query POPULATE_CONTAINERS_QUERY($view: String!, $group: String!) {
		containers(view: $view, group: $group) {
			id
			label
			ingredients {
				id
				name
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
			isExpanded @client
			isCardEnabled @client
			currentIngredientID @client
		}
	}
`;

const UPDATE_CONTAINER_MUTATION = gql`
  mutation updateContainer($container: Container, $group: String, $ingredientID: ID, $removeCurrentFromList: Boolean, $view: String) {
    updateContainer(container: $container, group: $group, ingredientID: $ingredientID, removeCurrentFromList: $removeCurrentFromList, view: $view) @client
  }
`;

const Composed = adopt({
  populateContainers: ({ view, group, render }) => <Query query={ POPULATE_CONTAINERS_QUERY } variables={ { view, group } }>{ render }</Query>,
  ingredientCounts: ({ render }) => <Query query={ INGREDIENT_COUNTS_QUERY }>{ render }</Query>,
  updateContainer: ({ render }) => <Mutation mutation={ UPDATE_CONTAINER_MUTATION }>{ render }</Mutation>,
  getIngredients: ({ render }) => <Query query={ ALL_INGREDIENTS_QUERY }>{ render }</Query>
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
		isCreateEnabled: false,
		view: 'all'
	};

	componentDidMount = () => {
		const { group, view } = this.state;

		// update the view and group settings based on any provided query params
		if (this.props.query.group || this.props.query.view) {
			this.setState({
				group: (this.props.query.group) ? this.props.query.group : group,
				view: (this.props.query.view) ? this.props.query.view : view
			});
		}
	}

	toggleContainer = (e, container, updateContainer) => {
		e.preventDefault();
		const { group, view } = this.state;

		container.isExpanded = !container.isExpanded;

		updateContainer({
			variables: {
				container,
				group,
				ingredientID: container.currentIngredientID,
				removeCurrentFromList: false,
				view
			}
		});
	}

	toggleIngredient = (e, container, updateContainer) => {
		e.preventDefault();
		e.persist(); // stop console warnings about synthetic events
		const { group, view } = this.state;
		const ingredientID = e.target.id;
		// TODO if we're closing out of an opened card; we need to adjust the link query

		// if we've clicked on the same item that's already open, close the card
  	if (container.isCardEnabled && (container.currentIngredientID === ingredientID)) {
  		container.currentIngredientID = null;
  		container.isCardEnabled = false;
  	} else {
  		// otherwise open that card that was clicked on
  		container.currentIngredientID = ingredientID;
  		container.isCardEnabled = true;
  	}

		updateContainer({
			variables: {
				container,
				group,
				ingredientID,
				removeCurrentFromList: false,
				view
			}
		}).then(res => this.scrollToListItem(e, res.data.updateContainer.currentIngredientID, res.data.updateContainer.ingredients));
	}

	scrollToListItem(e, id, ingredients) {
  	const hasSymbols = ingredients.map(i => i.name.charAt(0)).filter(char => !char.match(/[a-z]/i)).length > 0;
  	let letters = ingredients.map(i => i.name.charAt(0)).filter((char, index, self) => self.indexOf(char) === index && char.match(/[a-z]/i));
  	
  	if (hasSymbols) {
  		letters.unshift('@');
  	}
  	const HEADER_HEIGHT = 44;
		
  	if (id && ingredients) {
	  	// find the position of the ingredient in the list
			const index = ingredients.findIndex(i => i.id === id);
			//const letterIndex = letters.findIndex(l => l === ingredient.name.charAt(0)) + 1;
			const letterIndex = 1; // TODO

			// determine offset
  		let offset = (ingredients && (ingredients.length > 100) && (ingredients.length <= 500))
  			? (HEADER_HEIGHT * letterIndex)		// if we have subheader's in our container
  			: 0;	// if we just have a list of ingredients
  		offset -= 24;
  		const yPosition = (index * e.target.clientHeight) + offset;

			// and scroll to that position times the height of the list item itself
			e.target.parentNode.scrollTo(0, yPosition);
			e.target.parentNode.scrollIntoView();
		}
  }

	refreshContainers = (e, localState, populateContainers, ingredientCounts, container = null, updateContainer = null, nextIngredient = null) => {
		const { group, view } = this.state;

		if (container && updateContainer && nextIngredient) {
			updateContainer({
				variables: {
					container,
					group,
					ingredientID: nextIngredient.id,
					removeCurrentFromList: true,
					view
				}
			});
		} else {
			populateContainers.refetch();
		}

		ingredientCounts.refetch();
	}

	updateView = (e, name, value) => {
		this.setState({
			[name]: value
		});
	}

	render() {
		const { group, view, isCreateEnabled } = this.state;

		return (
			<Composed view={ view } group={ group }>
    		{
    			({ populateContainers, ingredientCounts, updateContainer, getIngredients }) => {
    				const { containers } = populateContainers.data || {};
    				const { loading, error } = populateContainers.data || {};
    				const { counts } = ingredientCounts.data || {};
    				const { ingredients } = getIngredients.data || {};

						if (loading) return <p>Loading...</p>;
						if (error) return <ErrorMessage error={ error } />;

    				return (
							<IngredientsPageStyles>
								<Header pageHeader="Ingredients" />
								<section>
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

									<Containers>
										{
											containers && containers/*.filter(c => c.ingredients.length > 0)*/.map(c =>
													<IngredientsContainer 
														className={ (!c.isExpanded) ? 'hidden' : '' }
														container={ c }
														ingredients={ ingredients }
														key={ c.label } 
														onContainerClick={ e => this.toggleContainer(e, c, updateContainer) }
														onIngredientClick={ e => this.toggleIngredient(e, c, updateContainer) }
														ingredientCounts={ ingredientCounts }
														populateContainers={ populateContainers }
														refreshContainers={ this.refreshContainers }
														updateContainer={ updateContainer }
														view={ view }
													/>
												)
										}
									</Containers>
									
									<AddNewIngredient>
										<ReactCSSTransitionGroup transitionName="slide" transitionEnterTimeout={ 500 } transitionLeaveTimeout={ 300 }>
											<Button
												icon={ <FontAwesomeIcon icon={ faPlus } /> }
												label="Add Ingredient"
												onClick={ e => this.updateView(e, 'isCreateEnabled', !isCreateEnabled) }
											/>

											{
												(isCreateEnabled)
													? <CreateIngredient
															ingredientCounts={ ingredientCounts }
															ingredients={ ingredients }
															populateContainers={ populateContainers }
															refreshContainers={ this.refreshContainers }
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
export { ALL_INGREDIENTS_QUERY, POPULATE_CONTAINERS_QUERY };
