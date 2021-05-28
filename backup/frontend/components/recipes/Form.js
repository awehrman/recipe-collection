// import { Query, withApollo } from 'react-apollo';
import { Component } from 'react';
import { darken } from 'polished';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import { v4 as uuidv4 } from 'uuid';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/pro-regular-svg-icons';
import { faWindowClose } from '@fortawesome/pro-light-svg-icons';

import { deepCopy, hasProperty } from '../../lib/util';
import Button from '../common/Button';
import Image from '../common/Image';
import Input from '../common/Input';
// import List from '../common/List';
import ParserInput from './ParserInput';
import ParsedViewer from './ParsedViewer';
import { GET_SUGGESTED_CATEGORIES_QUERY, GET_SUGGESTED_TAGS_QUERY } from '../../lib/apollo/queries/suggestions';

// TODO ughhhh i hate how huge this component is...
class Form extends Component {
	initialState = {
		pending: {},
		warnings: [],
	};

	constructor(props) {
		super(props);
		this.state = this.initialState;
	}

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

		// ingredients: RecipeIngredientCreateManyInput || RecipeIngredientUpdateManyInput
		if (recipe.ingredients) {
			data.ingredients = { create: [] };
			recipe.ingredients.forEach((line) => {
				const { blockIndex, isParsed, lineIndex, parsed, reference, rule } = line;
				// RecipeIngredientCreateInput
				const ingredientLine = {
					blockIndex,
					isParsed,
					lineIndex,
					reference,
					rule,
				};

				// TODO handle multiple ingredients per line (this might require a data model update too)
				// if we parsed this line, go through its values and update the ingredient
				if (isParsed && parsed && (parsed.length > 0)) {
					ingredientLine.parsed = {
						create: parsed.map((p) => {
							if (p.type === 'ingredient') {
								if (p.ingredient && p.ingredient.id) {
									return {
										...p,
										ingredient: {
											connect: {
												id: p.ingredient.id,
												name: p.ingredient.name,
												plural: p.ingredient.plural,
											},
										},
									};
								}

								return {
									...p,
									ingredient: {
										create: {
											name: p.ingredient.name,
											plural: p.ingredient.plural,
											properties: {
												create: {
													meat: false,
													poultry: false,
													fish: false,
													dairy: false,
													soy: false,
													gluten: false,
												},
											},
										},
									},
								};
							}
							return { ...p };
						}),
					};
				}
				// create recipe ingredient lines
				data.ingredients.create.push(ingredientLine);
			});


			if (data.ingredients.create.length === 0) delete data.ingredients.create;
		}

