// @ts-nocheck
export const createNotes = async (ctx, notes) => {
	const { prisma } = ctx;
	// save note data to db
	const resolveNotes = notes.map(async (note) => {
		if (!note || !note.content || !note.title) {
			throw new Error('Could not create note!');
		}
		const data = {
			// TODO come back to categories and tags
			content: note.content,
			evernoteGUID: note.evernoteGUID,
			image: note.image,
			source: note.source,
			title: note.title,
		};

		const saved = await prisma.note.create({ data })
			.catch(err => { throw err });

		return {
			__typename: 'Note',
      ...saved,
		};
	});

	const noteRes = await Promise.all(resolveNotes);
	return noteRes;
};
