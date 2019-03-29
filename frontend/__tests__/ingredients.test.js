import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';
import { ThemeProvider } from 'styled-components';

import IngredientCard, { CURRENT_INGREDIENT_QUERY } from '../components/ingredients/IngredientCard';
import { ingredients } from '../lib/testUtils'; 
import { theme } from '../components/Page';

describe('<IngredientCard/>', () => {
	it('testing sample', async () => {
		const mocks = [
			{
				request: { query: CURRENT_INGREDIENT_QUERY, variables: { id: '0' } },
				result: {
					data: {
						ingredient: ingredients()[0]
					}
				}
			},
			{
				request: { query: CURRENT_INGREDIENT_QUERY, variables: { id: '1' } },
				result: {
					data: {
						ingredient: ingredients()[1]
					}
				}
			}
		];
		const wrapper = mount(
			<ThemeProvider theme={ theme }>
				<MockedProvider mocks={ mocks }>
					<IngredientCard currentIngredientID="1" />
				</MockedProvider>
			</ThemeProvider>
		);

		// initially you'll just the loading screen
		//console.log(wrapper.debug());
		expect(wrapper.text()).toContain('Loading...');

		await wait();
		wrapper.update();
		//console.log(wrapper.debug());
		const nameInput = wrapper.find('Input[name="name"]');
		console.log(nameInput.debug());
	});
});