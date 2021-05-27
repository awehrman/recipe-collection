import React from 'react'
// import { GetStaticProps } from 'next'

// import prisma from '../lib/prisma'
import Header from '../components/Header'

// export const getStaticProps: GetStaticProps = async () => {
//   const feed = await prisma.post.findMany({
//     where: { published: true },
//     include: {
//       author: {
//         select: { name: true },
//       },
//     },
//   })
//   return { props: { feed } }
// }

type Props = {
}

const Dashboard: React.FC<Props> = (props) => {
  return (
    <div>
      <Header />
      Dashboard
    </div>
  )
}

export default Dashboard
