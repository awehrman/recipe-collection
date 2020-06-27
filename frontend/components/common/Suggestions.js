import { useQuery } from '@apollo/react-hooks';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Suggestions = ({ children, fieldName, isSuggestionEnabled, onSelectSuggestion, suggestionQuery, type, value }) => {
	function handleSuggestion(e, suggestion) {
		e.preventDefault();
		onSelectSuggestion('add', suggestion, fieldName);
	}
	// TODO weed out any currently used values from the suggestions pool
	/*
	function onKeyDown(e, suggestion) {
		if (e.key === 'Enter') {
			// this is usually only utilized by the List component
			handleSuggestion(e, suggestion);
		}
  }
  */

	const { data } = useQuery(suggestionQuery, {
		context: {
			value,
		},
		variables: {
			type,
			value,
		},
	});
	const { suggestions = [] } = data || {};

	return (
		<SuggestionStyles>
			{/* input element */}
			{ children }
			<ul className="suggestions">
				{
					(isSuggestionEnabled && (value.length > 0))
						? suggestions.map((s) => (
							<a
								href="#"
								id={ s.id }
								key={ s.id }
								onClick={ (e) => handleSuggestion(e, s) }
								// onKeyDown={ (e) => onKeyDown(e, s) }
								// onMouseDown={ (e) => handleSuggestion(e, s) }
								value={ s.name }
							>
								<li>{ s.name }</li>
							</a>
						))
						: null
				}
			</ul>
		</SuggestionStyles>
	);
};

Suggestions.defaultProps = {
	isSuggestionEnabled: false,
	value: '',
};

Suggestions.propTypes = {
	children: PropTypes.element.isRequired,
	fieldName: PropTypes.string.isRequired,
	isSuggestionEnabled: PropTypes.bool,
	onSelectSuggestion: PropTypes.func.isRequired,
	suggestionQuery: PropTypes.shape({}).isRequired,
	type: PropTypes.string.isRequired,
	value: PropTypes.string,
};

export default Suggestions;

const SuggestionStyles = styled.div`
	ul.suggestions {
		position: relative;
		list-style-type: none;
		margin: 2px;
		padding: 0;
		overflow-y: hidden;
		a {
			color: ${ (props) => props.theme.altGreen };
			display: inline-block;
			margin-right: 10px;
			padding-bottom: 2px;
			li {
				display: inline-block;
				padding-left: 0;
				font-size: .875em;
			}
		}
		a.active, a:active, a:focus {
			color: ${ (props) => props.theme.highlight };
			font-weight: 600;
			outline: 0;
			border-bottom: 2px solid ${ (props) => props.theme.highlight };
		}
	}
`;
