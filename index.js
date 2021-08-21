let express = require("express");
let app = express();
let port = process.env.PORT || 8080;
let axios = require("axios");
let parser = require("node-html-parser");

let server = app.listen(port, function () {
	console.log("running on port: %s", port);
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