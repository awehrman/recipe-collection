import { withApollo } from 'react-apollo';
import Editor from 'react-pell';
import React from 'react';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Parser from '../../../backend/src/lib/ingredientLineParser';
import { GET_INGREDIENT_BY_VALUE_QUERY, GET_INGREDIENTS_COUNT_QUERY, GET_ALL_INGREDIENTS_QUERY } from '../../lib/apollo/queries';
import { CREATE_INGREDIENT_MUTATION } from '../../lib/apollo/mutations';
import Button from '../form/Button';

const ParserInputStyles = styled.div`
	display: flex;
	width: 100%;
	flex-direction: column;
`;

const EditorStyles = styled.div`
	flex: 1;

	.pell-actionbar {
		display: none;
	}

	.pell-content {
		flex: 1;
		height: 100%;
		min-height: 300px;
		border: 0;
		padding: 10px;
		font-size: 12px;
		width: 90%;
		background: white;
		width: 100%;
	}
`;

const ParseButtonStyles = styled.div`
	flex: 1;
	margin: 0;
	padding: 0;

	button {
		background: ${ props => props.theme.highlight } !important;
		color: white !important;
		text-transform: uppercase;
		font-weight: 900;
		text-align: center;
		padding: 6px 0 !important;
		margin-top: 10px !important;
		margin-bottom: 0 !important;
		width: 100%;
		height: 100%;
	}
`;

class ParserInput extends React.Component {
	state = { domContent: '' };

	parseContent = async (e) => {
		e.preventDefault();
		const { onComplete } = this.props;
		const { domContent } = this.state;

		let ingredientLines = [];
		let instructions = [];

		// tease out the ingredient lines vs the instructions from the note content
		if (domContent) {
			[ ingredientLines, instructions ] = this.parseHTML(domContent);
		}

		// parse each ingredient line into its individual components
		ingredientLines = ingredientLines.map(async line => this.parseIngredientLine(line));
		Promise.all(ingredientLines).then(ingredients => onComplete(ingredients, instructions));
	};

	parseHTML = (content) => {
		const blocks = [];
		const ingredients = [];
		const instructions = [];

		const dom = new DOMParser().parseFromString([ content ], 'text/html');
		const children = [ ...dom.body.children ];

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
			// console.warn({ block, blockIndex, length: block.length });
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
		// console.log({ ingredients, instructions });
		return [ ingredients, instructions ];
	};

	parseIngredientLine = async (line) => {
		const { client } = this.props;
		let parsed = {
			...line,
			reference: line.reference.trim(),
		};

		try {
			parsed = {
				...parsed,
				...Parser.parse(parsed.reference),
			};
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
			const lookupIngredient = parsed.values.map(async (v) => {
				const value = { ...v };
				if (value.type === 'ingredient') {
					const name = !pluralize.isPlural(value.value)
						? value.value
						: pluralize.singular(value.value);
					let plural = pluralize.isPlural(value.value)
						? value.value
						: null;

					// attempt to pluralize the ingredient name
					try {
						plural = pluralize.plural(value.value);
					} catch (err) {
						//
					}

					// check if this is an existing ingredient
					try {
						const { data } = await client.query({
							query: GET_INGREDIENT_BY_VALUE_QUERY,
							variables: { value: name },
						});
						const { ingredient } = data;
						if (ingredient) {
							parsed.ingredient = {
								id: ingredient.id,
								name: ingredient.name,
								properties: { ...ingredient.properties },
								isValidated: ingredient.isValidated,
							};
							createIng = false;
						} else {
							createIng = true;
						}
					} catch (err) {
						// if we didn't find the ingredient, then create it
						createIng = true;
					}

					// if not, create a new ingredient with this value
					// TODO add some validation like it can't match a known unit name and mark as not parsed
					if (createIng) {
						// console.log(`creating ${ value.value }...`);
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
							if (res.data.createIngredient.ingredient) {
								value.id = res.data.createIngredient.ingredient.id;
								value.name = res.data.createIngredient.ingredient.name;
								value.properties = { ...res.data.createIngredient.ingredient.properties };
								value.isValidated = res.data.createIngredient.ingredient.isValidated;
							}
						});
					}
				}

				return value;
			});

			Promise.all(lookupIngredient).then((values) => {
				parsed.values = values;
			});
		} catch (err) {
			console.error('failed to parse');
			console.log({ err });
			// TODO handle?
			parsed.isParsed = false;
		}

		return parsed;
	};

	render() {
		const { onChange } = this.props;
		const { domContent } = this.state;

		return (
			<ParserInputStyles>
				<EditorStyles>
					<Editor
						actions={ [] }
						defaultContent={ domContent }
						onChange={ c => this.setState({ domContent: c }, () => onChange(c)) }
					/>
				</EditorStyles>
				<ParseButtonStyles>
					<Button
						label="Parse"
						onClick={ e => this.parseContent(e) }
						type="button"
					/>
				</ParseButtonStyles>
			</ParserInputStyles>
		);
	}
}

ParserInput.defaultProps = {};

ParserInput.propTypes = {
	client: PropTypes.shape({
		query: PropTypes.func,
		mutate: PropTypes.func,
	}).isRequired,
	onChange: PropTypes.func.isRequired,
	onComplete: PropTypes.func.isRequired,
};

export default withApollo(ParserInput);
