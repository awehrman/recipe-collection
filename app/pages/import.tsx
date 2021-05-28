import React from 'react'
import { getSession } from 'next-auth/client';

import Page from '../components/Page';

type ImportProps = {
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  return {
      props: { session }
  }
}

const Import: React.FC<ImportProps> = ({ session }) => {
  console.log({ session });
  return (
    <Page title='Import'>
      There's nothing here yet!
    </Page>
  )
}

export default Import
