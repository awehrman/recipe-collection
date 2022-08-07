import React, { useContext } from 'react';
import styled from 'styled-components';

import { HighlightedInput } from '../../../../common';
import useIngredient from '../../../../../hooks/use-ingredient';
import CardContext from '../../../../../contexts/card-context';

const Plural = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient, loading } = useIngredient({ id });
  const { plural } = ingredient;

  function handlePluralChange(event: Event) {
    const { target: { value, name } } = event;
    console.log({ value, name });
    // TODO
  }

  return (
    <Wrapper aria-busy={loading} disabled={loading}>
      <HighlightedInput
        fieldName="plural"
        isEditMode={isEditMode}
        isRequired
        isSpellCheck={isEditMode}
        loading={loading}
        onChange={handlePluralChange}
        placeholder="plural"
        value={plural}
      />
    </Wrapper>
  );
};

export default Plural;

const Wrapper = styled.fieldset`
  order: 3;
  flex-basis: 50%;
`;
