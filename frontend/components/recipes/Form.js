import { withApollo } from 'react-apollo';
import { Component } from 'react';
import { darken } from 'polished';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import uuid from 'uuid';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/pro-regular-svg-icons';

import { deepCopy, hasProperty } from '../../lib/util';
import Button from '../form/Button';
import Image from '../form/Image';
import Input from '../form/Input';
import List from '../form/List';
import ParserInput from '../form/ParserInput';
import { GET_ALL_RECIPES_QUERY, GET_RECIPES_COUNT_QUERY } from '../../lib/apollo/queries';
import { CREATE_RECIPE_MUTATION, UPDATE_RECIPE_MUTATION } from '../../lib/apollo/mutations';

const FormStyles = styled.form`
	flex-basis: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;

	button {
		border: 0;
		background: transparent;
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
	}

	fieldset {
		margin-bottom: 10px;
	}

	fieldset input {
	 	border-bottom: 0;
	}

	@media (min-width: ${ props => props.theme.desktopCardWidth }) {
		fieldset {
			margin-bottom: 6px;
		}
	}

	/* add new recipe form styles */
	&.add {
		.save {
			position: relative;
			bottom: 20px;
			margin-top: 20px;
		}
	}
`;

const TopFormStyles = styled.div`
	fieldset.plural {
		height: 20px;
	}

	@media (min-width: ${ props => props.theme.desktopCardWidth }) {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;

		.left {
			flex-grow: 1;
		}

		.right {
			text-align: right;
			flex-shrink: 2;
		}
	}
`;

const Left = styled.div`
	flex: 1;
`;

const Right = styled.div`
	flex: 1;
`;

const MiddleFormStyles = styled.div`
	@media (min-width: ${ props => props.theme.desktopCardWidth }) {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;

		/* TEMP - go back and look and what's causing the differences between these svg icons here and in the create component */
		button.add {
			top: -1px;
		}

		.right {
			flex: 1;

			ul.list {
				max-height: 108px;
				overflow-y: scroll;
			}
		}

		.left {
			flex: 1;
		}
	}
`;

const BottomFormStyles = styled.div`
	margin-top: auto; /* stick to the bottom of the card */

	.warnings {
		flex-basis: 100%;
		text-align: right;
		font-size: .875em;
		color: ${ props => props.theme.red };
		list-style-type: none;
		margin: 0;
		padding: 0;
	}

	.right {
		margin-top: auto;
	}

	button.edit {
		border: 0;
		background: transparent;
		cursor: pointer;
		color: ${ props => props.theme.highlight };
		font-weight: 600;
		font-size: 14px;

	 	svg {
			margin-right: 8px;
			height: 14px;
		}
	}

	button.cancel {
		color: #ccc;
		font-weight: 400;
		margin-right: 10px;
	}

	button.save {
		background: ${ props => props.theme.altGreen };
		color: white;
		border-radius: 5px;
		padding: 4px 10px;

		&:hover {
			background: ${ props => darken(0.1, props.theme.altGreen) };
		}
	}

	button.merge {
		color: ${ props => props.theme.highlight };
	}

	button.parent {
		color: ${ props => props.theme.orange };
	}

	button.parsingError {
		color: tomato;
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: flex-start;

		button {
			margin-bottom: 6px;

			svg {
				margin-right: 10px;
			}
		}
	}

	@media (min-width: ${ props => props.theme.desktopCardWidth }) {
		display: flex;
		justify-content: flex-end;

		.left {
			flex: 1;
		}

		.right {
			flex: 1;
			text-align: right;
			flex-grow: 2;
		}

		.save {
			margin-left: 20px;
		}
	}
`;
class Form extends Component {
	initialState = {
		pending: {},
		warnings: [],
	};

	state = this.initialState;

	componentDidUpdate() {
		const { isFormReset, resetForm } = this.props;
		if (isFormReset) {
			// eslint-disable-next-line
			this.setState(this.initialState, resetForm);
		}
	}

