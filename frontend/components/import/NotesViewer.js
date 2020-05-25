import React from 'react';
import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter';
import pretty from 'pretty';
import pure from 'recompose/pure';

import { dark } from '../../styles/dark';
import { withApollo } from '../../lib/apollo';
import useEvernote from './useEvernote';
import ParsedViewer from '../recipes/ParsedViewer';

const NotesViewer = ({ notes }) => {
	console.log('viewer', { notes });

	return (
		<NotesViewerStyles>
			{
				(notes)
					? notes.map((n, index) => (
						// eslint-disable-next-line
						<Note key={`${index}_${n.id}`}>
							<h1>{n.title}</h1>
							{
								(n.content && !n.ingredients.length)
									? (
										<Content>
											<SyntaxHighlighter
												className="highlighter"
												language="html"
												wrapLines
												style={ dark }
											>
												{ pretty(n.content) }
											</SyntaxHighlighter>
										</Content>
									)
									: null
							}
							{
								(n.ingredients.length || n.instructions.length)
									? (
										<ParsedViewer
											className="left"
											id={ n.id }
											ingredients={ n.ingredients }
											instructions={ n.instructions }
										/>
									)
									: null
							}
						</Note>
					))
					: null
			}
		</NotesViewerStyles>
	);
};

NotesViewer.whyDidYouRender = true;

export default withApollo({ ssr: true })(pure(NotesViewer));

const NotesViewerStyles = styled.div`
	margin: 20px 0;
	max-width: 850px;
`;

const Content = styled.div`
	overflow-y: auto !important;
	overflow-x: auto !important;
	max-height: 250px;
	display: 'flex';
	font-size: 10px;
`;

const Note = styled.div`
	background: ${ (props) => props.theme.headerBackground };
	padding: 10px;
	margin-bottom: 8px;

	h1 {
		font-weight: 100;
		font-size: 16px;
		margin: 0;
		padding: 0;
	}
`;
