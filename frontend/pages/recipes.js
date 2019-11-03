import { adopt } from 'react-adopt';
import React from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GET_ALL_RECIPES_QUERY, GET_RECIPES_COUNT_QUERY } from '../lib/apollo/queries';

import AddNew from '../components/recipes/AddNew';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import Header from '../components/Header';
import Image from '../components/form/Image';
import ParsedViewer from '../components/recipes/ParsedViewer';

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getRecipes: ({ render }) => (
		<Query query={ GET_ALL_RECIPES_QUERY }>
			{render}
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getRecipesCount: ({ render }) => (
		<Query query={ GET_RECIPES_COUNT_QUERY }>
			{render}
		</Query>
	),
});

const Count = styled.div`
	display: flex;
	font-size: .875em;
	color: #222;
	margin-bottom: 20px;

	&.left {
		flex: 1;
	}

	&.right {
		flex: 1;
		text-align: right;
		font-weight: 600;
		justify-content: flex-end;
	}
`;

const Title = styled.h1`
	font-size: 24px;
	font-weight: 100;
	margin-top: 0;
`;

const Source = styled.div`
	font-style: italic;
	font-size: 12px;
	color: #bbb !important;
	margin-top: 4px;
	text-align: right;
`;

const Categories = styled.ul`
	list-style: none;
	display: inline-block;
	color: ${ (props) => props.theme.altGreen };
	width: 45%;
	padding: 0;
	margin: 15px 5px 0px 0;
	font-size: 14px;
`;

const Tags = styled.ul`
	margin-bottom: 8px;
	list-style: none;
	display: inline-block;
	color: white;
	width: 45%;
	margin: 15px 10px 10px 0;
	padding: 0;
	float: right;
	text-align: right;

	li {
		font-size: 12px;
		padding: 4px 10px;
		font-weight: 900;
		display: inline;
		background: ${ (props) => props.theme.altGreen };
		border-radius: 50px;
		width: 100%;
		margin-left: 5px;
	}
`;

const RecipesStyles = styled.article`
`;

const TempCardStyles = styled.div`
	border: 1px solid #ccc;
	border-radius: 5px;
	padding: 40px;
	margin-bottom: 60px;
	width: 80%;
`;

class Recipes extends React.PureComponent {
	refreshRecipes = () => {
		const { client } = this.props;

		const queries = [
			{ query: GET_ALL_RECIPES_QUERY },
			{ query: GET_RECIPES_COUNT_QUERY },
		];

		return Promise.all(queries.map((q) => client.query(
			Object.assign({}, q, { fetchPolicy: 'network-only' }),
		)));
	}

	render() {
		return (
			<Composed>
				{
					({ getRecipes, getRecipesCount }) => {
						const { error, loading } = getRecipes;
						const { data } = getRecipesCount || {};
						const { recipeAggregate } = data || {};
						const { recipesCount } = recipeAggregate || {};
						const { data: { recipes = [] } } = getRecipes;

						// TODO install an actual view here
						return (
							<RecipesStyles>
								<Header pageHeader="Recipes" />
								<section>
									<Count className="right">
										{ recipesCount }
									</Count>

									{(error) ? <ErrorMessage error={ error } /> : null}

									{
										(loading)
											? <Loading name="recipes" />
											: recipes.map((r) => (
												<TempCardStyles key={ `${ r.id }` }>
													{/* Title Preview */}
													<Title>
														{ r.title }
													</Title>

													{/* Image Preview */}
													<Image value={ r.image } />

													{/* Source Preview */}
													<Source>
														{ r.source }
													</Source>

													{/* Categories Preview */}
													<Categories>
														{
															r.categories.map((c) => (
																<li key={ `categories_display_${ c.id }_${ c.name }` }>
																	{ c.name }
																</li>
															))
														}
													</Categories>

													{/* Tags Preview */}
													<Tags>
														{
															r.tags.map((c) => (
																<li key={ `tags_display_${ c.id }_${ c.name }` }>
																	{ c.name }
																</li>
															))
														}
													</Tags>

													<ParsedViewer
														loading={ loading }
														ingredients={ r.ingredients }
														instructions={ r.instructions }
													/>
												</TempCardStyles>
											))
									}

									<AddNew refreshRecipes={ this.refreshRecipes } />
								</section>
							</RecipesStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Recipes.defaultProps = {};

Recipes.propTypes = { client: PropTypes.shape({ query: PropTypes.func }).isRequired };

export default withApollo(Recipes);