	getNetworkRecipe = () => {
		const recipe = this.getPendingRecipe();
		const { pending } = this.state;
		const data = {};

		// evernoteGUID: String
		data.evernoteGUID = recipe.evernoteGUID;

		// title: String! || String
		data.title = recipe.title;

		// source: String
		data.source = recipe.source;

		// categories: CategoryCreateManyInput || CategoryUpdateManyInput
		if (recipe.categories) {
			data.categories = {
				create: [],
				connect: [],
				disconnect: [],
			};
			recipe.categories.forEach((r) => {
				if (r.id) {
					data.categories.connect.push({ ...r });
				} else {
					data.categories.create.push({ name: r.name });
				}
			});

			if (pending.categoriesDisconnect) {
				pending.categoriesDisconnect.forEach((r) => {
					data.categories.disconnect.push({ ...r });
				});
			}

			if (data.categories.create.length === 0) delete data.categories.create;
			if (data.categories.connect.length === 0) delete data.categories.connect;
			if (data.categories.disconnect.length === 0) delete data.categories.disconnect;
		}

		// tags: TagCreateManyInput || TagUpdateManyInput
		if (recipe.tags) {
			data.tags = {
				create: [],
				connect: [],
				disconnect: [],
			};
			recipe.tags.forEach((r) => {
				if (r.id) {
					data.tags.connect.push({ ...r });
				} else {
					data.tags.create.push({ name: r.name });
				}
			});

			if (pending.tagsDisconnect) {
				pending.tagsDisconnect.forEach((r) => {
					data.tags.disconnect.push({ ...r });
				});
			}

			if (data.tags.create.length === 0) delete data.tags.create;
			if (data.tags.connect.length === 0) delete data.tags.connect;
			if (data.tags.disconnect.length === 0) delete data.tags.disconnect;
		}

		// image: String
		data.image = recipe.image;

		// TODO ingredients: RecipeIngredientCreateManyInput || RecipeIngredientUpdateManyInput
		if (recipe.ingredients) {
			data.ingredients = {
				create: [],
				delete: [],
			};
			recipe.ingredients.forEach((r) => {
				data.ingredients.create.push({ ...r });
				// TODO check this shape
			});

			if (pending.ingredientsDelete) {
				pending.ingredientsDelete.forEach((r) => {
					data.ingredients.delete.push({ ...r });
				});
			}

			if (data.ingredients.create.length === 0) delete data.ingredients.create;
			if (data.ingredients.delete.length === 0) delete data.ingredients.delete;
		}

		// TODO instructions: RecipeInstructionCreateManyInput || RecipeInstructionUpdateManyInput
		if (recipe.instructions) {
			data.instructions = {
				create: [],
				delete: [],
			};
			recipe.instructions.forEach((r) => {
				data.instructions.create.push({ ...r });
			});

			if (pending.instructionsDelete) {
				pending.instructionsDelete.forEach((r) => {
					data.instructions.delete.push({ ...r });
				});
			}

			if (data.instructions.create.length === 0) delete data.instructions.create;
			if (data.instructions.delete.length === 0) delete data.instructions.delete;
		}

		return data;
	}

