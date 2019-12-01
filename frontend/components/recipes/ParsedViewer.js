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

	&.left {
		display: flex;
		flex-wrap: wrap;
		margin-top: 20px;

		hr {
			flex-basis: 50%;
		}

		div {
			flex-basis: 50%;
		}
	}
`;

const Ingredients = styled.div`
	.parsed {
		span {
			margin-right: 4px;

			&.ingredient {
				font-weight: 900;
				color: orange;

				&.valid {
					color: #222;
				}

				&.invalid {
					color: ${ (props) => props.theme.altGreen };
				}
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

const ParsedViewer = ({ className, id, ingredients, instructions }) => {
	const blocks = [ ...new Set(ingredients.map((i) => i.blockIndex)) ];

	return (
		<ParsedViewerStyles className={ className }>
			<Ingredients>
				{
					((className !== 'recipe') && (ingredients && (ingredients.length > 0) && (className !== 'left')))
						? <hr />
						: null
				}
				<ul className="ingredients">
					{
						blocks.map((blockIndex) => (
							<li key={ `block_${ blockIndex }` } className="block">
								<ul className="blocks">
									{
										ingredients.filter((i) => i.blockIndex === blockIndex)
											.map((i) => (
												<li key={ `parsed_ingredient_${ i.blockIndex }_${ i.lineIndex }` }>
													{
														i.isParsed
															? (
																<span className="parsed">
																	{
																		i.parsed.map((v, index) => {
																			let ingClassName = '';
																			if (v.ingredient) {
																				ingClassName = (v.ingredient.isValidated) ? ' valid' : ' invalid';
																			}
																			return (
																				<span
																					className={ `${ v.type } ${ ingClassName }` }
																					// eslint-disable-next-line
																					key={ `${ index }${ id }_${ i.blockIndex }_${ i.lineIndex }_${ v.value }` }
																				>
																					{ v.value }
																				</span>
																			);
																		})
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
			<Instructions>
				{
					(instructions && (instructions.length > 0) && (className !== 'left'))
						? <hr />
						: null
				}
				<ul className="instructions">
					{
						instructions.map((i) => (
							<li key={ `parsed_instruction_${ i.blockIndex }` }>
								{ i.reference }
							</li>
						))
					}
				</ul>
			</Instructions>
		</ParsedViewerStyles>
	);
};

ParsedViewer.defaultProps = {
	className: '',
	id: '0',
	ingredients: [],
	instructions: [],
};

ParsedViewer.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string,
	ingredients: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		blockIndex: PropTypes.number,
		lineIndex: PropTypes.number,
		reference: PropTypes.string.isRequired,
		isParsed: PropTypes.bool,
		parsed: PropTypes.arrayOf(
			PropTypes.shape({
				id: PropTypes.string,
				rule: PropTypes.string,
				type: PropTypes.string.isRequired,
				value: PropTypes.string.isRequired,
				ingredient: PropTypes.shape({
					id: PropTypes.string,
					name: PropTypes.string.isRequired,
				}),
			}),
		),
	})),
	instructions: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		blockIndex: PropTypes.number,
		reference: PropTypes.string.isRequired,
	})),
};

export default ParsedViewer;
