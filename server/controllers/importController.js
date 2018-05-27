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

exports.downloadNotes = (req, res, next) => {
	// setup access to evernote's datastore
  const client = new Evernote.Client({
    token: req.session.oauthToken,
    sandbox: process.env.SANDBOX,
    china: process.env.CHINA,
  });

  const store = client.getNoteStore();

	// create a search filter for notes that haven't been tagged as 'imported' yet
	// return a batch of note metadata that matches this criteria
	this.findNotes(store, next)
		.then(notes => this.queryNotes(store, notes, next))
		.then(status => {
			res.json({ status } )
		})
		.catch(next);
};

exports.renderImport = (req, res, next) => {
	let numberStaged = 0;

	res.render("import", {
		numberStaged: () => numberStaged
	});
};

/*=====  End of Web Requests  ======*/

/*======================================
=            Evernote Calls            =
======================================*/

exports.findNotes = async (store, next) => {
	console.log('findNotes'.yellow);

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
  		console.log('back from findNotesMetadata'.green);
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
	console.log('downloadNote'.yellow);
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

  		const noteContent = {
  			evernoteGUID: data.guid,
  			title: data.title,
  			source: data.attributes.sourceURL,
  			image: data.resources[0].data.body,
  			category: data.notebookGuid,
  			tags: data.tagGuids
  		};

  		// write the note to a file
  		fs.writeFileSync(`${DB_PATH}/${data.guid}.json`, JSON.stringify(noteContent, null, 2), 'utf-8', (err) => {
				if (err) throw new Error(`An error occurred while writing ${data.title} data`);
				// TODO think about this a bit more... should i re-try?
			});

  		return true;
  	})
  	.catch(next);
};

exports.queryNotes = async (store, notes, next) => {
	console.log('queryNotes'.yellow);
	console.log(notes.length);

	if (notes && notes.length > 0) {
		// pull down the note content for each note in our list
		notes = notes.map(async note => {
			console.log('getting ready to download a new note!');
			return await this.downloadNote(store, note).catch(next);
		});

		return Promise.all(notes).then((results) => {
			const numDownloaded = (results) ? results.length : 0;
			return `Finished downloading ${numDownloaded} notes.`;
		}).catch(next);
	}

	return [];
};

/*=====  End of Evernote Calls  ======*/
