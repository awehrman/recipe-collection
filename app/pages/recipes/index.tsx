import React from 'react'

import Page from '../../components/page';
import useRecipes from '../../hooks/use-recipes';

type RecipesProps = {
}

const Recipes: React.FC<RecipesProps> = (props) => {
  const { recipes } = useRecipes();

  return (
    <Page title='Recipes'>
      {recipes.map((rp) => (
        <div key={`recipe_${rp.id}`}>{rp.title}</div>
      ))}
    </Page>
  );
}

export default Recipes;
