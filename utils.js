const evaluateNCrawl = ($cheerio, depth, stream, isFirst) => {
	return (index, element) => {
		const link = $cheerio(element).attr('href');
		// console.log(`Link found: ${link}`);
		if (depth > 0 && link.startsWith('http')) {
			crawlPage(link, depth - 1, stream, isFirst);
		}
	};
};

module.exports = { evaluateNCrawl };
