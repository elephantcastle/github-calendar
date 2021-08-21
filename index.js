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
		/commits/:user - returns array with number of commits everyday</br>\
		/total/:user - returns total number of commits this year</br>\
		/commits/last/:user - returns number of commits for last 31 days"
	);
});

// contributions by user for one year
app.get('/commits/:user', async (req, res) => {
	let response = await axios(`https://github.com/users/${req.params.user}/contributions`);
	const root = parser.parse(response.data);
	const main = root.querySelector('.ContributionCalendar')

	const calendarDays = root.querySelectorAll('.ContributionCalendar-day')
	const contributions = calendarDays.map(day => {
		let info = {}
		info['count'] = day['_attrs']['data-count']
		info['intensity'] = day['_attrs']['data-level']
		info['date'] = day['_attrs']['data-date']
		return info
	})

	const data = { contributions, datefrom: main['_attrs']['data-from'], datato: main['_attrs']['data-to'] }
	res.send(JSON.stringify(data))
})