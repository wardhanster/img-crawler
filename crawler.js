const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
let imageCount = 0;

const incrImageCount = () => {
	imageCount++;
	console.log(`\rTotal images written: ${imageCount}`);
};

async function crawlPage(url, depth, stream, isFirst) {
	// console.log(`Crawling URL: ${url} at depth ${depth}`);
	try {
		const response = await axios.get(url);
		const html = response.data;
		const $ = cheerio.load(html);
		$('img').each((index, element) => {
			const imageUrl = $(element).attr('src');
			if (!imageUrl.length) return;
			if (!isFirst) {
				stream.write(',\n');
			}
			stream.write(JSON.stringify({ imageUrl, sourceUrl: url, depth }));
			isFirst = false;
			incrImageCount();
		});

		$('a').each((index, element) => {
			const link = $(element).attr('href');
			if (depth > 0 && link.startsWith('http')) {
				crawlPage(link, depth - 1, stream, isFirst);
			}
		});
	} catch (error) {
		console.error(`Error while crawling URL: ${url}`);
		console.error(error.message);
	}
}

const startURL = process.argv[2];
const depth = parseInt(process.argv[3]);
const FILE_NAME = 'results.json';
const stream = fs.createWriteStream(FILE_NAME);
stream.write('{"results": [\n');

process.on('exit', () => {
	stream.write('\n]}');
	stream.end();
});

crawlPage(startURL, depth, stream, true);