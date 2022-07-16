import React from 'react';
import { useRouter, NextRouter } from 'next/router';
import Page from '../../components/Page';

import ViewContext from '../../contexts/view-context';
import Filters from '../../components/ingredients/filters';
import Containers from '../../components/ingredients/containers';
import AddNew from '../../components/ingredients/add-new';

const Ingredients: React.FC = () => {
  const router: NextRouter = useRouter();
  const { query: { group = 'name', view = 'all' } } = router;
  const context = { group: `${group}`, view: `${view}` };

  return (
    <Page title='Ingredients'>
      <ViewContext.Provider value={context}>
        {/* View and Group Filters */}
        <Filters />

        {/* Containers */}
        <Containers />

        {/* Add New */}
        <AddNew />
      </ViewContext.Provider>
    </Page>
  );
};

export default Ingredients;