	getPendingRecipe = () => {
		const { pending } = this.state;
		const {
			evernoteGUID,
			id,
			image,
			source,
			title,
			tags,
			categories,
			instructions,
		} = this.props;

		const rp = {
			evernoteGUID: pending.evernoteGUID || evernoteGUID,
			id,
			image: pending.image || image,
			source: pending.source || source,
			title: pending.title || title,
			categories: deepCopy(categories),
			tags: deepCopy(tags),
			instructions: deepCopy(instructions),
		};

		//  TODO move these into utility functions
		// connect any new categories
		if (hasProperty(pending, 'categoriesConnect')) {
			pending.categoriesConnect.forEach((c) => {
				if (!~rp.categories.indexOf(c)) {
					rp.categories.push({ ...c });
				}
			});
		}

		// disconnect any disconnected categories
		if (hasProperty(pending, 'categoriesDisconnect')) {
			pending.categoriesDisconnect.forEach((d) => {
				const index = rp.categories.findIndex(item => item.name === d.name);
				if (index !== -1) { rp.categories.splice(index, 1); }
			});
		}

		// connect any new tags
		if (hasProperty(pending, 'tagsConnect')) {
			pending.tagsConnect.forEach((c) => {
				if (!~rp.tags.indexOf(c)) {
					rp.tags.push({ ...c });
				}
			});
		}

		// disconnect any disconnected tags
		if (hasProperty(pending, 'tagsDisconnect')) {
			pending.tagsDisconnect.forEach((d) => {
				const index = rp.tags.findIndex(item => item.name === d.name);
				if (index !== -1) { rp.tags.splice(index, 1); }
			});
		}

		// connect any new ingredients
		if (hasProperty(pending, 'ingredientsConnect')) {
			pending.ingredientsConnect.forEach((c) => {
				if (!~rp.ingredients.indexOf(c)) {
					rp.ingredients.push({ ...c });
				}
			});
		}

		// disconnect any disconnected ingredients
		if (hasProperty(pending, 'ingredientsDisconnect')) {
			pending.ingredientsDisconnect.forEach((d) => {
				const index = rp.ingredients.findIndex(item => item.id === d.id);
				if (index !== -1) { rp.ingredients.splice(index, 1); }
			});
		}

		// connect any new instructions
		if (hasProperty(pending, 'instructionsConnect')) {
			pending.instructionsConnect.forEach((c) => {
				if (!~rp.instructions.indexOf(c)) {
					rp.instructions.push({ ...c });
				}
			});
		}

		// disconnect any disconnected instructions
		if (hasProperty(pending, 'instructionsDisconnect')) {
			pending.instructionsDisconnect.forEach((d) => {
				const index = rp.instructions.findIndex(item => item.id === d.id);
				if (index !== -1) { rp.instructions.splice(index, 1); }
			});
		}

		return rp;
	}

	getWarning = (fieldName, warnings) => {
		let fieldNameWarnings = null;

		if (warnings && warnings.length > 0) {
			const warn = [ ...warnings ];
			fieldNameWarnings = warn.filter(w => w.fieldName === fieldName);
			fieldNameWarnings = (fieldNameWarnings.length > 0) ? fieldNameWarnings : null;
		}

		return fieldNameWarnings;
	}

	onInputChange = (e) => {
		const { name, value } = e.target;
		const { pending } = this.state;

		this.setState({
			pending: {
				...deepCopy(pending),
				...{ [name]: value },
			},
		});
	}

	onParserInputChange = (content) => {
		const { pending } = this.state;

		this.setState({
			pending: {
				...deepCopy(pending),
				...{ content },
			},
		});
	}

	onParserComplete = (ingredients, instructions) => {
		const { pending } = this.state;

		this.setState({
			pending: {
				...deepCopy(pending),
				...{ ingredients },
				...{ instructions },
			},
		});
	}

	onListChange = (listItem, fieldName, removeListItem = false) => {
		const { pending } = this.state;
		const isRemoved = removeListItem;
		const mutationMethod = (isRemoved)
			? `${ fieldName }Disconnect`
			: `${ fieldName }Connect`;

		let pendingMutationMethod;
		if (hasProperty(pending, mutationMethod)) {
			pendingMutationMethod = [ ...pending[mutationMethod] ];
			pendingMutationMethod.push(listItem);
		} else {
			pendingMutationMethod = [ listItem ];
		}

		const data = {
			...deepCopy(pending),
			...{ [mutationMethod]: pendingMutationMethod },
		};

		this.setState({ pending: data });
	}

	onSaveRecipe = (e) => {
		e.preventDefault();
		const { id } = this.props;
		const { warnings } = this.state;

		if (warnings.filter(w => w.preventSave).length === 0) {
			if (!id || (`${ id }` === '-1')) {
				this.createRecipe();
			} else {
				this.updateRecipe();
			}
		}
	}

	createRecipe = async () => {
		const { client, onSaveCallback } = this.props;
		const { warnings } = this.state;

		const data = this.getNetworkRecipe('create');

		console.log({ data });
		// create the recipe on the server
		await client.mutate({
			refetchQueries: [
				{ query: GET_ALL_RECIPES_QUERY },
				{ query: GET_RECIPES_COUNT_QUERY },
			],
			mutation: CREATE_RECIPE_MUTATION,
			variables: { data },
		}).then((res) => {
			const { errors } = res;
			const errorWarnings = [];
			if (errors) {
				console.error({ errors });
				errorWarnings.push({
					id: uuid.v4(),
					fieldName: 'Card',
					preventSave: false,
					message: errors.message,
					value: data.title,
				});
			}

			if (res.data.createRecipe.errors && (res.data.createRecipe.errors.length > 0)) {
				console.error(res.data.createRecipe.errors);
				res.data.createRecipe.errors.forEach((error) => {
					errorWarnings.push({
						id: uuid.v4(),
						fieldName: 'Card',
						preventSave: false,
						message: error,
						value: data.title,
					});
				});
			}
			console.log(errorWarnings.length === 0);

			if (errorWarnings.length === 0) return onSaveCallback();

			return this.setState({ warnings: errorWarnings.concat(warnings) });
		});
	}

