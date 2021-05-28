import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEllipsisH } from '@fortawesome/pro-light-svg-icons';

import Button from '../common/Button';

const ParsedEditor = ({ id, ingredients, instructions }) => {
	const blocks = [ ...new Set(ingredients.map((i) => i.blockIndex)) ];
	const [ isTruncated, setIsTruncated ] = useState(instructions.length > 2);
	const label = isTruncated ? 'View more' : 'View less';

	function showFullInstructions(e) {
		e.preventDefault();
		setIsTruncated(!isTruncated);
	}

	return (
		<ParsedEditorStyles>
			<Ingredients>
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
																			// if v.value starts with a comma, remove the initial space
																			// TODO extend this to a lookup of allowed punctuation characters
																			const hasComma = v.value[0] === ',' ? 'noSpace' : '';

																			return (
																				<span
																					className={ `${ v.type } ${ ingClassName } ${ hasComma }` }
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
				<ul className="instructions">
					{
						instructions.map((i, index) => {
							const lineClass = (isTruncated && (index > 2)) ? 'hidden' : 'visible';
							return (
								<li key={ `parsed_instruction_${ i.blockIndex }` } className={ lineClass }>
									{ i.reference }
								</li>
							);
						})
					}
				</ul>
				{
					(instructions.length > 2)
						? (
							<Center>
								<ShowMore
									className="showMore"
									// icon={ <FontAwesomeIcon icon={ faEllipsisH } /> }
									label={ label }
									onClick={ (e) => showFullInstructions(e) }
								/>
							</Center>
						)
						: null
				}
			</Instructions>
		</ParsedEditorStyles>
	);
};

ParsedEditor.defaultProps = {
	id: '0',
	ingredients: [],
	instructions: [],
};

ParsedEditor.propTypes = {
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

export default ParsedEditor;

const Center = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	margin-top: 20px;
	padding: 0 20px;
	height: 30px;

	&:hover {
		background: rgba(0, 0, 0, .04);
	}
`;

const ShowMore = styled(Button)`
	border: 0;
	background: transparent;
	color: ${ (props) => props.theme.altGreen };
	cursor: pointer;
	font-weight: 600;
	font-size: 14px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	font-size: 14px;
	font-weight: 400;
`;

const ParsedEditorStyles = styled.div`
	flex-basis: 100%;

	font-size: 12px;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;

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
	margin-top: 20px;

	.parsed {
		span {
			margin-left: 2px;

			&:first-of-type {
				margin-left: 0px;
			}

			&.noSpace {
				margin-left: 0px;
			}

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

		&:last-of-type {
			margin-bottom: 20px;
		}

		ul.ingredients {
			li {
				margin-bottom: 3px;
			}
		}
	}
`;

const Instructions = styled.div`

	li {
		margin-bottom: 8px;

		&.hidden {
			display: none;
		}

		&.visible {
			display: block;
		}
	}
`;
