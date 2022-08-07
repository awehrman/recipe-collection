import React, { useContext } from 'react';
import styled from 'styled-components';

import { HighlightedInput } from '../../../../common';
import useIngredient from '../../../../../hooks/use-ingredient';
import CardContext from '../../../../../contexts/card-context';

const Name = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient, loading } = useIngredient({ id });
  const { name } = ingredient;

  function handleNameChange(event: Event) {
    const { target: { value, name } } = event;
    console.log({ value, name });
    // TODO
  }

  return (
    <Wrapper aria-busy={loading} disabled={loading}>
      <HighlightedInput
        fieldName="name"
        isEditMode={isEditMode}
        isRequired
        isSpellCheck={isEditMode}
        loading={loading}
        onChange={handleNameChange}
        placeholder="name"
        value={name}
      />
    </Wrapper>
  );
};

export default Name;

const Wrapper = styled.fieldset`
  order: 0;
`;
