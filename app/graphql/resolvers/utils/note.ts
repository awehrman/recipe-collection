// @ts-nocheck
export const createNotes = async (ctx, notes) => {
	// save note data to db
	const resolveNotes = notes.map(async (note) => {
		if (!note || !note.content || !note.title) {return null;}
		const data = {
			// TODO come back to categories and tags
			content: note.content || null,
			evernoteGUID: note.evernoteGUID || null,
			image: '', // note.image || null, // TODO
			source: note.source || null,
			title: note.title || null,
		};
    console.log({ data });
		const saved = await ctx.prisma.note.create({ data })
			.catch((err) => console.log(err));

		return {
			__typename: 'Note',
      ...saved,
		};
	}).filter((n) => n);

	const noteRes = await Promise.all(resolveNotes)
		.catch((err) => console.log(err));

	return noteRes;
};
