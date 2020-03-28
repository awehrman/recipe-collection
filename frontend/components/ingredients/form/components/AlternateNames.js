import PropTypes from 'prop-types';
import React from 'react';
import List from '../../form/List';

const AlternateNames = ({}) => {
	return (
		<List
			className="alternateNames"
			defaultValues={alternateNames}
			fieldName="alternateNames"
			isEditMode={isEditMode}
			isPluralSuggestEnabled
			isRemovable
			label="Alternate Names"
			loading={loading}
			onListChange={this.onListChange}
			onSuggestPlural={this.onSuggestPlural}
			placeholder="alternate name"
			suggestionQuery={GET_SUGGESTED_INGREDIENTS_QUERY}
			suppressLocalWarnings
			warnings={this.getWarning('alternateNames', warnings) || undefined}
			validate={this.validate}
			values={pendingIngredient.alternateNames}
		/>
	);
};

AlternateNames.defaultProps = {

};

AlternateNames.propTypes = {

};

