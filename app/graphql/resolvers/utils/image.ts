import cloudinary from 'cloudinary';
// import imagemin from 'imagemin';
// import imageminJpegtran from 'imagemin-jpegtran';
// import imageminPngquant from 'imagemin-pngquant';

// export const minifyImage = async (image) => {
// 	const optimizedImage = await imagemin.buffer(image, {
// 		plugins: [
// 			imageminJpegtran(),
// 			imageminPngquant({ quality: [ 0.7, 0.8 ] }),
// 		],
// 	}).catch((err) => { throw err });
// 	return optimizedImage;
// };

export const saveImages = async (notes) => {
	const resolveImage = notes
		.map(async (note) => {
			const { image } = note;
			// TODO better error handling for missing images in notes
			if (!image) {return null;}
			// // minify image
			// const minified = await minifyImage(image)
			// 	// then upload to cloudinary
			// 	.then(async (img) => uploadImage(img, { folder: 'recipes' }));
			return {
				...note,
				// image: minified.secure_url,
			};
		});

	const notesRes = await Promise.all(resolveImage)
		.catch((err) => { throw err });

	return notesRes;
};

export const uploadImage = (fileBuffer, options) => (
	new Promise((resolve, reject) => {
		cloudinary.v2.uploader.upload_stream(options, (error, result) => {
			if (error) {
				reject(error);
			}
			resolve(result);
		}).end(fileBuffer);
	})
);

export default {
	// minifyImage,
	saveImages,
	uploadImage,
};
