import React from "react"
// import { GetServerSideProps } from "next"

// import prisma from '../../lib/prisma'
import Page from '../../components/Page';

// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
//   const recipe = await prisma.ingredient.findUnique({
//     where: {
//       id: Number(params?.id) || -1,
//     },
//     include: {
//     },
//   })
//   return {
//     props: ingredient,
//   }
// }

type IngredientProps = {
}

const Ingredient: React.FC<IngredientProps> = () => {
  return (
    <Page title='Ingredient'>
      There's nothing here yet!
    </Page>
  )
}

export default Ingredient