	updateRecipe = async () => {
		console.warn('[Form] updateRecipe');
		const { client, onSaveCallback } = this.props;
		const { warnings } = this.state;
		const { id } = this.props;

		const data = this.getNetworkRecipe('update');
		const where = { id };

		console.log({ data });
		// create the recipe on the server
		await client.mutate({
			refetchQueries: [
				{ query: GET_ALL_RECIPES_QUERY },
				{ query: GET_RECIPES_COUNT_QUERY },
			],
			mutation: UPDATE_RECIPE_MUTATION,
			variables: {
				data,
				where,
			},
		}).then((res) => {
			console.warn({ res });
			const { errors } = res;
			// eslint-disable-next-line
			const errorWarnings = [];
			if (errors) {
				console.error({ errors });
				errorWarnings.push({
					id: uuid.v4(),
					fieldName: 'Card',
					preventSave: false,
					message: errors.message,
					value: data.name,
				});
			}

			if (res.data.updateRecipe.errors && (res.data.updateRecipe.errors.length > 0)) {
				console.error(res.data.updateRecipe.errors);
				res.data.updateRecipe.errors.forEach((error) => {
					errorWarnings.push({
						id: uuid.v4(),
						fieldName: 'Card',
						preventSave: false,
						message: error,
						value: data.name,
					});
				});
			}
			console.log(errorWarnings.length === 0);

			if (errorWarnings.length === 0) return onSaveCallback();

			return this.setState({ warnings: errorWarnings.concat(warnings) });
		});
	}

