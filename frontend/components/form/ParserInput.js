import render from 'cheerio-react';
import React from 'react';
import Editor from 'react-pell';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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
	constructor(props) {
		super(props);

		this.state = {
			recipe: '',
			output: {
				ingredients: [],
				instructions: [],
			},
		};
	}

	// TODO set this up in the backend and import this in
	parseNoteContent = (content, recipeID) => {
		let ingredientLines = [];
		let instructions = [];

		// tease out the ingredient lines vs the instructions from the note content
		if (content) {
			[ ingredientLines, instructions ] = this.parseHTML(content);
		}

		// parse each ingredient line into its individual components
		// ingredientLines = ingredientLines.map(line => this.parseIngredientLine(line, recipeID));

		console.log({ ingredientLines, instructions });

		return { ingredientLines, instructions };
	};

	parseHTML = (content) => {
		let blocks = [];
		let lines = [];
		const ingredients = [];
		const instructions = [];

		// we'll use cheerio to help translate our content string into a traversable DOM structure
		// $ = cheerio.load(content);
		// const body = $('body').children();
		const div = React.createElement('div', content);
		const body = render(div);
		console.log({ div, body });

		// we're going to run with some basic assumptions on how recipe data
		// is formatted to differentiate between ingredient lines and instructions

		// ingredient lines are grouped together in blocks, but
		// we'll make an exception if the first line is by itself

		// instructions are surrounded by <div><br/ ></div>

		// so sample content might look like:

		/**
			<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
				<en-note>
						<div>
								// below is our single recipe image
								<en-media hash="1dd640eacebd80e0bbb2b643daeab8c5" type="image/png" />
								<br />
						</div>
						<div>
								<br />
						</div>
						<div>some text</div>			// ingredient* (block: 0, line: 0)
						<div>											// *make an exception for first line
								<br />
						</div>
						<div>some text</div>			// ingredient* (block: 1, line: 0)
						<div>some text</div>			// ingredient* (block: 1, line: 1)
						<div>some text</div>			// ingredient* (block: 1, line: 2)
						<div>some text</div>			// ingredient* (block: 1, line: 3)
						<div>
								<br />
						</div>
						<div>some text</div>			// ingredient* (block: 2, line: 0)
						<div>some text</div>			// ingredient* (block: 2, line: 1)
						<div>
								<br />
						</div>
						<div>some text</div>			// instruction (block: 3, line: 0)
						<div>
								<br />
						</div>
						<div>some text</div>			// instruction (block: 4, line: 0)
				</en-note>
		 *
		 */


		// go through the children of our root level divs to look for new lines or actual text
		// we may go one level deeper to look for these instances to handle some inconsistent HTML formatting on these notes
/*
		body[0].children.forEach((rootEl) => {
			if (rootEl.children) {
				rootEl.children.forEach((childEl) => {
					// if we found a new line, create a new block
					if (childEl.name === 'br') {
						blocks = [];
						lines.push(blocks);
					}
					// if we found actual text, then add it to our current block
					else if (childEl.data && childEl.data.trim().length > 0) {
						blocks.push(childEl.data.replace(/\s+/g, ' ').trim());
					} else {
						// if we found more children, then we'll have to dip a bit deeper
						// TODO we could probably make this recursive, but in reality these notes don't get that complicated so eh...
						if (childEl.children) {
							childEl.children.forEach((grandChildEl) => {
								// if we found a new line, create a new block
								if (grandChildEl.name === 'br') {
									blocks = [];
									lines.push(blocks);
								}
								// if we found actual text, then add it to our current block
								else if (grandChildEl.data && grandChildEl.data.trim().length > 0) {
									blocks.push(grandChildEl.data.replace(/\s+/g, ' ').trim());
								}
							});
						}
					}
				});
			}
		});

		// go through lines and strip out any empty arrays
		lines = lines.filter(line => line.length > 0);

		// we'll expect "lines" to end up with an array of arrays looking something like:
		// [ [text], [text, text, text], [text, text, text], [text], [text, text, text], [text], [text] ]

		// that we'll end up interpreting (based on our above assumptions) when we parse as:
		// [ [ing*], [ing, ing, ing], [ing, ing, ing], [instr], [ing, ing, ing], [instr], [instr] ]

		for (let line in lines) {
			const block = lines[line];

			// we'll always assume the first line is an ingredient regardless of block length
			if (parseInt(line, 10) === 0) {
				let blockIndex = 0;
				for (let i in block) {
					ingredients.push({
						block: parseInt(line, 10),
						line: blockIndex,
						reference: block[i],
						isParsed: false
					});
					blockIndex++;
				}
			}
			// if there's only a single line in our block, we'll assume its an instruction
			else if (block.length === 1) {
				instructions.push({
					block: parseInt(line, 10),
					line: 0,
					reference: block[0]
				});
			}
			// otherwise if we have multiple lines in our block, we'll assume its an ingredient
			else {
				let blockIndex = 0;
				for (let i in block) {
					ingredients.push({
						block: parseInt(line, 10),
						line: blockIndex,
						reference: block[i],
						isParsed: false
					});
					blockIndex++;
				}
			}
		}
*/

		return [ingredients, instructions];
	};

	parseContent = (dom) => {
		let { recipe } = this.state;
		console.log({ dom });

		const parsed = this.parseNoteContent(dom, '123');
		console.warn({ parsed });
	}

	render() {
		const { defaultValue, isEditMode, loading, onChange, placeholder, value } = this.props;
		const { recipe, output } = this.state;

		let inputValue = (isEditMode && (value !== undefined)) ? value : defaultValue;
		inputValue = (!inputValue) ? '' : inputValue;

		// eslint-disable-next-line
		console.log({ recipe, output, inputValue });

		return (
			<ParserInputStyles>
				<Left>
					{/* <textarea
						ref={ (el) => { this.editor = el; }}
						aria-busy={ loading }
						autoComplete="off"
						onChange={ e => onChange(e) }
						placeholder={ placeholder }
						type="text"
						value={ inputValue }
					/> */}
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
	loading: false,
	onChange: '',
	placeholder: '',
	value: '',
};

ParserInput.propTypes = {
	defaultValue: PropTypes.string,
	isEditMode: PropTypes.bool,
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	placeholder: PropTypes.string,
	value: PropTypes.string,
};

export default ParserInput;
