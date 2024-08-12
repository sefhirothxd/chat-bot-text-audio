require('dotenv').config();
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');

/**
 *
 * @param {*} path url mp3
 */
const voiceToText = async (path) => {
	if (!fs.existsSync(path)) {
		throw new Error('No se encuentra el archivo');
	}

	// mp3 file
	const file = fs.createReadStream(path);

	console.log('file', file.path);

	try {
		const response = await axios.post(
			'https://api.openai.com/v1/audio/transcriptions',
			{
				file,
				model: 'whisper-1',
			},
			{
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${process.env.PROBANDO}`,
				},
			}
		);

		return response.data.text;
	} catch (err) {
		console.log(err);
		return 'ERROR';
	}
};

module.exports = { voiceToText };
