const colors = require('colors');
const Evernote = require('evernote');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const uuid = require('uuid');

const recipeController = require('./recipeController');
const Recipe = require('./../models/recipeModel');
const parserController = require('./parserController');

const STAGE_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data/staging' : 'data/staging';

/*====================================
=            Web Requests            =
====================================*/

exports.convertNotes = (req, res, next) => {
	// go through each note in the staging environment
	importNotes((filename, note) => importNote(filename, note), err => console.log(err));
	


	res.redirect('/import');
};

exports.renderPage = (req, res, next) => {
	fs.readdir(STAGE_PATH, (err, files) => {
	  const notes = files.filter(n => n.includes('.json'));

	  res.render("import", {
			numberStaged: () => notes.length
		});
	});
};

exports.stageNotes = (req, res, next) => {
	// setup access to evernote's datastore
  const client = new Evernote.Client({
    token: req.session.oauthToken,
    sandbox: (process.env.SANDBOX == true) ? true : false,
    china: (process.env.CHINA == true) ? true : false
  });

  const store = client.getNoteStore();

	// create a search filter for notes that haven't been tagged as 'imported' yet
	// return a batch of note metadata that matches this criteria
	findNotes(store, next)
		.then(notes => downloadNotes(store, notes, next))
		.then(status => {
			res.redirect('/import');
			//res.json({ status });
		})
		.catch(next);
};

/*=====  End of Web Requests  ======*/



/*----------  Importer Methods  ----------*/

importNote = async (filename, note) => {
	const existing = recipeController.findRecipes('evernoteGUID', note.evernoteGUID);

	// check to see if this evernoteGUID is already recorded in our recipes db
	if (existing && existing.length === 0) {
		// setup our new recipe
		const rp = new Recipe();
		rp.evernoteGUID = note.evernoteGUID;
		rp.title = note.title;
		rp.source = note.source;
		rp.image = note.imagePath;

		await Promise.all([
			// parse note content
			parserController.parseNoteContent(note.content, rp.recipeID),
			// lookup tag and category data
			lookupMetadata(note)
		]).then(results => {
			rp.categories = results[1].categories;
			rp.tags = results[1].tags;

			results[0].ingredientLines.forEach(line => {
				rp.addIngredientLine(line);
			});

			results[0].instructions.forEach(line => {
				rp.addInstruction(line);
			});

			rp.saveRecipe();
		})
		.catch(err => {
			console.log(err);
		});


	} else {
		// remove this image
		console.log('TODO removing existing recipe...');

		// remove this file
	}
};

importNotes = (callback) => {
	console.log('importNotes'.cyan);
	// go through each file in our staging directory
	fs.readdir(`${STAGE_PATH}/`, function(err, files) {
    if (err) {
      console.log(err);
      return;
    }

    files.forEach(function(filename) {
    	if (filename.includes('.json')) {
	      fs.readFile(`${STAGE_PATH}/` + filename, 'utf-8', function(err, content) {
	        if (err) {
	          console.log(err);
	          return;
	        }

		      // start the import process for this file
		      callback(filename, JSON.parse(content));
	      });
	    }
    });
  });
};

lookupMetadata = (note) => {
	console.log('lookupMetadata'.magenta);

	return {
		categories: new Map(),
		tags: new Map()
	};
};

processImageContent = async (store, note) => {
	console.log('processImageContent'.blue);
	// minify image data
	const optimizedImage = await imagemin.buffer(note.resources[0].data.body, {
    plugins: [
      imageminJpegtran(),
      imageminPngquant( { quality: '75-80' } )
    ]
	}).catch(err => {
		console.log(err);
	});

	// save it out from the note
  await fs.writeFile(`${STAGE_PATH}/images/${note.guid}.${note.resources[0].mime.split('/')[1]}`, optimizedImage, 'binary', (err) => {
    if (err) console.log(err);
  });

  return note;
};

writeNoteContent = async (store, note) => {
	console.log('writeNoteContent'.blue);
	const noteExport = {
		category: note.notebookGuid,
		content: note.content,
		evernoteGUID: note.guid,
		imagePath: `/images/${note.guid}.${note.resources[0].mime.split('/')[1]}`,
		source: note.attributes.sourceURL,
		tags: note.tagGuids,
		title: note.title
	};

	// write the note to a file
	fs.writeFileSync(`${STAGE_PATH}/${note.guid}.json`, JSON.stringify(noteExport, null, 2), 'utf-8', (err) => {
		if (err) throw new Error(`An error occurred while writing ${note.title} data`);
		// TODO think about this a bit more... should i re-try?
	});

	// pass back only the essentials for tagging
	console.log(note.tagGuids);
	return {
		guid: note.guid,
		title: note.title,
		tagGuids: note.tagGuids,
		content: null, // indicates no changes to content data
		resources: null // indicates no changes to content data
	};
};



