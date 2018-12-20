import { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import gql from 'graphql-tag';
import Link from 'next/link';
import Router from 'next/router'
import styled from 'styled-components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

// TODO there's a pretty bad case of FOUT in next
import faPlus from '@fortawesome/fontawesome-pro-regular/faPlus';

import getNextIngredientGroup from '../lib/util';
import ErrorMessage from '../components/ErrorMessage';
import Header from '../components/Header';
import IngredientsContainer from '../components/ingredients/IngredientsContainer';
import CreateIngredient from '../components/ingredients/CreateIngredient';

// TODO - not sure where this check goes, but need to look for any query params on load to assign the correct view
// not sure if this is supposed to go into getInitialProps or if i can still use an old school react lifecycle method

/*----------  Queries & Mutations  ----------*/

const LOCAL_INGREDIENTS_QUERY = gql`
  query {
  	currentView @client 
  	currentGroup @client 
  	isCreateEnabled @client
  }
`;

const INGREDIENT_COUNTS_QUERY = gql`
  query INGREDIENT_COUNTS_QUERY {
  	counts {
	  	ingredients
			newIngredients
		}
  }
`;

// TODO may need to add in plural, altNames, and property values here
const ALL_INGREDIENTS_QUERY = gql`
  query ALL_INGREDIENTS_QUERY {
  	ingredients {
  		id
  		name
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

const LOCAL_INGREDIENTS_MUTATION = gql`
  mutation updateConfig($view: String, $group: String, $isCreateEnabled: Boolean) {
    updateConfig(view: $view, group: $group, isCreateEnabled: $isCreateEnabled) @client
  }
`;

const UPDATE_CONTAINER_MUTATION = gql`
  mutation updateContainer($container: Container, $ingredientID: ID) {
    updateContainer(container: $container, ingredientID: $ingredientID) @client
  }
`;

const Composed = adopt({
  localState: ({ render }) => <Query query={ LOCAL_INGREDIENTS_QUERY }>{ render }</Query>,
  // use either the view/group from the url if we have it, or the defaults in cache
  populateContainers: ({ queryView, queryGroup, localState, render }) => <Query query={ POPULATE_CONTAINERS_QUERY } variables={ { view: queryView || localState.data.currentView, group: queryGroup || localState.data.currentGroup} }>{ render }</Query>,
  ingredientCounts: ({ render }) => <Query query={ INGREDIENT_COUNTS_QUERY }>{ render }</Query>,
  updateLocal: ({ render }) => <Mutation mutation={ LOCAL_INGREDIENTS_MUTATION }>{ render }</Mutation>,
  updateContainer: ({ render }) => <Mutation mutation={ UPDATE_CONTAINER_MUTATION }>{ render }</Mutation>,
  getIngredients: ({ render }) => <Query query={ ALL_INGREDIENTS_QUERY }>{ render }</Query>
});

/*----------  Local Styles  ----------*/

const IngredientsPageStyles = styled.article`
	// TODO
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
	//border-top: 1px solid #ddd;
	background: ${ props => props.theme.greenBackground };
	padding: 16px;
	padding-left: 40px;
	position: fixed;
	bottom: 0;
	left: 0px;
	right: 0px;

	span {
		cursor: pointer;
		text-decoration: none;
		color: ${ props => props.theme.altGreen };
		font-size: 16px;
		font-weight: 600;
		
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
	state = {};

	toggleContainer = (e, container, updateContainersMutation) => {
		e.preventDefault();
		container.isExpanded = !container.isExpanded;
		updateContainersMutation({ variables: { container: container } });
	}

	toggleIngredient = (e, container, updateContainersMutation) => {
		// TODO if we're closing out of an opened card; we need to adjust the link query
		const ingredientID = e.target.id;
		container.isCardEnabled = !container.isCardEnabled;
		updateContainersMutation({ variables: { container, ingredientID } });
	}

	refreshContainers = (e, populateContainers, ingredientCounts) => {
		populateContainers.refetch();
		ingredientCounts.refetch();
	}

	render() {
		return (
			<Composed queryView={ this.props.query.view } queryGroup={ this.props.query.group }>
    		{
    			({ localState, populateContainers, ingredientCounts, updateLocal, updateContainer, getIngredients }) => {
    				let { currentGroup, currentView, isCreateEnabled } = localState.data;
    				const { containers } = populateContainers.data || {};
    				const { loading, error } = populateContainers.data || {};
    				const { counts } = ingredientCounts.data || {};
    				const { ingredients } = getIngredients.data || {};

    				// use the query params in the url if we have them
    				currentGroup = this.props.query.group || currentGroup;
    				currentView = this.props.query.view  || currentView;

    				// TODO expand loading and error messages for all queries/mutations

    				currentGroup = currentGroup || 'name';
    				currentView = currentView || 'all';

						if (loading) return <p>Loading...</p>;
						if (error) return <ErrorMessage error={ error } />;

    				return (
							<IngredientsPageStyles>
								<Header pageHeader="Ingredients" />
								<section>
									<Filters>
										{/* View Selection */}
							  		<div className="left">
							  			<Link href={{ pathname: '/ingredients', query: { view: 'all', group: currentGroup } }}>
												<a className={ (currentView === 'all') ? 'active' : '' } onClick={ e => updateLocal({ variables: { view: 'all' } }) }>
													{ `View${'\xa0'}All${'\xa0'}${ (counts) ? counts.ingredients : 0 }` }
												</a>
											</Link> 

											<Link href={{ pathname: '/ingredients', query: { view: 'new', group: currentGroup  } }}>
												<a className={ (currentView === 'new') ? 'active' : '' } onClick={ e => updateLocal({ variables: { view: 'new' } }) }>
													{ `Newly${'\xa0'}Imported${'\xa0'}${ (counts) ? counts.newIngredients : 0 }` }
												</a>
											</Link>            
							  		</div>

							  		{/* Group By Selection */}
							  		<div className="right">
											<div className="groupBy">
												Group By
												<Link href={{ pathname: '/ingredients', query: { view: currentView, group: getNextIngredientGroup(currentGroup) } }}>
													<a onClick={ e => updateLocal({ variables: { view: currentView, group: getNextIngredientGroup(currentGroup) } }) }>{ currentGroup.charAt(0).toUpperCase() + currentGroup.substr(1) }</a>
												</Link> 
											</div>
										</div>
									</Filters>

									<Containers>
										{
											containers && containers.map(c =>
													<IngredientsContainer 
														key={ c.label } 
														className={ (!c.isExpanded) ? 'hidden' : '' }
														container={ c }
														onContainerClick={ e => this.toggleContainer(e, c, updateContainer) }
														onIngredientClick={ e => this.toggleIngredient(e, c, updateContainer) }
													/>
												)
										}
									</Containers>
									
									<AddNewIngredient>
										<span onClick={ e => updateLocal({ variables: { isCreateEnabled: !isCreateEnabled } }) }>
											<FontAwesomeIcon icon={ faPlus } /> Add Ingredient
										</span>
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
export { ALL_INGREDIENTS_QUERY, LOCAL_INGREDIENTS_QUERY, LOCAL_INGREDIENTS_MUTATION, POPULATE_CONTAINERS_QUERY };