		// instructions: RecipeInstructionCreateManyInput || RecipeInstructionUpdateManyInput
		if (recipe.instructions) {
			data.instructions = { create: [] };

			recipe.instructions.forEach((r) => {
				data.instructions.create.push({ ...r });
			});

			if (data.instructions.create.length === 0) delete data.instructions.create;
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
			ingredients,
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
			ingredients: deepCopy(ingredients),
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

		// TODO come back and clean this up, i'm just being lazy
		if (hasProperty(pending, 'categories')) {
			pending.categories.forEach((c) => {
				if (!~rp.categories.indexOf(c)) {
					rp.categories.push({ ...c });
				}
			});
		}

		// disconnect any disconnected categories
		if (hasProperty(pending, 'categoriesDisconnect')) {
			pending.categoriesDisconnect.forEach((d) => {
				const index = rp.categories.findIndex((item) => item.name === d.name);
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

		// TODO come back and clean this up, i'm just being lazy
		if (hasProperty(pending, 'tags')) {
			pending.tags.forEach((c) => {
				if (!~rp.tags.indexOf(c)) {
					rp.tags.push({ ...c });
				}
			});
		}

		// disconnect any disconnected tags
		if (hasProperty(pending, 'tagsDisconnect')) {
			pending.tagsDisconnect.forEach((d) => {
				const index = rp.tags.findIndex((item) => item.name === d.name);
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
		// TODO come back and clean this up, i'm just being lazy
		if (hasProperty(pending, 'ingredients')) {
			pending.ingredients.forEach((c) => {
				if (!~rp.ingredients.indexOf(c)) {
					rp.ingredients.push({ ...c });
				}
			});
		}

		// disconnect any disconnected ingredients
		if (hasProperty(pending, 'ingredientsDisconnect')) {
			pending.ingredientsDisconnect.forEach((d) => {
				const index = rp.ingredients.findIndex((item) => item.id === d.id);
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

		// TODO come back and clean this up, i'm just being lazy
		if (hasProperty(pending, 'instructions')) {
			pending.instructions.forEach((c) => {
				if (!~rp.instructions.indexOf(c)) {
					rp.instructions.push({ ...c });
				}
			});
		}

		// disconnect any disconnected instructions
		if (hasProperty(pending, 'instructionsDisconnect')) {
			pending.instructionsDisconnect.forEach((d) => {
				const index = rp.instructions.findIndex((item) => item.id === d.id);
				if (index !== -1) { rp.instructions.splice(index, 1); }
			});
		}

		return rp;
	}

	getWarning = (fieldName, warnings) => {
		let fieldNameWarnings = null;

		if (warnings && warnings.length > 0) {
			const warn = [ ...warnings ];
			fieldNameWarnings = warn.filter((w) => w.fieldName === fieldName);
			fieldNameWarnings = (fieldNameWarnings.length > 0) ? fieldNameWarnings : null;
		}

		return fieldNameWarnings;
	}

	lookupIngredients = async (lines) => {
		const ingredientNames = lines.filter((l) => l.isParsed && l.parsed && (l.parsed.length > 0))
			.map((l) => l.parsed.filter((p) => p.type === 'ingredient').map((p) => p.value)).flat();

		const ingredients = ingredientNames.map(async (n) => {
			// n: 'ginger'

			// TODO move this into a util file
			// determine pluralization
			let name = pluralize.isSingular(n) ? n : null;
			let plural = pluralize.isPlural(n) ? n : null;

			if (!name) {
				// attempt to pluralize the ingredient name
				try {
					name = pluralize.singular(n);
				} catch (err) {
					name = n; // just use n otherwise;
				}
			}

			if (!plural) {
				// attempt to pluralize the ingredient name
				try {
					plural = (pluralize.plural(n) !== name) ? pluralize.plural(n) : null;
				} catch (err) {
					//
				}
			}

			let ingredient = {};
			// check if this is an existing ingredient
			try {
				/*
				const { data } = await client.query({
					query: GET_INGREDIENT_QUERY,
					variables: { name },
				});
				({ ingredient } = data);
				delete ingredient.__typename;
				*/
			} catch (err) {
				// didn't find an existing ingredient
			}

			if (!ingredient) {
				ingredient = {
					isValidated: false,
					name: name.toLowerCase(),
				};

				if (plural) {
					ingredient.plural = plural.toLowerCase();
				}
			}

			return ingredient;
		});

		return Promise.all(ingredients).then((data) => data);
	}

	onImageUpload = async (e) => {
		const { files } = e.target;
		const { pending } = this.state;
		const data = new FormData();
		data.append('file', files[0]);
		data.append('upload_preset', 'rp_collection');

		const res = await fetch(process.env.REACT_APP_CLOUDINARY_API_URL, {
			method: 'POST',
			body: data,
		});

		const file = await res.json();

		this.setState({
			pending: {
				...deepCopy(pending),
				...{ image: file.secure_url },
			},
		});
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

	onParserComplete = async (ingredientLines, instructions) => {
		const { pending } = this.state;

		// lookup any ingredients identified
		await this.lookupIngredients(ingredientLines)
			.then((ingData) => {
				const ingredients = ingredientLines.map((line) => {
					if (line.isParsed && line.parsed && (line.parsed.length > 0)) {
						const parsed = line.parsed.map((p) => {
							if (p.type === 'ingredient') {
								const ing = {
									...p,
									ingredient: ingData.find((i) => (i.name === p.value) || (i.plural === p.value)),
								};
								return ing;
							}
							return { ...p };
						});

						return {
							...line,
							parsed,
						};
					}
					return { ...line };
				});

				this.setState({
					pending: {
						...deepCopy(pending),
						...{ ingredients },
						...{ instructions },
					},
				});
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

		if (warnings.filter((w) => w.preventSave).length === 0) {
			if (!id || (`${ id }` === '-1')) {
				this.createRecipe();
			} else {
				this.updateRecipe();
			}
		}
	}

	createRecipe = async () => {
		/* TODO re-wire
		const { onSaveCallback } = this.props;
		const { warnings } = this.state;

		const data = this.getNetworkRecipe('create');

		// create the recipe on the server
		await client.mutate({
			refetchQueries: [
				{ query: GET_ALL_RECIPES_QUERY },
				{ query: GET_RECIPES_COUNT_QUERY },
				{ query: GET_ALL_INGREDIENTS_QUERY },
				{ query: GET_INGREDIENTS_COUNT_QUERY },
			],
			mutation: CREATE_RECIPE_MUTATION,
			variables: { data },
		}).then((res) => {
			const { errors } = res;
			const errorWarnings = [];
			if (errors) {
				console.error({ errors });
				errorWarnings.push({
					id: uuidv4,
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
						id: uuidv4,
						fieldName: 'Card',
						preventSave: false,
						message: error,
						value: data.title,
					});
				});
			}

			if (errorWarnings.length === 0) return onSaveCallback();

			return this.setState({ warnings: errorWarnings.concat(warnings) });
		});
		*/
	}

	updateRecipe = async () => {
		/* TODO re-wire updateRecipe
		const { client, onSaveCallback } = this.props;
		const { warnings } = this.state;
		const { id } = this.props;

		const data = this.getNetworkRecipe('update');
		const where = { id };

		// create the recipe on the server
		await client.mutate({
			refetchQueries: [
				{ query: GET_ALL_RECIPES_QUERY },
				{ query: GET_RECIPES_COUNT_QUERY },
				{ query: GET_ALL_INGREDIENTS_QUERY },
				{ query: GET_INGREDIENTS_COUNT_QUERY },
			],
			mutation: UPDATE_RECIPE_MUTATION,
			variables: {
				data,
				where,
			},
		}).then((res) => {
			const { errors } = res;
			// eslint-disable-next-line
			const errorWarnings = [];
			if (errors) {
				console.error({ errors });
				errorWarnings.push({
					id: uuidv4,
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
						id: uuidv4,
						fieldName: 'Card',
						preventSave: false,
						message: error,
						value: data.name,
					});
				});
			}

			if (errorWarnings.length === 0) return onSaveCallback();

			return this.setState({ warnings: errorWarnings.concat(warnings) });
		});
		*/
	}

	render() {
		const {
			categories, className, evernoteGUID, isEditMode, loading,
			onCloseClick, onCancelClick, onEditClick, saveLabel, showCloseButton,
			showCancelButton, source, tags, title,
		} = this.props;
		const { warnings } = this.state;
		const pending = this.getPendingRecipe();

		// go ahead and fetch our lookup queries for validation even though we're not concerned with showing it
		return (
			<FormStyles className={ className }>
				<TopFormStyles>
					{
						(isEditMode)
							? (
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

									{/* TODO Image Upload
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
									/> TODO adjust input component to accept type 'file'
									<input
										type="file"
										className="image"
										defaultValue={ pending.image }
										onChange={ this.onImageUpload }
										placeholder="upload an image"
									/> */}

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

									{/* Categories
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
										suggestionQuery={ GET_SUGGESTED_CATEGORIES_QUERY }
										suppressLocalWarnings
										type="categories"
										values={ pending.categories }
									/>

									{/* Tags
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
										suggestionQuery={ GET_SUGGESTED_TAGS_QUERY }
										suppressLocalWarnings
										type="tags"
										values={ pending.tags }
									/>
								*/}
								</Left>
							) : null
					}
					<Right>
						{/* Title Preview */}
						<Title>
							{ pending.title }
						</Title>

						{/* Image Preview */}
						<Image value={ pending.image } />

						{/* Source Preview */}
						<Source>
							{pending.source}
						</Source>
					</Right>

					{
						(isEditMode)
							? (
								<Left>
									{/* Recipe Content Editor */}
									<ParserInput
										loading={ loading }
										onChange={ this.onParserInputChange }
										onComplete={ this.onParserComplete }
										placeholder="Recipe Content"
									/>
								</Left>
							) : null
					}

					<Right>
						{/* Cancel Button */
							(showCloseButton)
								? (
									<Button
										className="close"
										icon={ <FontAwesomeIcon icon={ faWindowClose } /> }
										onClick={ (e) => onCloseClick(e) }
									/>
								) : null
						}

						{/* Categories Preview */}
						<Categories>
							{
								pending.categories.map((c) => (
									<li key={ `categories_display_${ c.id }_${ pending.id }` }>
										{ c.name }
									</li>
								))
							}
						</Categories>

						{/* Tags Preview */}
						<Tags>
							{
								pending.tags.map((c) => (
									<li key={ `tags_display_${ c.id }_${ pending.id }` }>
										{ c.name }
									</li>
								))
							}
						</Tags>

						{/* Parsed Recipe Preview */}
						<ParsedViewerWrapper>
							<ParsedViewer
								className={ className }
								loading={ loading }
								ingredients={ pending.ingredients }
								instructions={ pending.instructions }
							/>
						</ParsedViewerWrapper>
					</Right>
				</TopFormStyles>

				<BottomFormStyles>
					{/* Warnings */
						(warnings && warnings.length > 0)
							? (
								<ul className="warnings">
									{
										warnings.map((warning, index) => (
											// eslint-disable-next-line react/no-array-index-key
											<li key={ `${ warning.id }_${ index }` }>
												{ warning.message }
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
									onClick={ (e) => onCancelClick(e) }
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
									onClick={ (e) => onEditClick(e) }
								/>
							) : (
								<Button
									className="save"
									label={ saveLabel }
									onClick={ (e) => this.onSaveRecipe(e) }
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
	evernoteGUID: null,
	id: '-1',
	image: '',
	ingredients: [],
	instructions: [],
	isEditMode: true,
	isFormReset: false,
	loading: false,
	onCancelClick: () => {},
	onCloseClick: () => {},
	onEditClick: () => {},
	// onSaveCallback: () => {},
	resetForm: () => {},
	saveLabel: 'Save',
	showCancelButton: false,
	showCloseButton: false,
	source: '',
	title: '',
	tags: [],
};

Form.propTypes = {
	categories: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		evernoteGUID: PropTypes.string,
		name: PropTypes.string.isRequired,
	})),
	className: PropTypes.string,
	evernoteGUID: PropTypes.string,
	id: PropTypes.string,
	image: PropTypes.string,
	ingredients: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		blockIndex: PropTypes.number,
		isParsed: PropTypes.bool,
		lineIndex: PropTypes.number,
		/*
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
		*/
		reference: PropTypes.string.isRequired,
		rule: PropTypes.string,
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
	onCloseClick: PropTypes.func,
	onEditClick: PropTypes.func,
	// onSaveCallback: PropTypes.func,
	resetForm: PropTypes.func,
	saveLabel: PropTypes.string,
	showCancelButton: PropTypes.bool,
	showCloseButton: PropTypes.bool,
	source: PropTypes.string,
	title: PropTypes.string,
	tags: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		evernoteGUID: PropTypes.string,
		name: PropTypes.string.isRequired,
	})),
};

export default Form;


const FormStyles = styled.form`
	flex-basis: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	background: white;
	opacity: 1;
	margin: 0 auto;
	padding: 20px 40px;
	width: 75%;

	button {
		border: 0;
		background: transparent;
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
	}

	button.close {
		color: ${ (props) => props.theme.lighterGrey };
		text-align: right;
		float: right;

		svg {
			height: 16px;
		}
	}

	fieldset {
		margin-bottom: 10px;
	}

	fieldset input {
		border-bottom: 0;
	}

	@media (min-width: ${ (props) => props.theme.desktopCardWidth }) {
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
	fieldset.source,
	fieldset.image,
	fieldset.evernoteGUID {
		font-size: 12px;
		margin-bottom: 0 !important;

		span#highlight {
			top: 22px !important;
		}
	}

	fieldset.title,
	input,
	fieldset.source input,
	fieldset.image input {
		color: #222 !important;
		text-overflow: ellipsis;
	}

	@media (min-width: ${ (props) => props.theme.desktopCardWidth }) {
		display: flex;
		justify-content: space-between;

		.left {
			flex-grow: 1;
		}

		.right {
			text-align: right;
			flex-shrink: 2;
		}
	}

	flex-wrap: wrap;
	justify-content: space-between;
`;

const Left = styled.div`
	flex-basis: 49%;
	justify-content: start;
	min-height: 300px;
`;

const Right = styled.div`
	flex-basis: 49%;
	justify-content: start;
	min-height: 300px;
`;

const Title = styled.h1`
	font-size: 24px;
	font-weight: 100;
	margin-top: 0;
`;

const Source = styled.div`
	font-style: italic;
	font-size: 12px;
	color: #bbb !important;
	margin-top: 4px;
	text-align: right;
`;

const Categories = styled.ul`
	list-style: none;
	display: inline-block;
	color: ${ (props) => props.theme.altGreen };
	width: 45%;
	padding: 0;
	margin: 15px 5px 0px 0;
	font-size: 14px;
`;

const Tags = styled.ul`
	margin-bottom: 8px;
	list-style: none;
	display: inline-block;
	color: white;
	width: 45%;
	margin: 15px 10px 10px 0;
	padding: 0;
	float: right;
	text-align: right;

	li {
		font-size: 12px;
		padding: 4px 10px;
		font-weight: 900;
		display: inline;
		background: ${ (props) => props.theme.altGreen };
		border-radius: 50px;
		width: 100%;
		margin-left: 5px;
	}
`;

const BottomFormStyles = styled.div`
	margin-top: auto; /* stick to the bottom of the card */

	.warnings {
		flex-basis: 100%;
		text-align: right;
		font-size: 0.875em;
		color: ${ (props) => props.theme.red };
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
		color: ${ (props) => props.theme.highlight };
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
		background: ${ (props) => props.theme.altGreen };
		color: white;
		border-radius: 5px;
		padding: 4px 10px;

		&:hover {
			background: ${ (props) => darken(0.1, props.theme.altGreen) };
		}
	}

	button.merge {
		color: ${ (props) => props.theme.highlight };
	}

	button.parent {
		color: ${ (props) => props.theme.orange };
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

	@media (min-width: ${ (props) => props.theme.desktopCardWidth }) {
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

const ParsedViewerWrapper = styled.div`
	margin-top: 54px; /* TODO ideally this would be equal to our h1 height */
`;
