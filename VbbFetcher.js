"use strict";
const vbbClient = require('vbb-client');

let VbbFetcher = function (config) {

    this.config = config;

    this.getStationName().then((res) => {
        console.log("Fetcher for station " + res + " created. (Station ID: " + this.config.stationId + ")")
    })
};

VbbFetcher.prototype.getStationId = function () {
    return this.config.stationId;
};

VbbFetcher.prototype.getStationName = function () {
    return vbbClient.station(this.config.stationId).then((response) => {
        return response.name;
    })
};


VbbFetcher.prototype.fetchDepartures = function () {

    let opt = {
        when: "now",
        duration: this.config.departureMinutes,
        //identifier: "Testing - MagicMirror module MMM-PublicTransportBerlin"    // send testing identifier
    };

    return vbbClient.departures(this.config.stationId, opt).then((response) => {
        return this.processData(response)
    });
};

VbbFetcher.prototype.processData = function (data) {

    let departuresData = {
        stationId: this.config.stationId,
        stationName: "",
        departuresArray: []
    };

    //console.log("------------------------------");
    //console.log("Data for " + data[0].station.name + ". Length of array: " + data.length);

    data.forEach((row, i) => {
        if (!this.config.ignoredStations.includes(row.station.id)
            && !this.config.excludedTransportationTypes.includes(row.product.type.type)) {

            let delay = row.delay;

            if (!delay) {
                row.delay = 0
            }

            // leave this here for debugging reasons (for now)...
/*
            var delayMinutes = Math.floor((((delay % 31536000) % 86400) % 3600) / 60);

            var time = row.when.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

            if (i <= 20) {
                console.log(time + " " + delayMinutes + " " + row.product.type.unicode + " " + row.direction + " | stationId: " + row.station.id);
            }
*/

            let dateObject = new Date(row.when);

            let current = {
                when: dateObject,
                delay: row.delay,
                line: row.product.line,
                nr: row.product.nr,
                type: row.product.type.type,
                color: row.product.type.color,
                direction: row.direction
            };
            departuresData.departuresArray.push(current);
        }
    });

    departuresData.departuresArray.sort(compare);

    return this.getStationName(this.config.stationId).then((name) => {
        departuresData.stationName = name;
        return departuresData;
    });
};

function compare(a, b) {

    // delay must be converted to milliseconds
    let timeA = a.when.getTime() + a.delay * 1000;
    let timeB = b.when.getTime() + b.delay * 1000;

    if (timeA < timeB) {
        return -1;
    }
    if (timeA > timeB) {
        return 1
    }
    return 0
}

module.exports = VbbFetcher;