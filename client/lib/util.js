export default function getNextIngredientGroup(currentGroup) {
  const GROUP_BY = [ 'name', 'property', 'count', 'relationship' ];
  const groupIndex = GROUP_BY.findIndex(g => g === currentGroup);
	const next = (groupIndex !== (GROUP_BY.length - 1)) ? GROUP_BY[groupIndex + 1] : GROUP_BY[0];
	return next;
}
