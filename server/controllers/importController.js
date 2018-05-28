const colors = require('colors');
const Evernote = require('evernote');
const fs = require('fs');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data/staging' : 'data/staging';

/*====================================
=            Web Requests            =
====================================*/

exports.convertNotes = (req, res, next) => {
	console.log('convertNotes');

	res.json({ status: 'convertNotes' });
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
	this.findNotes(store, next)
		.then(notes => this.downloadNotes(store, notes, next))
		.then(status => {
			res.redirect('/import');
			//res.json({ status });
		})
		.catch(next);
};

exports.renderImport = (req, res, next) => {
	fs.readdir(DB_PATH, (err, files) => {
	  const notes = files.filter(n => n.includes('.json'));

	  res.render("import", {
			numberStaged: () => notes.length
		});
	});
};

/*=====  End of Web Requests  ======*/

/*======================================
=            Evernote Calls            =
======================================*/

exports.findNotes = async (store, next) => {
	// filter result set to those that haven't been tagged as 'imported' yet
	const filter = new Evernote.NoteStore.NoteFilter({ words: '-tag:imported' });
  
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

exports.downloadNote = async (store, note, next) => {
	// setup note filter
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

  return await store.getNoteWithResultSpec(note.guid, spec)
  	.then(data => {
  		console.log(`... ${data.title}`.cyan);

  		let noteContent = {
  			category: data.notebookGuid,
  			content: data.content,
  			evernoteGUID: data.guid,
  			image: data.resources[0].data.body,
  			source: data.attributes.sourceURL,
  			tags: data.tagGuids,
  			title: data.title
  		};

  		// write the note to a file
  		fs.writeFileSync(`${DB_PATH}/${data.guid}.json`, JSON.stringify(noteContent, null, 2), 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${data.title} data`);
				// TODO think about this a bit more... should i re-try?
			});

  		// return the note data for tagging
  		return data;
  	})
  	.catch(next);
};

exports.findTag = async (store, tagName) => {
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

exports.tagNote = async (store, note, tag) => {
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

/*=====  End of Evernote Calls  ======*/

exports.downloadNotes = async (store, notes, tag, next) => {
	if (notes && notes.length > 0) {
		// lookup or create the 'imported' tag
		return await this.findTag(store, 'imported')
			.then(tag => {
				// then go through each note
				notes = notes.map(async note => {
					// download the note content to the staging environment
					return await this.downloadNote(store, note)
						// and tag the note in evernote as 'imported'
						.then(note => this.tagNote(store, note, tag))
						.catch(err => {
							console.log(err);
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