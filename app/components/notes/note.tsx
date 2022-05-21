import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import pretty from 'pretty';
import styled from 'styled-components';

import { Button } from '../common';
import { NotePageProps } from './types';

type ContentProps = {
  isExpanded: boolean;
};

const Note: React.FC<NotePageProps> = ({ note }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleNoteViewClick() {
    setIsExpanded(!isExpanded);
  }

  return (
    <Wrapper>
      {/* Title */}
      <Title>{note.title}</Title>

      {/* Content */}
      <ContentStyles isExpanded={isExpanded}>
        <SyntaxHighlighter
          className='highlighter'
          language='vbscript-html'
          style={atomOneDark}
          wrapLongLines
        >
          {pretty(note.content ?? ``)}
        </SyntaxHighlighter>
      </ContentStyles>

      {/* View More/Less */}
      <StyledButton
        type='button'
        onClick={handleNoteViewClick}
        label={isExpanded ? 'View Less' : 'View More'}
      />
    </Wrapper>
  );
};

export default Note;

const StyledButton = styled(Button)`
  &&& {
    margin: 0;
    margin-top: 10px;
  }
`;

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

  position: relative;
  overflow: hidden;
`;

const Title = styled.h2`
  font-weight: normal;
  font-size: 18px;
  font-weight: 300;
  margin: 0;
`;

const ContentStyles = styled.div<ContentProps>`
  font-size: 10px;
  width: 100%;
  overflow: hidden;
  height: ${({ isExpanded }) => isExpanded ? 'unset' : '200px' };

  pre {
    white-space: pre-wrap;
  }
`;
