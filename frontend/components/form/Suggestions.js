import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const SuggestionStyles = styled.ul`
	position: relative;
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow-y: hidden;

	a {
		color: ${ props => props.theme.altGreen };

		li {
			display: inline-block;
			padding: 4px 10px;
			padding-left: 0;
			font-size: .875em;
		}
	}

	a.active {
		color: ${ props => props.theme.highlight };
		font-weight: 600;
	}
`;

class Suggestions extends Component {
  render() {
  	const suggestions = [ ...this.props.suggestions ];
  	const { currentSuggestion, value } = this.props;

    return (
      <SuggestionStyles>
				{
					(value)
						? suggestions.map((s, index) =>
								// TODO i feel like there was a reason why i had to use onMouseDown here; but i'd really like to avoid this href="#" if possible because its litering the URL
								<a href="#"  key={ s.id } onMouseDown={ e => this.props.onSelectSuggestion(e, s) } className={ (currentSuggestion === index) ? 'active' : '' }>
									<li onClick={ e => this.props.onSelectSuggestion(e, s) }>{ s.name }</li>
								</a>
							)
						: null
				}
      </SuggestionStyles>
    );
  }
}

Suggestions.defaultProps = {
	suggestions: []
};

Suggestions.propTypes = {
	currentSuggestion: PropTypes.number,
	suggestions: PropTypes.array.isRequired,
	value: PropTypes.string,
};

export default Suggestions;