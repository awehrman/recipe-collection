import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Form from './Form';

const RecipeStyles = styled.div`
	background: rgba(0,0,0,.5);
	position: absolute;
	top: 100px;
	bottom: 0;
	left: 44px;
	right: 84px;
	display: flex;
	justify-content: center;
	align-items: flex-start;
`;

const FormStyles = styled.div`
	background: white;
	opacity: 1;
	margin: 0 auto;
	padding: 20px 40px;
	width: 75%;
`;

class Recipe extends React.PureComponent {
	render() {
		const { onCloseClick, recipe } = this.props;
		return (
			<RecipeStyles>
				<FormStyles>
					<Form
						className="recipe"
						key="current-recipe"
						saveLabel="Save"
						evernoteGUID={ recipe.evernoteGUID }
						id={ recipe.id }
						image={ recipe.image }
						ingredients={ recipe.ingredients }
						instructions={ recipe.instructions }
						isEditMode={ false }
						isFormReset={ false }
						loading={ false }
						onCloseClick={ onCloseClick }
						showCancelButton
						showCloseButton
						source={ recipe.source }
						title={ recipe.title }
					/>
				</FormStyles>
			</RecipeStyles>
		);
	}
}

Recipe.defaultProps = {
	onCloseClick: () => {},
	recipe: null,
};

Recipe.propTypes = {
	onCloseClick: PropTypes.func,
	recipe: PropTypes.shape({
		id: PropTypes.string,
		evernoteGUID: PropTypes.string,
		title: PropTypes.string,
		image: PropTypes.string,
		source: PropTypes.string,
		ingredients: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.string,
			blockIndex: PropTypes.number,
			lineIndex: PropTypes.number,
			reference: PropTypes.string.isRequired,
			isParsed: PropTypes.bool,
			/* TODO something is off between the AddNew use of this data and what we get back
			parsed: PropTypes.arrayOf(
				PropTypes.shape({
					id: PropTypes.string,
					rule: PropTypes.string,
					type: PropTypes.string.isRequired,
					value: PropTypes.string.isRequired,
					ingredient: PropTypes.shape({
						id: PropTypes.string,
						name: PropTypes.string.isRequired,
					}),
				}),
			),
			*/
		})),
		instructions: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.string,
			blockIndex: PropTypes.number,
			reference: PropTypes.string.isRequired,
		})),
	}),
};

export default Recipe;
