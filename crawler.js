const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
let imageCount = 0;

async function crawlPage(url, depth, stream, isFirst) {
	// console.log(`Crawling URL: ${url} at depth ${depth}`);
	try {
		const response = await axios.get(url);
		const html = response.data;
		const $ = cheerio.load(html);
		$('img').each((index, element) => {
			const imageUrl = $(element).attr('src');
			// console.log(`Image found: ${imageUrl}`);
			if (!isFirst) {
				stream.write(',\n');
			}
			stream.write(
				JSON.stringify({
					imageUrl,
					sourceUrl: url,
					depth,
				})
			);
			imageCount++;
			console.log(`\rTotal images written: ${imageCount}`);
			isFirst = false;
		});

		$('a').each((index, element) => {
			const link = $(element).attr('href');
			// console.log(`Link found: ${link}`);
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

const stream = fs.createWriteStream('results.json');
stream.write('{"results": [\n');

crawlPage(startURL, depth, stream, true);

process.on('exit', () => {
	stream.write('\n]}');
	stream.end();
});
