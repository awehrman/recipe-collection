import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { GET_DASHBOARD_INGREDIENTS_QUERY, GET_DASHBOARD_PARSING_QUERY, GET_DASHBOARD_RECIPES_QUERY } from '../lib/apollo/queries';

import Header from '../components/Header';
import Card from '../components/recipes/Card';

const DashboardStyles = styled.article`
	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
		font-size: 14px;
	}
`;

const Row = styled.div`
	margin-bottom: 20px;
	display: flex;
	width: 100%;
`;

const Cell = styled.div`
	flex-basis: 25%;
	padding: 10px;
	line-height: 1.4;

	ul.columns {
		column-count: 2;
  	column-gap: 4px;
	}

	ul.errors {
		margin-top: 20px;
	}
`;

const FullWidth = styled.div`
	flex-basis: 100%;
	padding: 10px;

	.container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
`;

const onRecipeClick = (e) => {
	e.preventDefault();
	// TODO route to recipes page?
};

const Index = () => {
	// fetch ingredients
	const {
		data: ingredientData,
		// loading: ingredientLoading,
		//  error: ingredientError,
	} = useQuery(GET_DASHBOARD_INGREDIENTS_QUERY);
	const { dashboardIngredients } = ingredientData || {};
	const {
		newlyVerified = [],
		newlyParsed = [],
		numIngredients = 0,
		numUnverified = 0,
		numLines = 0,
		numRecipes = 0,
	} = dashboardIngredients || {};


	// fetch statistics
	const {
		data: parsingData,
		// loading: parsingLoading,
		// error: parsingError,
	} = useQuery(GET_DASHBOARD_PARSING_QUERY);
	const { dashboardParsing = {} } = parsingData || {};
	const {
		parsingInstances = [],
		parsingErrors = 0,
		semanticErrors = 0,
		dataErrors = 0,
		instruction = 0,
		equipment = 0,
		baseRate = 0,
		adjustedRate = 0,
		parsingRate = 0,
		dataAccuracy = 0,
	} = dashboardParsing || {};

	// fetch recipes
	const {
		data: recipeData,
		// loading: recipeLoading,
		// error: recipeError,
	} = useQuery(GET_DASHBOARD_RECIPES_QUERY);
	const { dashboardRecipes } = recipeData || {};
	const { newRecipes = [] } = dashboardRecipes || {};

	// TODO mobile styles
	// TODO error and loading
	return (
		<DashboardStyles>
			<Header pageHeader="Dashboard" />
			<section>
				<Row>
					{/* New Ingredients */}
					<Cell>
						<h2>New Ingredients</h2>
						<ul className="columns">
							{
								newlyVerified.map((ing) => (
									<li key={ `newIng_${ ing.id }` }>
										{ ing.name }
									</li>
								))
							}
						</ul>
					</Cell>

					{/* Recently Parsed Ingredients */}
					<Cell>
						<h2>Recently Parsed Ingredients</h2>
						<ul className="columns">
							{
								newlyParsed.map((ing) => (
									<li key={ `parsed_${ ing.id }` }>
										{ing.name}
									</li>
								))
							}
						</ul>
					</Cell>

					{/* Recent Parsing Errors */}
					<Cell>
						<h2>Recent Parsing Errors</h2>
						<ul>
							{
								parsingInstances.map((err) => (
									<li key={ `parsingInstances_${ err.id }` }>
										{ err.reference }
									</li>
								))
							}
						</ul>

						<h2>Data Summary</h2>
						<ul>
							<li>
								<span>Ingredients: </span>
								{ numIngredients }
							</li>
							<li>
								<span>Unverified: </span>
								{ numUnverified }
							</li>
							<li>
								<span>Lines: </span>
								{ numLines }
							</li>
							<li>
								<span>Recipes: </span>
								{ numRecipes }
							</li>
						</ul>
					</Cell>

					{/* Error Summary */}
					<Cell>
						<h2>Error Summary</h2>
						<ul>
							<li>
								<span>Parsing Errors: </span>
								{ parsingErrors }
							</li>
							<li key="dashboardSemanticErrors">
								<span>Semantic Errors: </span>
								{ semanticErrors }
							</li>
							<li key="dashboardDataErrors">
								<span>Data Errors: </span>
								{ dataErrors }
							</li>
							<li key="dashboardInstructionsErrors">
								<span>Instructions Errors: </span>
								{ instruction }
							</li>
							<li key="dashboardEquipmentErrors">
								<span>Equipment Instances: </span>
								{ equipment }
							</li>
						</ul>
						<ul className="errors">
							<li>
								<span>Base Accuracy Rate: </span>
								{ `${ baseRate }%` }
							</li>
							<li>
								<span>Adjusted Accuracy Rate: </span>
								{ `${ adjustedRate }%` }
							</li>
							<li>
								<span>Lines: </span>
								{ `${ parsingRate }%` }
							</li>
							<li>
								<span>Recipes: </span>
								{ `${ dataAccuracy }%` }
							</li>
						</ul>
					</Cell>
				</Row>

				<Row>
					{/* Recently Added Recipes */}
					<FullWidth>
						<h2>Recently Added Recipes</h2>
						<div className="container">
							{
								newRecipes.map((rp) => (
									<Card
										className="dashboard"
										key={ `newRp_${ rp.id }` }
										onClick={ onRecipeClick }
										recipe={ rp }
									/>
								))
							}
						</div>
					</FullWidth>
				</Row>
			</section>
		</DashboardStyles>
	);
};

export default Index;
