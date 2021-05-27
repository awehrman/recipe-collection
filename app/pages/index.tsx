import React from 'react'
// import { GetStaticProps } from 'next'

// import prisma from '../lib/prisma'
import Header from '../components/Header'
import Page from '../components/Page';

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
      <Page>
        <Header title="Dashboard" />
      </Page>
    </div>
  )
}

export default Dashboard
