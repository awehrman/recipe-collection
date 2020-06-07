import React, { useState } from 'react';
import PropTypes from 'prop-types';
import pure from 'recompose/pure';
import styled from 'styled-components';

import { withApollo } from '../../lib/apollo';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import Content from './Content';
import ParserEditor from './ParserEditor';

const Note = ({ note }) => {
	const [ isHTMLDisplayed, setHTMLDisplay ] = useState(false);

	function showHTML(e) {
		e.preventDefault();
		setHTMLDisplay(!isHTMLDisplayed);
	}

	return (
		<NoteStyles>
			{/* Title */}
			{
				(!note.title)
					? <ProgressBar />
					: <h2>{ note.title }</h2>
			}

			{/* View HTML */}
			{
				(!note.isParsed && note.content && !note.ingredients.length)
					? (
						<Button
							className="viewHTML"
							label="View Contents"
							onClick={ showHTML }
						/>
					)
					: null
			}

			{
				(!note.isParsed && isHTMLDisplayed && !note.ingredients.length)
					? <Content content={ note.content } />
					: null
			}

			{/* Parsed Note Editor */}
			{
				(note.isParsed && ((note.ingredients.length > 1) || ((note.instructions.length > 1))))
					? (
						<ParserEditor
							id={ note.id }
							ingredients={ note.ingredients }
							instructions={ note.instructions }
						/>
					)
					: null
			}
		</NoteStyles>
	);
};

Note.whyDidYouRender = true;

Note.defaultProps = {
	note: {
		title: null,
		content: null,
		ingredients: [],
		instructions: [],
		isParsed: false,
	},
};

Note.propTypes = {
	note: PropTypes.shape({
		title: PropTypes.string,
		content: PropTypes.string,
		ingredients: PropTypes.array,
		instructions: PropTypes.array,
		isParsed: PropTypes.bool,
	}),
};

export default withApollo({ ssr: true })(pure(Note));

const NoteStyles = styled.div`
	background: ${ (props) => props.theme.headerBackground };
	padding: 24px;
	margin: 20px 0;
	max-width: 850px;
	border-radius: 5px;
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;

	h2 {
		font-weight: normal;
		font-size: 18px;
		font-weight: 300;
		margin: 0;
	}

	button.viewHTML {
		pointer: cursor;
		border: 0;
		background: transparent;
		width: auto;
		font-size: 14px;
		color: ${ (props) => props.theme.altGreen };
		font-weight: 600;
		display: flex;
	}
`;
