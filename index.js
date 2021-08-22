const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const axios = require("axios");
const parser = require("node-html-parser");

const server = app.listen(port, function () {
	console.log("running on port: %s", port);
});

// Enable CORS for all methods
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	next();
});


// setting up routes for the API
app.get("/", function (req, res) {
	res.send(
		"howto: </br>\
		/commits/:user - returns total number of commits this year</br>"
	);
});

// contributions by user for one year
app.get('/commits/:user', async (req, res) => {
	let response = await axios(`https://github.com/users/${req.params.user}/contributions`);
	const root = parser.parse(response.data);
	const main = root.querySelector('.ContributionCalendar')
	let total = 0
	const calendarDays = root.querySelectorAll('.js-calendar-graph-svg .ContributionCalendar-day')
	const contributions = calendarDays.map(day => {
		let info = {}
		const count = parseInt(day['_attrs']['data-count'])
		total += count
		info['count'] = count
		info['intensity'] = day['_attrs']['data-level']
		info['date'] = day['_attrs']['data-date']
		return info
	})

	const data = { contributions, datefrom: main['_attrs']['data-from'], dateto: main['_attrs']['data-to'], total }
	res.send(JSON.stringify(data))
})