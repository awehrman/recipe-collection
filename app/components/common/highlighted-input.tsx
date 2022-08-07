import React, { useContext } from 'react';
import styled from 'styled-components';

const HighlightedInput = ({
  className = '',
  fieldName = '',
  isEditMode = false,
  loading = false,
  isRequired = false,
  isSpellCheck = false,
  value = '',
  ...props
}) => {
  const trimmedValue = value && value.replace(/ /g, '\u00a0');

  return (
    <Wrapper className={className}>
      <InputField
        aria-busy={loading}
        autoComplete="off"
        className={className}
        disabled={!isEditMode}
        id={fieldName}
        name={fieldName}
        required={isRequired}
        spellCheck={isSpellCheck}
        type="text"
        value={value}
        {...props}
      />

      <InputHighlight className={`highlight ${className}`}>
        {trimmedValue}
      </InputHighlight>
    </Wrapper>
  );
};

export default HighlightedInput;

const Wrapper = styled.div`

`;

const InputField = styled.input`
  width: 100%;
  min-width: 100%;
  padding: 4px 0;
  border-radius: 0;
  line-height: 1.2;
  color: #222;
  font-size: 1em;
  border: 0;
  outline: 0;
  font-family: 'Source Sans Pro', Verdana, sans-serif;
  margin-bottom: 5px; /* you'll want at least the height of the span border */

  background-color: transparent;
  // border-bottom: 3px solid #ddd;

  &::placeholder {
    font-style: italic;
    color: #ccc;
  }

  &.warning {
    color: tomato;
  }

  &.list {
    border-bottom: 3px solid ${({ theme }) => theme.colors.headerBackground};
  }
`;

const InputHighlight = styled.span`
  font-size: 1em;
  user-select: none;
  line-height: 1.2;
  position: absolute;
  left: 0;
  top: 27px; /* 19 (height of input) + 4x (padding) */
  height: 0;
  color: transparent;
  font-family: 'Source Sans Pro', Verdana, sans-serif;
  overflow: hidden;

  &.warning {
    border-top: 3px solid tomato;
    max-width: 100% !important;
    width: auto !important;
  }
`;
