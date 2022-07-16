import Link from 'next/link';
import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredients from '../../hooks/use-ingredients';
import ViewContext from '../../contexts/view-context';

const getNextGroup = (currentGroup: string) => {
  const GROUP_BY = [ 'name', 'property', 'count', 'relationship' ];
	const groupIndex = GROUP_BY.findIndex((g) => g === currentGroup);
	const next = (groupIndex !== (GROUP_BY.length - 1)) ? GROUP_BY[groupIndex + 1] : GROUP_BY[0];
	return next;
};

const Filters: React.FC = () => {
  const { ingredientsCount, newIngredientsCount } = useIngredients();
  const { group, view } = useContext(ViewContext);
  const linksProps = (condition: boolean) => ({
    className: condition ? 'active' : '',
    onKeyPress: (e) => e.preventDefault(),
    role: 'button',
    tabIndex: 0,
  });

  return (
    <Wrapper>
      {/* View */}
      <View>
        <Link href={{ pathname: '/ingredients', query: { view: 'all', group } }}>
          <a {...linksProps(view === 'all')}>
            {`View${'\xa0'}All${'\xa0'}${ingredientsCount}`}
          </a>
        </Link>

        <Link href={{ pathname: '/ingredients', query: { view: 'new', group } }}>
          <a {...linksProps(view === 'new')}>
            {`Newly${'\xa0'}Imported${'\xa0'}${newIngredientsCount}`}
          </a>
        </Link>
      </View>

      {/* Group By */}
      <GroupBy>
        <span>Group&nbsp;By</span>
					<Link href={ { pathname: '/ingredients', query: { view, group: getNextGroup(group) } } }>
						<a {...linksProps(false)}>
							{group.charAt(0).toUpperCase() + group.substr(1)}
						</a>
					</Link>
      </GroupBy>
    </Wrapper>
  );
};

export default Filters;

const Wrapper = styled.div`
  display: flex;
  font-size: 0.875em;
  color: #222;
`;

const GroupBy = styled.div`
  flex: 1;
  text-align: right;
  font-weight: 600;

  a {
    text-decoration: none;
    margin-left: 16px;
    text-transform: capitalize;
    color: ${({ theme }) => theme.colors.lighterGrey};
    font-size: 1em;
    padding: 0;
    cursor: pointer;
    background: white;
  }
`;

const View = styled.div`
  flex: 1;

  a {
    text-decoration: none;
    margin-right: 20px;
    color: #222;

    + .new {
      color: ${({ theme }) => theme.colors.highlight};
    }
  }

  a.active {
    font-weight: 600;
  }
`;
