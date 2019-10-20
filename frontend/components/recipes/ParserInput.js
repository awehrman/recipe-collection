import Editor from 'react-pell';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Parser from '../../../backend/src/lib/ingredientLineParser';
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

	onChange = (domContent) => {
		const { onChange } = this.props;

		const parsed = new DOMParser().parseFromString(domContent, 'text/html');
		const children = (parsed.body.children && (parsed.body.children.length > 0))
			? [ ...parsed.body.children ]
			: [ ...new DOMParser().parseFromString(`<div>${ parsed.body.innerText }</div>`, 'text/html').body.children ];
		const domHasActualContent = children.filter(c => c && c.innerText && (c.innerText.length > 0)).map(c => c.innerText).length > 0;

		const dom = domHasActualContent ? domContent : '';
		this.setState({ domContent: dom }, () => onChange(dom));
	}

	parseContent = (e) => {
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
		const parsedIngredientLines = ingredientLines.map(line => this.parseIngredientLine(line));

		onComplete(parsedIngredientLines, instructions);
	};

	parseHTML = (content) => {
		const blocks = [];
		const ingredients = [];
		const instructions = [];

		const dom = new DOMParser().parseFromString([ content ], 'text/html');
		const children = (dom.body.children && (dom.body.children.length > 0))
			? [ ...dom.body.children ]
			: [ ...new DOMParser().parseFromString(`<div>${ dom.body.innerText }</div>`, 'text/html').body.children ];

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
			// add ingredient lines if its the first line, or if we have multiple lines per block
			if ((blockIndex === 0) || (block.length > 1)) {
				block.forEach((line, lineIndex) => {
					ingredients.push({
						blockIndex,
						lineIndex,
						reference: line,
					});
				});
			} else if (block.length === 1) {
				// add ingredient lines if our block only has a single line
				instructions.push({
					blockIndex,
					reference: block[0],
				});
			}
		});

		// this occurs if we have a single line, useful mostly for testing
		if ((blocks.length === 0) && (currentBlock.length > 0)) {
			currentBlock.forEach((line, lineIndex) => {
				ingredients.push({
					blockIndex: 0,
					lineIndex,
					reference: line,
				});
			});
		}

		// if we still have leftovers in the current block and blocks is populated, then its a leftover instruction
		if ((blocks.length > 0) && (currentBlock.length > 0)) {
			currentBlock.forEach((line) => {
				instructions.push({
					blockIndex: blocks.length,
					reference: line,
				});
			});
		}

		return [ ingredients, instructions ];
	};

	parseIngredientLine = (line) => {
		const ingredientLine = {
			...line,
			isParsed: false,
			reference: line.reference.trim(),
		};
		let parsed;

		// try to parse the ingredient line into parts
		try {
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
			parsed = Parser.parse(ingredientLine.reference);
			ingredientLine.isParsed = true;
			ingredientLine.rule = parsed.rule;
			ingredientLine.parsed = parsed.values.map(v => ({ ...v }));
		} catch (err) {
			console.error('failed to parse');
			console.log({ err });
			// TODO log failures to db
		}

		return ingredientLine;
	};

	render() {
		const { domContent } = this.state;

		return (
			<ParserInputStyles>
				<EditorStyles>
					<Editor
						actions={ [] }
						defaultContent={ domContent }
						onChange={ this.onChange }
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
	onChange: PropTypes.func.isRequired,
	onComplete: PropTypes.func.isRequired,
};

export default ParserInput;
