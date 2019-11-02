export default {
	Query: {
		isEvernoteAuthenticated: async (parent, args, ctx) => {
			console.log('isEvernoteAuthenticated'.cyan);
			const { req } = ctx;
			const isEvernoteAuthenticated = Boolean(req.session.authToken);
			console.log(req.session.authToken);
			return isEvernoteAuthenticated;
		},
	},
};