	render() {
		const {
			categories, className, evernoteGUID, image, isEditMode, loading,
			onCancelClick, onEditClick, saveLabel, showCancelButton, source, tags, title,
		} = this.props;
		const { warnings } = this.state;
		const pending = this.getPendingRecipe();

		return (
			<FormStyles className={ className }>
				<TopFormStyles>
					<Left>
						{/* Title */}
						<Input
							className="title"
							defaultValue={ title }
							fieldName="title"
							isEditMode={ isEditMode }
							isRequiredField
							loading={ loading }
							onChange={ this.onInputChange }
							placeholder="title"
							suppressLocalWarnings
							value={ pending.title }
							warnings={ this.getWarning('title', warnings) || undefined }
						/>

						{/* Source */}
						<Input
							className="source"
							defaultValue={ source }
							fieldName="source"
							isEditMode={ isEditMode }
							isRequiredField
							loading={ loading }
							onChange={ this.onInputChange }
							placeholder="source"
							suppressLocalWarnings
							value={ pending.source }
							warnings={ this.getWarning('source', warnings) || undefined }
						/>

						{/* TODO Image Upload */}
						<Input
							className="image"
							defaultValue={ image }
							fieldName="image"
							isEditMode={ isEditMode }
							isRequiredField
							loading={ loading }
							onChange={ this.onInputChange }
							placeholder="image"
							suppressLocalWarnings
							value={ pending.image }
							warnings={ this.getWarning('image', warnings) || undefined }
						/>

						{/* Evernote GUID */}
						<Input
							className="evernoteGUID"
							defaultValue={ evernoteGUID }
							fieldName="evernoteGUID"
							isEditMode={ isEditMode }
							isRequiredField
							loading={ loading }
							onChange={ this.onInputChange }
							placeholder="evernote GUID"
							suppressLocalWarnings
							value={ pending.evernoteGUID }
							warnings={ this.getWarning('evernoteGUID', warnings) || undefined }
						/>

						{/* Categories */}
						<List
							className="categories"
							defaultValues={ categories }
							fieldName="categories"
							isEditMode={ isEditMode }
							isRemovable
							isSuggestionEnabled
							label="Categories"
							loading={ loading }
							onListChange={ this.onListChange }
							placeholder="category name"
							suppressLocalWarnings
							values={ pending.categories }
						/>

						{/* Tags */}
						<List
							className="tags"
							defaultValues={ tags }
							fieldName="tags"
							isEditMode={ isEditMode }
							isRemovable
							isSuggestionEnabled
							label="Tags"
							loading={ loading }
							onListChange={ this.onListChange }
							placeholder="tags"
							suppressLocalWarnings
							values={ pending.tags }
						/>
					</Left>

					<Right>
						{/* TODO Uploaded Image Placeholder */}
						<Image value={ pending.image } />
					</Right>
				</TopFormStyles>

				<MiddleFormStyles>
					{/* Recipe Content Editor */}
					<ParserInput
						loading={ loading }
						onChange={ this.onParserInputChange }
						onComplete={ this.onParserComplete }
						placeholder="Recipe Content"
					/>

					{/* TODO Recipe Parsed Display */}

				</MiddleFormStyles>

				<BottomFormStyles>
					{/* Warnings */
						(warnings && warnings.length > 0)
							? (
								<ul className="warnings">
									{
										warnings.map((warning, index) => (
											// eslint-disable-next-line react/no-array-index-key
											<li key={ `${ warning.id }_${ index }` }>
												{warning.message}
											</li>
										))
									}
								</ul>
							) : null
					}
					{/* Cancel Button */
						(isEditMode && showCancelButton)
							? (
								<Button
									className="cancel"
									label="Cancel"
									onClick={ e => onCancelClick(e) }
								/>
							) : null
					}

					{/* Edit / Save Button */
						(!isEditMode)
							? (
								<Button
									className="edit"
									icon={ <FontAwesomeIcon icon={ faEdit } /> }
									label="Edit"
									onClick={ e => onEditClick(e) }
								/>
							) : (
								<Button
									className="save"
									label={ saveLabel }
									onClick={ e => this.onSaveRecipe(e) }
								/>
							)
					}
				</BottomFormStyles>
			</FormStyles>
		);
	}
}

Form.defaultProps = {
	categories: [],
	className: '',
	content: '',
	evernoteGUID: null,
	id: '-1',
	image: '',
	ingredients: [],
	instructions: [],
	isEditMode: true,
	isFormReset: false,
	loading: false,
	onCancelClick: () => {},
	onEditClick: () => {},
	onSaveCallback: () => {},
	resetForm: () => {},
	saveLabel: 'Save',
	showCancelButton: false,
	source: null,
	title: null,
	tags: [],
};

Form.propTypes = {
	categories: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		evernoteGUID: PropTypes.string,
		name: PropTypes.string.isRequired,
	})),
	className: PropTypes.string,
	client: PropTypes.shape({
		readQuery: PropTypes.func,
		query: PropTypes.func,
		mutate: PropTypes.func,
	}).isRequired,
	content: PropTypes.string,
	evernoteGUID: PropTypes.string,
	id: PropTypes.string,
	image: PropTypes.string,
	ingredients: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		blockIndex: PropTypes.number,
		lineIndex: PropTypes.number,
		reference: PropTypes.string.isRequired,
		isParsed: PropTypes.bool,
		parsed: PropTypes.shape({
			id: PropTypes.string,
			rule: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
			value: PropTypes.string.isRequired,
			ingredient: PropTypes.shape({
				id: PropTypes.string,
				name: PropTypes.string.isRequired,
			}),
		}),
	})),
	instructions: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		blockIndex: PropTypes.number,
		reference: PropTypes.string.isRequired,
	})),
	isEditMode: PropTypes.bool,
	isFormReset: PropTypes.bool,
	loading: PropTypes.bool,
	onCancelClick: PropTypes.func,
	onEditClick: PropTypes.func,
	onSaveCallback: PropTypes.func,
	resetForm: PropTypes.func,
	saveLabel: PropTypes.string,
	showCancelButton: PropTypes.bool,
	source: PropTypes.string,
	title: PropTypes.bool,
	tags: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		evernoteGUID: PropTypes.string,
		name: PropTypes.string.isRequired,
	})),
};

export default withApollo(Form);
