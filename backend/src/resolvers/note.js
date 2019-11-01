
// import { GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION, GET_ALL_INGREDIENT_FIELDS } from '../graphql/fragments';

export default {
	Query: {
		// get note from evernote
		note: async (parent, args, ctx) => {
			console.log('note');
			console.log({ ctx });
			const note = [];

			// TODO get note from evernote


			return note;
		},
		// get notes from evernote
		notes: (parent, args, ctx) => {
			console.log('notes'.red);
			const { res } = ctx;

			return res.redirect('http://localhost:3001/evernote/');

			// TODO authenticate mutation;

			// TODO attempt puppeteer example:
			/*
				const screenshot = 'github.png';
				(async () => {
					const browser = await puppeteer.launch({headless: true})
					const page = await browser.newPage()
					await page.goto('https://github.com/login')
					await page.type('#login_field', process.env.GITHUB_USER)
					await page.type('#password', process.env.GITHUB_PWD)
					await page.click('[name="commit"]')
					await page.waitForNavigation()
					await page.screenshot({ path: screenshot })
					browser.close()
					console.log('See screenshot: ' + screenshot)
				})()
			*/

			// TODO get notes from evernote
		},
	},

	Mutation: {
		parseNotes: async () => {
			console.log('parseNotes');
			// TODO parse notes
			const response = {};
			return response;
		},
	},
};
