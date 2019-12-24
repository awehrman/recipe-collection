import { adopt } from 'react-adopt';
import React from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import AddNew from '../components/ingredients/AddNew';
import Containers from '../components/ingredients/Containers';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import Header from '../components/Header';
import Filters from '../components/ingredients/Filters';
/* eslint-disable object-curly-newline */
import {
	GET_ALL_CONTAINERS_QUERY,
	GET_ALL_INGREDIENTS_QUERY,
	GET_INGREDIENTS_COUNT_QUERY,
} from '../lib/apollo/queries';
/* eslint-enable object-curly-newline */
import { CREATE_CONTAINERS_MUTATION } from '../lib/apollo/mutations';

// TODO look into SSR config to see if i can serve the page with the aggregate baked in
const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getIngredients: ({ onCompleted, render }) => (
		<Query
			fetchPolicy="cache-and-network"
			onCompleted={ onCompleted }
			query={ GET_ALL_INGREDIENTS_QUERY }
			ssr={ false }
		>
			{ render }
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getIngredientsCount: ({ render }) => (
		<Query
			fetchPolicy="cache-and-network"
			query={ GET_INGREDIENTS_COUNT_QUERY }
			ssr={ false }
		>
			{ render }
		</Query>
	),
});

const IngredientsPageStyles = styled.article`
`;

class Ingredients extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = { showContainers: false };
	}

	componentDidUpdate(prevProps) {
		const { query } = this.props;
		const { group = 'name', id = null, view = 'all' } = query;

		if ((prevProps.query.group !== group) || (prevProps.query.view !== view) || (prevProps.query.id !== id)) {
			this.updateContainers('props change');
		}
	}

	refreshContainers = () => {
		const { client } = this.props;

		const queries = [
			{ query: GET_ALL_INGREDIENTS_QUERY },
			{ query: GET_INGREDIENTS_COUNT_QUERY },
		];

		return Promise.all(queries.map((q) => client.query(
			{
				...q,
				fetchPolicy: 'network-only',
			},
		)));
	}

	updateContainers = async (sender) => {
		console.log('updateContainers', sender);
		// TODO update and/or create containers
		const { client, query } = this.props;
		const { group = 'name', view = 'all' } = query;
		let containers = [];
		let showContainers = false;

		// check if these containers are already in our cache
		try {
			({ containers } = client.readQuery({
				query: GET_ALL_CONTAINERS_QUERY,
				variables: {
					group,
					view,
				},
			}));
		} catch (e) {
			// this query doesn't exist in our cache yet
			console.error(`"${ group }" and "${ view }" doesn't exist in our cache yet!`);
		}
		console.log(containers, containers.length, !containers.length);

		// TODO apply any ingredient updates if they do exist
		if (containers.length) {
			console.log('TODO apply any ingredient updates if they do exist');
			showContainers = true;
		}

		if (!containers.length) {
			console.log('creating containers...');
			// create the containers
			await client.mutate({
				mutation: CREATE_CONTAINERS_MUTATION,
				variables: {
					group,
					view,
				},
			});
			console.log('finished!');
			showContainers = true;
		}

		this.setState({ showContainers });
	}

	render() {
		console.log('Ingredients render');
		const { query } = this.props;
		const { group = 'name', view = 'all' } = query;
		const { showContainers } = this.state;

		return (
			<Composed onCompleted={ async () => this.updateContainers('completed') }>
				{
					({ getIngredients, getIngredientsCount }) => {
						const { error, loading } = getIngredients;
						const { data } = getIngredientsCount || {};
						const { ingredientAggregate } = data || {};
						const { ingredientsCount, newIngredientsCount } = ingredientAggregate || {};
						console.log({
							q1: getIngredients.networkStatus,
							q2: getIngredientsCount.networkStatus,
							loading,
							...getIngredients.data,
							showContainers,
						});
						return (
							<IngredientsPageStyles>
								<Header pageHeader="Ingredients" />
								<section>
									{/* view and group filters */}
									<Filters
										group={ group }
										ingredientsCount={ ingredientsCount }
										newIngredientsCount={ newIngredientsCount }
										view={ view }
									/>

									{/* display error messages */
										(error) ? <ErrorMessage error={ error } /> : null
									}

									{/* loading ingredients message */
										(loading)
											? <Loading name="ingredients" />
											: null
									}

									{
										(showContainers)
											? (
												<Containers
													group={ group }
													view={ view }
												/>
											)
											: null
									}

									<AddNew
										refreshContainers={ this.refreshContainers }
										view={ view }
									/>
								</section>
							</IngredientsPageStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Ingredients.defaultProps = {
	query: {
		group: 'name',
		id: null,
		view: 'all',
	},
};

Ingredients.propTypes = {
	client: PropTypes.shape({
		mutate: PropTypes.func,
		readQuery: PropTypes.func,
		query: PropTypes.func,
	}).isRequired,
	query: PropTypes.shape({
		group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
		id: PropTypes.string,
		view: PropTypes.oneOf([ 'all', 'new' ]),
	}),
};

export default withApollo(Ingredients);