/*----------  Evernote Store Calls  ----------*/

downloadNotes = async (store, notes, tag, next) => {
	if (notes && notes.length > 0) {
		// TODO
		// should we get a current tag and category list and save to their dbs here?

		// lookup or create the 'imported' tag
		return await findTag(store, 'imported')
			.then(tag => {
				// setup note specification
				const spec = new Evernote.NoteStore.NoteResultSpec({
			    includeContent: true,
			    includeResourcesData: true,
			    includeResourcesRecognition: false,
			    includeResourcesAlternateData: false,
			    includeSharedNotes: false,
			    includeNoteAppDataValues: true,
			    includeResourceAppDataValues: true,
			    includeAccountLimits: false
			  });

				// for each note that we have info on, download and process the conent
				notes = notes.map(async note => {
					return await store.getNoteWithResultSpec(note.guid, spec)
				  	.then(data => processImageContent(store, data))
				  	.then(data => writeNoteContent(store, data))
				  	.then(data => tagNote(store, data, tag))
				  	.then(data => {
							console.log(`... ${data.title}`.cyan);
							return data;
				  	})
				  	.catch(err => {
				  		console.log(err)
				  	});
				});

				// return a status completed once all notes are resolved
				return Promise.all(notes)
					.then((results) => {
						const numDownloaded = (results) ? results.length : 0;
						return `Finished downloading ${numDownloaded} notes.`;
					})
					.catch(err => {
						console.log(err);
					});

			}).catch(err => {
				console.log(err);
			});
	}

	return [];
};

findNotes = async (store, next) => {
	console.log('findNotes'.yellow);
	// filter result set to those that haven't been tagged as 'imported' yet
	const filter = new Evernote.NoteStore.NoteFilter({ words: '-tag:imported' });
	// TODO this needs to be expanded to excludes unsorted recipes, but either i'm fucking up
	// the syntax for -notebook:recipesToSort with the tag or this doesn't completely work

  // limit the number of notes we bring down at one time
  const maxResults = process.env.DOWNLOAD_LIMIT;
  const offset = 0;

  // tell evernote only what we care about
  const spec = new Evernote.NoteStore.NotesMetadataResultSpec({
    includeTitle: true, // <-- why not, you might want this for debugging purposes
    includeContentLength: false,
    includeCreated: false,
    includeUpdated: false,
    includeDeleted: false,
    includeUpdateSequenceNum: false,
    includeNotebookGuid: false,
    includeTagGuids: true, // <-- might want this for debugging purposes
    includeAttributes: true, // <-- we need this for the source URL
    includeLargestResourceMime: false,
    includeLargestResourceSize: false
  });

  // find the metadata for the notes that match our search criteria
  return await store.findNotesMetadata(filter, offset, maxResults, spec)
  	.then(results => {
  		// warn the user if we're all out of notes to import
  		if (results.notes.length === 0) {
    		const err = new Error('No new notes to import!');
    		err.status = 204;
    		throw err;
    	}

    	// return the metadata
    	return results.notes;
  	})
  	.catch(next);
};

findTag = async (store, tagName) => {
	return await store.listTags()
		.then(tags => {
			// look up or create the tag that we passed in
			let tag = tags.filter(t => t.name === tagName);
			if (tag && tag.length > 0) {
				return tag[0];
			}

			// if we didn't find the tag, create it
			return store.createTag({ name: tagName })
				.then(tag => {
					return tag;
				})
				.catch(err => {
					console.log(err);
		    });
		})
		.catch(err => {
			console.log(err);
	  });
};

tagNote = async (store, note, tag) => {
	// add tag to note
	note.tagGuids = (!note.tagGuids) ? [ tag.guid ] : note.tagGuids.push(tag.guid);

	// from the evernote docs:
	// With the exception of the note's title and guid, fields that are not being changed
	// do not need to be set. If the content is not being modified, note.content should be
	// left unset. If the list of resources is not being modified, note.resources should be
	// left unset.

	// so that's why we're nulling these out for this call
	note.content = null;
	note.resources = null

	return await store.updateNote(note);
};
