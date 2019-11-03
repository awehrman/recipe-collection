import React, { PureComponent } from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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

class Suggestions extends PureComponent {
	onKeyDown = (e, suggestion) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			// this is usually only utilized by the List component
			this.onSelectSuggestion(e, suggestion);
		}
	}

	onSelectSuggestion = (e, suggestion) => {
		if (e) e.preventDefault();
		const { fieldName, onSelectSuggestion } = this.props;
		onSelectSuggestion(null, suggestion, fieldName);
	}

	render() {
		const { children, isSuggestionEnabled, suggestionQuery, type, value } = this.props;
		return (
			// eslint-disable-next-line object-curly-newline
			<Query query={ suggestionQuery } variables={ { type, value } }>
				{
					({ data }) => {
						const { suggestions = [] } = data;
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
													onClick={ (e) => this.onSelectSuggestion(e, s) }
													onKeyDown={ (e) => this.onKeyDown(e, s) }
													onMouseDown={ (e) => this.onSelectSuggestion(e, s) }
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
					}
				}
			</Query>
		);
	}
}

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

export default withApollo(Suggestions);
