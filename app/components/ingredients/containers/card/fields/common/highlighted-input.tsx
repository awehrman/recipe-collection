import React, { useContext } from 'react';
import styled from 'styled-components';

import CardContext from 'contexts/card-context';

const HighlightedInput = ({
  className = '',
  fieldName = '',
  isEditMode = false,
  isRequired = false,
  isSpellCheck = false,
  loading = false,
  registerField = {},
  defaultValue = '',
  ...props
}) => {
  const { methods } = useContext(CardContext);
  const watchName = methods.watch("name", defaultValue);
  const trimmedValue = watchName?.replace(/ /g, '\u00a0');

  return (
    <Wrapper className={className}>
      <InputField
        aria-busy={loading}
        autoComplete='off'
        className={`${isEditMode ? 'editable' : ''}`}
        disabled={!isEditMode}
        defaultValue={defaultValue}
        id={fieldName}
        name={fieldName}
        required={isRequired}
        spellCheck={isSpellCheck}
        type='text'
        {...registerField}
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
  max-width: 100%;
  min-width: 90%;
`;

const InputField = styled.input`
  position: relative;
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

  &::placeholder {
    font-style: italic;
    color: #ccc;
  }

  &.warning {
    color: ${({ theme }) => theme.colors.red };
  }

  &.list {
    border-bottom: 3px solid ${({ theme }) => theme.colors.headerBackground};
  }

  &.editable {
    cursor: text;
		caret-color: #222;

    &:focus {
			/* disable the default dotted box borders since WE'RE USING SEXY UNDERLINES */
			outline: none !important;

			/* if there's no content in this field and the field has focus */
			& + span {
				border-top: 3px solid ${({ theme }) => theme.colors.inputHighlight };
				max-width: auto;
			}

			/* if there IS content in this field and the field has focus then only highlight the length of the text */
			& + span.enabled {
				border-top: 3px solid ${({ theme }) => theme.colors.altGreen };
				width: auto !important;
			}

			& + span.warning {
				border-top: 3px solid ${({ theme }) => theme.colors.red };
			}
		}
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

  &.auto-suggest {
    left: 23px;
  }
`;
