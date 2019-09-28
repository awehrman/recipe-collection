import React from 'react';
import { adopt } from 'react-adopt';
import { Mutation, withApollo } from 'react-apollo';
import styled from 'styled-components';
import { CREATE_INGREDIENT_MUTATION } from '../../lib/apollo/mutations';

import Button from '../form/Button';
import Form from './Form';

const AddNewStyles = styled.div`
	background: ${ props => props.theme.greenBackground };
	padding: 16px 40px 6px;
	position: fixed;
	bottom: 0;
	left: 0px;
	right: 0px;
	box-shadow: 0 0 10px 0 rgba(115, 198, 182, .2) inset;
  max-height: 60%;
  overflow-y: scroll;
	z-index: 600;

	*:focus {
		/* for whatever reason its not picking up a passed props.theme value here */
		outline: 2px dotted ${ props => props.theme.altGreen };
	}

	.add-new-btn {
		margin-bottom: 16px;

		&:focus {
			position: relative;
			padding: 4px;
			left: -4px;
			top: -4px;
			margin-bottom: 8px !important; /* 16px - whatever your padding is (8px) */
		}
	}

	&.slide {
		height: 50px;
		transition: all .3s ease;
	}

	&.slide_expanded {
		transition: all .3s ease;
	}

	button {
		cursor: pointer;
		border: 0;
		background: transparent;
		color: ${ props => props.theme.altGreen };
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 10px;
		padding: 0;

		.fa-plus {
			height: 18px;
			margin-right: 10px;
		}
	}

	@media (min-width: ${ props => props.theme.tablet }) {
		left: 40px;
	}
`;

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	createIngredient: ({ render }) => (
		<Mutation mutation={ CREATE_INGREDIENT_MUTATION }>
			{ render }
		</Mutation>
	),
});


class AddNew extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = { isExpanded: true };
	}

	onCreateIngredient = (e, ingredient, createIngredient) => {
		console.warn('[AddNew] onCreateIngredient');
		console.log(createIngredient);
		e.preventDefault();
		const {
			parentID,
			parentName,
			name,
			plural,
			properties,
			alternateNames,
			relatedIngredients,
			substitutes,
			references,
			isComposedIngredient,
		} = ingredient;

		delete properties.__typename;
		console.log({ alternateNames: alternateNames.map(n => n.name) });

		createIngredient({
			variables: {
				parentID,
				parentName,
				name,
				plural,
				properties,
				alternateNames: alternateNames.map(n => n.name),
				relatedIngredients,
				substitutes,
				references,
				isValidated: true,
				isComposedIngredient,
			},
		});
	}

	onToggleAddNew = (e) => {
		e.preventDefault();
		const { isExpanded } = this.state;

		this.setState({ isExpanded: !isExpanded });
	}

	render() {
		console.warn('[AddNew] render');
		const { isExpanded } = this.state;

		return (
			<Composed>
				{
					({ createIngredient }) => (
						<AddNewStyles className={ `slide${ isExpanded ? '_expanded' : '' }` }>
							<Button
								className="add-new-btn"
								isEditMode
								label="Add New Ingredient"
								onClick={ e => this.onToggleAddNew(e) }
							/>
							{
								(isExpanded)
									? (
										<Form
											className="add"
											key="add-new"
											onSaveIngredient={ this.onCreateIngredient }
											saveLabel="Add"
											saveMutation={ createIngredient }
										/>
									)
									: null
							}
						</AddNewStyles>
					)
				}
			</Composed>
		);
	}
}

export default withApollo(AddNew);
