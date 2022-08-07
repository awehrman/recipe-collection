import React from "react"
// import { GetServerSideProps } from "next"

// import prisma from '../../lib/prisma'
import Page from '../../components/page';

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
    <Page title='Recipe'>
      There's nothing here yet!
    </Page>
  )
}

export default Recipe
