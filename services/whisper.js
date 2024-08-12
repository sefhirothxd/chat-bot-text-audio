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

		//delete all files in folder tmp
		try {
			// Verifica si el directorio existe antes de intentar leerlo
			if (fs.existsSync('./tmp')) {
				// Lee el contenido del directorio y elimina cada archivo
				fs.readdirSync('./tmp').forEach((file) => {
					try {
						fs.unlinkSync(`./tmp/${file}`);
					} catch (err) {
						console.error(`Error al eliminar el archivo: ${file}`, err);
					}
				});
			} else {
				console.log(
					'El directorio ./tmp no existe, continuando con el proceso.'
				);
			}
		} catch (err) {
			console.error('Error al leer el directorio ./tmp:', err);
		}

		return response.data.text;
	} catch (err) {
		console.log(err);
		return 'ERROR';
	}
};

module.exports = { voiceToText };
