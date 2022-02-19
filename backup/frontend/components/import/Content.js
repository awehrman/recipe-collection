import React from 'react';
import pretty from 'pretty';
import PropTypes from 'prop-types';
import pure from 'recompose/pure';
import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter';

import { dark } from '../../styles/dark';

const Content = ({ content }) => (
	<ContentStyles>
		<SyntaxHighlighter
			className="highlighter"
			language="html"
			style={ dark }
		>
			{ pretty(content) }
		</SyntaxHighlighter>
	</ContentStyles>
);

Content.whyDidYouRender = true;

Content.defaultProps = { content: '' };

Content.propTypes = { content: PropTypes.string };

export default pure(Content);

const ContentStyles = styled.div`
	margin-top: 10px;
	font-size: 10px;
	width: 100%;

	pre {
		white-space: pre-wrap;
	}
`;
