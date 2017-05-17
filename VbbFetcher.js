"use strict";
const vbbClient = require('vbb-client');

let VbbFetcher = function (config) {
    this.config = config;
};

VbbFetcher.prototype.getStationId = function () {
    return this.config.stationId;
};

VbbFetcher.prototype.getStationName = function () {
    return vbbClient.station(this.config.stationId).then((response) => {
        return response.name;
    });
};

VbbFetcher.prototype.fetchDepartures = function () {

    // when value for a request is calculated to be 5 minutes before delay time
    let when;

    if (this.config.delay > 0) {
        when = new Date();
        when.setTime((Date.now() + this.config.delay * 60000) - (5 * 60000));
    } else {
        when = Date.now();
    }

    let opt = {
        when: when,
        duration: this.config.departureMinutes,
        // identifier: "Testing - MagicMirror module MMM-PublicTransportBerlin"    // send testing identifier
    };

    return vbbClient.departures(this.config.stationId, opt).then((response) => {
        return this.processData(response)
    });
};

VbbFetcher.prototype.processData = function (data) {

    let departuresData = {
        stationId: this.config.stationId,
        departuresArray: []
    };

    data.forEach((row) => {
        if (!this.config.ignoredStations.includes(row.station.id)
            && !this.config.excludedTransportationTypes.includes(row.product.type.type)) {

            let delay = row.delay;

            if (!delay) {
                row.delay = 0
            }
            
            let current = {
                when: row.when,
                delay: row.delay,
                line: row.product.line,
                nr: row.product.nr,
                type: row.product.type.type,
                color: row.product.type.color,
                direction: row.direction,
                productName: row.product.type.name
            };

            departuresData.departuresArray.push(current);
        }
    });

    departuresData.departuresArray.sort(compare);
    return departuresData;
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

// helper function to print departure for debugging
function printDeparture(row) {

    let delayMinutes = Math.floor((((delay % 31536000) % 86400) % 3600) / 60);

    let time = row.when.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    console.log(time + " " + delayMinutes + " " + row.product.type.unicode + " " + row.direction + " | stationId: " + row.station.id);
}

module.exports = VbbFetcher;