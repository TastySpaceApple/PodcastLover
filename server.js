var path = require('path');
var fs = require('fs');
var express = require('express')
	, app = express();
const request = require('request');
const xml2js = require('xml2js')

const API_URL = 'https://itunes.apple.com/search?media=podcast&term=';

var open = false;

app.use('/', express.static(path.join(__dirname, 'static')));

app.get('/search', (req,res) => {
	request(API_URL + encodeURIComponent(req.query.searchTerm), function (error, response, body) {
		res.send(body);
	});
})

app.get('/podcast', (req,res) => {
	request(req.query.url, function (error, response, body) {
		xml2js.parseString(body, function (err, result) {
			let channel = result.rss.channel[0];
			res.json({
				title: channel.title[0],
				description: channel.description[0],
				image: channel['itunes:image'][0].$.href,
				episodes: channel.item.map(item => {
					return {
						title: item.title[0],
						pubDate: item.pubDate[0],
						duration: item['itunes:duration'][0],
						guid: item.guid[0],
						file: item.enclosure[0].$
					}
				}).reverse()
			});
		});
	});
})

app.listen(process.env.PORT || 3000);

module.exports = app;
