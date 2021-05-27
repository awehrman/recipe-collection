import React from "react"
// import { GetServerSideProps } from "next"

// import prisma from '../../lib/prisma'
// import { RecipeProps } from "../../components/Recipe"
import Header from '../../components/Header';

// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
//   const recipe = await prisma.recipe.findUnique({
//     where: {
//       id: Number(params?.id) || -1,
//     },
//     include: {
//     },
//   })
//   return {
//     props: recipe,
//   }
// }

type RecipeProps = {
}


const Recipe: React.FC<RecipeProps> = () => {
  return (
    <div>
      <Header />
      <h1>Recipe Placeholder</h1>
    </div>
  )
}

export default Recipe
