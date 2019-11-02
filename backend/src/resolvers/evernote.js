export default {
	Query: {
		evernoteAuthToken: async (parent, args, ctx) => {
			console.log('evernoteAuthToken'.cyan);
			const evernoteAuthToken = null;
			const { req } = ctx;
			console.log(req.session);

			return evernoteAuthToken;
		},
	},
};
