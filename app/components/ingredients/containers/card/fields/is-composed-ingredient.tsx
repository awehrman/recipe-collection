import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from 'hooks/use-ingredient';
import CardContext from 'contexts/card-context';

const isComposedIngredient = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { isComposedIngredient, properties } = ingredient;

  function handleOnChange(event: Event) {
    event.preventDefault();
  }

  return (
    <Wrapper className={!isEditMode && !properties.length ? 'adjust' : ''}>
      <Checkbox className={isEditMode ? 'editable' : ''}>
        <label htmlFor="isComposedIngredient">
          <input
            type="checkbox"
            id="isComposedIngredient"
            checked={isComposedIngredient}
            name="isComposedIngredient"
            onChange={handleOnChange}
            value={isComposedIngredient}
          />
          <span>Is Composed Ingredient?</span>
        </label>
      </Checkbox>
    </Wrapper>
  );
};

export default isComposedIngredient;

const Wrapper = styled.div`
  order: 4;
  flex-basis: 50%;
  flex-grow: 2;
  text-align: right;

  &.adjust {
    order: 0;
  }
`;

// TODO dry this up between this and properties
const Checkbox = styled.div`
  display: inline-block;
  margin-right: 10px;
  color: #222;

  label {
    font-weight: 400 !important;
    position: relative;
    padding-left: 18px;

    input {
      background: tomato;
      margin-right: 8px;
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      pointer-events: none;
      opacity: 0; /* we want to hide the original input, but maintain focus state */

      &:checked + span::after {
        position: absolute;
        top: 0;
        color: ${({ theme }) => theme.colors.altGreen};
        display: block;
        font-style: normal;
        font-variant: normal;
        text-rendering: auto;
        -webkit-font-smoothing: antialiased;

        font-family: 'Font Awesome 5 Pro';
        font-weight: 900;
        content: '\f00c';
      }
    }
  }

  label::before {
    display: block;
    position: absolute;
    top: 5px;
    left: 0;
    width: 11px;
    height: 11px;
    border-radius: 3px;
    background-color: white;
    border: 1px solid #aaa;
    content: '';
  }

  &.editable > label {
    cursor: pointer;
  }

  /* apply fake focus highlighting */
  &.editable > input:focus + label::before {
    outline: ${({ theme }) => theme.colors.altGreen} auto 3px;
  }
`;
