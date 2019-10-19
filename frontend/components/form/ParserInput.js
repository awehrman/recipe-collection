import { withApollo } from 'react-apollo';
import Editor from 'react-pell';
import React from 'react';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Parser from '../../../backend/src/lib/ingredientLineParser';
import { GET_INGREDIENT_BY_VALUE_QUERY, GET_INGREDIENTS_COUNT_QUERY, GET_ALL_INGREDIENTS_QUERY } from '../../lib/apollo/queries';
import { CREATE_INGREDIENT_MUTATION } from '../../lib/apollo/mutations';

const ParserInputStyles = styled.div`
	margin: 20px 0;
	display: flex;

	.pell-content {
		flex: 1;
		height: 600px;
		border: 0;
		padding: 10px;
		font-size: 12px;
		width: 90%;
		background: white;
	}

	.display {
			flex: 1;
		font-size: 12px;
	}
`;

const Left = styled.div`
	flex: 1;
`;

const Right = styled.div`
	flex: 1;
`;

class ParserInput extends React.Component {
	// TODO set this up in the backend and import this in
	parseNoteContent = async (content, recipeID) => {
		let ingredientLines = [];
		let instructions = [];

		// tease out the ingredient lines vs the instructions from the note content
		if (content) {
			[ ingredientLines, instructions ] = this.parseHTML(content);
		}

		// parse each ingredient line into its individual components
		ingredientLines = ingredientLines.map(line => this.parseIngredientLine(line, recipeID));

		// eslint-disable-next-line
		console.log({ ingredientLines, instructions });

		return {
			ingredientLines,
			instructions,
		};
	};

	parseHTML = (content) => {
		const blocks = [];
		const ingredients = [];
		const instructions = [];

		const dom = new DOMParser().parseFromString([ content ], 'text/html');
		const children = [ ...dom.body.children ];
		console.log({ children });

		// go through the children of our root level div to look for new lines or actual text
		// we may go one level deeper to look for these instances to handle some inconsistent HTML formatting on these notes
		let currentBlock = [];

		children.forEach((div) => {
			const hasContent = (div.innerText.length > 0) ? 1 : 0;
			if (!hasContent && (currentBlock.length > 0)) {
				blocks.push(currentBlock);
				currentBlock = [];
			} else if (div.innerText.length > 0) {
				currentBlock.push(div.innerText);
			}
		});

		/* blocks should look like this, where after the first instance, each array with length of 1 is an instruction
			[
				["12 pork cheeks"],
				["1 onion, chopped","4 cloves"],
				["4 pak choi","100 ml of sesame oil","sesame seeds, toasted"],
				["To begin, ..."],
				["Reduce the heat ..."]
			]
		*/

		blocks.forEach((block, blockIndex) => {
			// eslint-disable-next-line
			console.warn({ block, blockIndex, length: block.length });
			// add ingredient lines if its the first line, or if we have multiple lines per block
			if ((blockIndex === 0) || (block.length > 1)) {
				block.forEach((line, lineIndex) => {
					ingredients.push({
						block: blockIndex,
						line: lineIndex,
						reference: line,
					});
				});
			} else if (block.length === 1) {
				// add ingredient lines if our block only has a single line
				instructions.push({
					block: blockIndex,
					line: 0,
					reference: block[0],
				});
			}
		});

		// eslint-disable-next-line
		console.log({ ingredients, instructions });
		return [ ingredients, instructions ];
	};

	parseContent = async (dom) => {
		await this.parseNoteContent(dom, '123');
	}

	parseIngredientLine = async (line) => {
		const { client } = this.props;
		let parsed;

		try {
			parsed = Parser.parse(line.reference);

			// line: "~1 heaping cup (100 g) freshly-cut apples, washed"
			/* should result in an object that looks like:
				/* should result in an object that looks like:
				{
					"rule": "#1_ingredientLine",
					"type": "line",
					"values": [
							{
								"rule": "#1_ingredientLine >> #2_quantities >> #2_quantityExpression
								>> #3_amounts >> #2_amountExpression >> #2_amount",
								"type": "amount",
								"value": "1"
							},
							{
								"rule": "#1_ingredientLine >> #3_ingredients >> #1_ingredientExpression >> #2_ingredient",
								"type": "ingredient",
								"value": "apples"
							}
					]
				}
			*/

			parsed.isParsed = true;
			let createIng = false;
			parsed.values = parsed.values.map(async (v) => {
				const value = { ...v };
				if (value.type === 'ingredient') {
					const name = !pluralize.isPlural(value.value)
						? value.value
						: pluralize.singular(value.value);
					let plural = pluralize.isPlural(value.value)
						? value.value
						: null;
					try {
						plural = pluralize.plural(value.value);
					} catch (err) {
						//
					}
					try {
						const { data } = await client.query({
							query: GET_INGREDIENT_BY_VALUE_QUERY,
							variables: { value: name },
						});
						const { ingredient } = data;
						if (ingredient) {
							value.id = ingredient.id;
							value.name = ingredient.name;
							value.properties = { ...ingredient.properties };
							value.isValidated = ingredient.isValidated;
							createIng = false;
						} else {
							createIng = true;
						}
					} catch (err) {
						// if we didn't find the ingredient, then create it
						createIng = true;
					}

					if (createIng) {
						console.log(`we should probably create ${ value.value }...`);
						// create the ingredient on the server
						await client.mutate({
							refetchQueries: [
								{ query: GET_ALL_INGREDIENTS_QUERY },
								{ query: GET_INGREDIENTS_COUNT_QUERY },
							],
							mutation: CREATE_INGREDIENT_MUTATION,
							variables: {
								data:
								{
									name,
									plural,
									properties: {
										create: {
											dairy: false,
											fish: false,
											gluten: false,
											meat: false,
											poultry: false,
											soy: false,
										},
									},
								},
							},
						}).then((res) => {
							console.log(res.data.createIngredient.ingredient);
							if (res.data.createIngredient.ingredient) {
								value.id = res.data.createIngredient.ingredient.id;
								value.name = res.data.createIngredient.ingredient.name;
								value.properties = { ...res.data.createIngredient.ingredient.properties };
								value.isValidated = res.data.createIngredient.ingredient.isValidated;
							}
						});
					}
				}

				console.log({ value });
				return value;
			});
		} catch (err) {
			console.log('failed to parse');

			// let ingredient = new Ingredient(line.reference);
			// ingredient.addReference(line.reference, recipeID);
			// ingredientController.saveError({ associations: [], type: 'parsing' }, ingredient.encodeIngredient());
		}

		return line;
	};

	render() {
		const { defaultValue, isEditMode, value } = this.props;

		let inputValue = (isEditMode && (value !== undefined)) ? value : defaultValue;
		inputValue = (!inputValue) ? '' : inputValue;

		return (
			<ParserInputStyles>
				<Left>
					<Editor actions={ [] } onChange={ this.parseContent } />
				</Left>
				<Right>
					<div className="display">{ inputValue }</div>
				</Right>
			</ParserInputStyles>
		);
	}
}

ParserInput.defaultProps = {
	defaultValue: '',
	isEditMode: false,
	value: '',
};

ParserInput.propTypes = {
	client: PropTypes.shape({
		query: PropTypes.func,
		mutate: PropTypes.func,
	}).isRequired,
	defaultValue: PropTypes.string,
	isEditMode: PropTypes.bool,
	value: PropTypes.string,
};

export default withApollo(ParserInput);
