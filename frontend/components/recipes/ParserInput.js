import Editor from 'react-pell';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button from '../form/Button';
import { parseHTML } from '../../lib/parser';

const ParserInputStyles = styled.div`
	display: flex;
	width: 100%;
	flex-direction: column;
`;

const EditorStyles = styled.div`
	flex: 1;

	.pell-actionbar {
		display: none;
	}

	.pell-content {
		flex: 1;
		height: 100%;
		min-height: 300px;
		border: 0;
		padding: 10px;
		font-size: 12px;
		width: 90%;
		background: white;
		width: 100%;
	}
`;

const ParseButtonStyles = styled.div`
	flex: 1;
	margin: 0;
	padding: 0;

	button {
		background: ${ (props) => props.theme.highlight } !important;
		color: white !important;
		text-transform: uppercase;
		font-weight: 900;
		text-align: center;
		padding: 6px 0 !important;
		margin-top: 10px !important;
		margin-bottom: 0 !important;
		width: 100%;
		height: 100%;
	}
`;

class ParserInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = { domContent: '' };
	}

	onChange = (domContent) => {
		const { onChange } = this.props;

		const parsed = new DOMParser().parseFromString(domContent, 'text/html');
		const children = (parsed.body.children && (parsed.body.children.length > 0))
			? [ ...parsed.body.children ]
			: [ ...new DOMParser().parseFromString(`<div>${ parsed.body.innerText }</div>`, 'text/html').body.children ];
		const domHasActualContent = children
			.filter((c) => c && c.innerText && (c.innerText.length > 0))
			.map((c) => c.innerText).length > 0;

		const dom = domHasActualContent ? domContent : '';
		this.setState({ domContent: dom }, () => onChange(dom));
	}

	parseContent = (e) => {
		e.preventDefault();
		const { onComplete } = this.props;
		const { domContent } = this.state;

		let ingredientLines = [];
		let instructions = [];

		if (domContent) {
			[ ingredientLines, instructions ] = parseHTML(domContent);
		}

		onComplete(ingredientLines, instructions);
	};

	render() {
		const { domContent } = this.state;

		return (
			<ParserInputStyles>
				<EditorStyles>
					<Editor
						actions={ [] }
						defaultContent={ domContent }
						onChange={ this.onChange }
					/>
				</EditorStyles>
				<ParseButtonStyles>
					<Button
						label="Parse"
						onClick={ (e) => this.parseContent(e) }
						type="button"
					/>
				</ParseButtonStyles>
			</ParserInputStyles>
		);
	}
}

ParserInput.defaultProps = {};

ParserInput.propTypes = {
	onChange: PropTypes.func.isRequired,
	onComplete: PropTypes.func.isRequired,
};

export default ParserInput;
