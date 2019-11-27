import { adopt } from 'react-adopt';
import { Query, withApollo } from 'react-apollo';
import styled from 'styled-components';
import { GET_DASHBOARD_INGREDIENTS_QUERY, GET_DASHBOARD_PARSING_QUERY, GET_DASHBOARD_RECIPES_QUERY } from '../lib/apollo/queries';

import Header from '../components/Header';

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getDashboardIngredients: ({ render }) => (
		<Query query={ GET_DASHBOARD_INGREDIENTS_QUERY } fetchPolicy="cache-and-network">
			{ render }
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getDashboardParsing: ({ render }) => (
		<Query query={ GET_DASHBOARD_PARSING_QUERY } fetchPolicy="cache-and-network">
			{ render }
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getDashboardRecipes: ({ render }) => (
		<Query query={ GET_DASHBOARD_RECIPES_QUERY } fetchPolicy="cache-and-network">
			{ render }
		</Query>
	),
});


const DashboardStyles = styled.article`
	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
		font-size: 14px;
	}
`;

const Index = () => (
	<DashboardStyles>
		<Header pageHeader="Dashboard" />
		<Composed>
			{
				({ getDashboardIngredients, getDashboardParsing, getDashboardRecipes }) => {
					const { data: ingData = {} } = getDashboardIngredients;
					const { dashboardIngredients = {} } = ingData;
					const { newIngredients = [] } = dashboardIngredients;

					const { data: parsingData = {} } = getDashboardParsing;
					const { dashboardParsing = {} } = parsingData;
					const { parsingErrors = [] } = dashboardParsing;

					const { data: rpData = {} } = getDashboardRecipes;
					const { dashboardRecipes = {} } = rpData;
					const { newRecipes = [] } = dashboardRecipes;
					return (
						<>
							{/* Ingredient Statistics */}
							<section id="ingredients">
								<h2>New Ingredients</h2>
								<ul>
									{
										newIngredients.map((ing) => (
											<li key={ `newIng_${ ing.id }` }>
												{ ing.name }
											</li>
										))
									}
								</ul>
							</section>

							{/* Parsing Statistics */}
							<section id="parsing">
								<h2>Parsing Errors</h2>
								<ul>
									{
										parsingErrors.map((err) => (
											<li key={ `parsingError_${ err.id }` }>
												{ err.reference }
											</li>
										))
									}
								</ul>
							</section>

							{/* Recipe Statistics */}
							<section id="recipes">
								<h2>New Recipes</h2>
								<ul>
									{
										newRecipes.map((rp) => (
											<li key={ `newRp_${ rp.id }` }>
												{ rp.title }
											</li>
										))
									}
								</ul>
							</section>
						</>
					);
				}
			}
		</Composed>
	</DashboardStyles>
);

export default withApollo(Index);
