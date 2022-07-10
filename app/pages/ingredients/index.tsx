import React from 'react';

import Page from '../../components/Page';
import useIngredients from '../../hooks/use-ingredients';

type IngredientsProps = {

};

const Ingredients: React.FC<IngredientsProps> = (props) => {
  const { ingredients } = useIngredients();

  return (
    <Page title='Ingredients'>
      {ingredients.map((ing) => (
        <div key={`ingredient_${ing.id}`}>{ing.name}</div>
      ))}
    </Page>
  );
};

export default Ingredients;
