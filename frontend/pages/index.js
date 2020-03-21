import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { GET_DASHBOARD_INGREDIENTS_QUERY } from '../lib/apollo/queries/ingredients';
import { GET_DASHBOARD_PARSING_QUERY } from '../lib/apollo/queries/notes';
import { GET_DASHBOARD_RECIPES_QUERY } from '../lib/apollo/queries/recipes';

import Header from '../components/Header';
import ViewMoreList from '../components/ingredients/ViewMoreList';
import Carousel from '../components/recipes/Carousel';

const DashboardStyles = styled.article`
	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
		font-size: 14px;
	}
`;

const Row = styled.div`
	/* mobile: everything is just one long list */

	/* small tablet wraps the top row into equally distributed columns */
	@media (min-width: ${ (props) => props.theme.tablet_small }) {
		&.tri-column {
			display: flex;
			justify-content: space-between;
		}
	}

	/* as we get larger, keep the three columns to the left, and start to wrap the remaining row */
	@media (min-width: ${ (props) => props.theme.tablet }) {
		display: flex;
		justify-content: flex-start;
		div {
			margin-right: 60px;
		}

		&.tri-column {
			justify-content: flex-start;
		}
	}
`;

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

	const dataSummary = [
		{
			id: 'ingredients',
			name: 'Ingredients',
			reference: `${ numIngredients }`,
		},
		{
			id: 'unverified',
			name: 'Unverified',
			reference: `${ numUnverified }`,
		},
		{
			id: 'lines',
			name: 'Lines',
			reference: `${ numLines }`,
		},
		{
			id: 'recipes',
			name: 'Recipes',
			reference: `${ numRecipes }`,
		},
	];

	const errorSummary = [
		{
			id: 'parsingErrors',
			name: 'Parsing Errors',
			reference: `${ parsingErrors }`,
		},
		{
			id: 'semanticErrors',
			name: 'Semantic Errors',
			reference: `${ semanticErrors }`,
		},
		{
			id: 'dataErrors',
			name: 'Data Errors',
			reference: `${ dataErrors }`,
		},
		{
			id: 'instructionErrors',
			name: 'Instruction Errors',
			reference: `${ instruction }`,
		},
		{
			id: 'equipmentErrors',
			name: 'Equipment Errors',
			reference: `${ equipment }`,
		},
	];

	const rates = [
		{
			id: 'baseRate',
			name: 'Base Accuracy Rate',
			reference: `${ baseRate }%`,
		},
		{
			id: 'adjustedRate',
			name: 'Adjusted Accuracy Rate',
			reference: `${ adjustedRate }%`,
		},
		{
			id: 'parsingRate',
			name: 'Parsing Rate',
			reference: `${ parsingRate }%`,
		},
		{
			id: 'dataAccuracy',
			name: 'Recipes',
			reference: `${ dataAccuracy }%`,
		},
	];

	return (
		<DashboardStyles>
			<Header pageHeader="Dashboard" />
			<section>
				<Row className="tri-column">
					{/* Data Summary */}
					<ViewMoreList
						isLinkEnabled={ false }
						list={ dataSummary }
						title="Data Summary"
						name="dataSummary"
						type="label"
					/>

					{/* Error Summary */}
					<ViewMoreList
						list={ errorSummary }
						title="Error Summary"
						name="errorSummary"
						type="label"
					/>

					{/* Error Rates */}
					<ViewMoreList
						list={ rates }
						title="Error Rates"
						name="errorRates"
						type="label"
					/>
				</Row>

				<Row>
					{/* Recent Parsing Errors */
						(parsingInstances && parsingInstances.length)
							? (
								<ViewMoreList
									list={ parsingInstances }
									title="Recent Parsing Errors"
									name="recentlyParsedErrors"
								/>
							)
							: null
					}

					{/* Recently Added */}
					<ViewMoreList
						href="/ingredients/?view=new"
						isLinkEnabled
						list={ newlyParsed }
						title="Recently Added"
						name="recentlyAdded"
						type="column"
					/>


					{/* New Ingredients */}
					<ViewMoreList
						href="/ingredients"
						isLinkEnabled
						list={ newlyVerified }
						title="New Ingredients"
						name="newIngredients"
						type="column"
					/>

				</Row>

				{/* Recently Added Recipes */}
				<Carousel
					title="Recently Added Recipes"
					query={ GET_DASHBOARD_RECIPES_QUERY }
				/>

			</section>
		</DashboardStyles>
	);
};

export default Index;
