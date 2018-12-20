import React, { Component } from 'react';
import styled from 'styled-components';

const SuggestionStyles = styled.ul`
	position: absolute;
  list-style-type: none;
  margin: 0;
  padding: 0;
  height: 20px;
  overflow-y: hidden;
  margin-bottom: 20px;

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

// TODO tab thru suggestions

class Suggestions extends Component {
  render() {
  	const suggestions = [ ...this.props.suggestions ];
  	const { currentSuggestion, value } = this.props;

    return (
      <SuggestionStyles>
				{
					(value)
						? suggestions.map((s, index) =>
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

// TODO add PropTypes

export default Suggestions;