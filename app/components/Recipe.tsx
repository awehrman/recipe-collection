import React from "react";
import Router from "next/router";

export type RecipeProps = {
  id: number;
};

const Recipe: React.FC<{ Recipe: RecipeProps }> = ({ Recipe }) => {
  return (
    <div onClick={() => Router.push("/p/[id]", `/p/${Recipe.id}`)}>
      recipe
    </div>
  );
};

export default Recipe;
