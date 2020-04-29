import PropTypes from 'prop-types';
import styled from 'styled-components';
import ButtonLink from '../_form/ButtonLink';

const Cell = styled.div`
	font-size: 14px;
	margin-bottom: 30px;
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;

	h2 {
		margin-top: 0;
		margin-bottom: 10px;
		font-weight: 600;
	}

	.more {
		color: ${ (props) => props.theme.highlight };
		text-decoration: none;
		font-weight: 600;
		border: 0;
		background: none;
		align-self: flex-end;
		margin: 10px 0;
	}

	ul li {
		margin-bottom: 2px;
	}

	@media (min-width: ${ (props) => props.theme.tablet_small }) {
		&.label {
		}

		&.column {
			ul {
				column-count: 2;
				column-gap: 10px;
			}
		}
	}
`;

const ViewMoreList = ({ href, isLinkEnabled, list, name, title, type }) => (
	<Cell className={ type }>
		{
			(list.length)
				? (
					<>
						<h2>{title}</h2>
						<ul>
							{
								list.map((item) => (
									<li key={ `${ name }_${ item.id }` }>
										{
											(type === 'label')
												? (
													<span>
														{`${ item.name }: `}
													</span>
												)
												: null
										}
										{
											(`${ item.reference }` !== 'undefined')
												? `${ item.reference }`
												: item.name
										}
									</li>
								))
							}
						</ul>
						{
							(isLinkEnabled)
								? <ButtonLink className="more" href={ href } label="View more" />
								: null
						}
					</>
				)
				: null
		}
	</Cell>
);

ViewMoreList.defaultProps = {
	href: '#',
	isLinkEnabled: false,
	list: [],
	name: '',
	type: null,
};

ViewMoreList.propTypes = {
	href: PropTypes.string,
	isLinkEnabled: PropTypes.bool,
	list: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string,
			id: PropTypes.string,
			item: PropTypes.number,
			reference: PropTypes.string,
		}),
	),
	name: PropTypes.string,
	title: PropTypes.string.isRequired,
	type: PropTypes.string,
};

export default ViewMoreList;
