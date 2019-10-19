import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ParsedViewerStyles = styled.div`
	font-size: 12px;

	hr {
		border: 0;
    height: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
		width: 50%;
		margin: 30px auto;
	}

	h1 {
		font-size: 16px;
		font-weight: normal;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
`;

const Ingredients = styled.div`
	.parsed {
		span {
			margin-right: 4px;

			&.ingredient {
				font-weight: 900;
			}
		}
	}

	.unparsed {
		color: tomato;
	}

	ul.blocks {
		margin-bottom: 10px;

		ul.ingredients {
			li {
				margin-bottom: 3px;
			}
		}
	}
`;

const Instructions = styled.div`
	margin-bottom: 10px;

	li {
		margin-bottom: 8px;
	}
`;

const ParsedViewer = ({ ingredients, instructions }) => {
	const blocks = [ ...new Set(ingredients.map(i => i.block)) ];

	return (
		<ParsedViewerStyles>
			{
				(ingredients && (ingredients.length > 0))
					? <hr />
					: null
			}
			<Ingredients>
				<ul className="ingredients">
					{
						blocks.map(block => (
							<li key={ `block_${ block }` } className="block">
								<ul className="blocks">
									{
										ingredients.filter(i => i.block === block)
											.map(i => (
												<li key={ `parsed_ingredient_${ i.block }_${ i.line }` }>
													{
														i.isParsed
															? (
																<span className="parsed">
																	{
																		i.values.map(v => (
																			<span
																				className={ v.type }
																				key={ `${ i.block }_${ i.line }_${ v.value }` }
																			>
																				{v.value}
																			</span>
																		))
																	}
																</span>
															)
															: <span className="unparsed">{ i.reference }</span>
													}
												</li>
											))
									}
								</ul>
							</li>
						))
					}
				</ul>
			</Ingredients>
			{
				(instructions && (instructions.length > 0))
					? <hr />
					: null
			}
			<Instructions>
				<ul className="instructions">
					{
						instructions.map(i => (
							<li key={ `parsed_instruction_${ i.block }` }>
								{i.reference}
							</li>
						))
					}
				</ul>
			</Instructions>
		</ParsedViewerStyles>
	);
};

ParsedViewer.defaultProps = {
	ingredients: [],
	instructions: [],
};

ParsedViewer.propTypes = {
	ingredients: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		blockIndex: PropTypes.number,
		lineIndex: PropTypes.number,
		reference: PropTypes.string.isRequired,
		isParsed: PropTypes.bool,
		parsed: PropTypes.shape({
			id: PropTypes.string,
			rule: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
			value: PropTypes.string.isRequired,
			ingredient: PropTypes.shape({
				id: PropTypes.string,
				name: PropTypes.string.isRequired,
			}),
		}),
	})),
	instructions: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		blockIndex: PropTypes.number,
		reference: PropTypes.string.isRequired,
	})),
};

export default ParsedViewer;
