import pretty from 'pretty';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import styled from 'styled-components';

import { NotePageProps } from './types';

const Note: React.FC<NotePageProps> = ({ note }) => {
  return (
    <Wrapper>
      {/* Title */}
      <Title>{note.title}</Title>

       {/* Content */}
       <ContentStyles>
        <SyntaxHighlighter
          className='highlighter'
          language='html'
        >
          {pretty(`${note.content}`)}
        </SyntaxHighlighter>
      </ContentStyles>
    </Wrapper>
  );
};

export default Note;

const Wrapper = styled.div`
	margin: 20px 0;
	max-width: 850px;

  background: ${({ theme }) => theme.colors.headerBackground};
	padding: 24px;
	margin: 20px 0;
	max-width: 850px;
	border-radius: 5px;
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
`;

const Title = styled.h2`
  font-weight: normal;
  font-size: 18px;
  font-weight: 300;
  margin: 0;
`;

const ContentStyles = styled.div`
	margin-top: 10px;
	font-size: 10px;
  width: 100%;

	pre {
		white-space: pre-wrap;
	}
`;
