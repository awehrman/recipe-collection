import cloudinary, { UploadApiOptions } from 'cloudinary';

import { ImportedNote } from '../../types/note';

// TODO go chase down cloudinary types and
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const saveImages = async (notes: ImportedNote[]) => {
	const resolveImage = notes
		.map(async (note) => {
			const { image } = note;
			if (!image) {
				throw new Error('No image exists in this note.');
			}
			const uploaded = await uploadImage(Buffer.from(image), { folder: 'recipes' })
				.catch((err) => { throw err; });

			return {
				...note,
				image: uploaded?.secure_url,
			};
		});

	const notesRes = await Promise.all(resolveImage)
		.catch((err) => { throw new Error(`Could not upload to Cloudinary. ${err}`) });

	return notesRes;
};

export const uploadImage = async (buffer: Buffer, options: UploadApiOptions): Promise<unknown> => (
	new Promise((resolve, reject) => {
		cloudinary.v2.uploader.upload_stream(options, (error, result) => {
			if (error) {
				reject(error);
			}
			resolve(result);
		}).end(buffer);
	})
);

export default {
	saveImages,
	uploadImage,
};
