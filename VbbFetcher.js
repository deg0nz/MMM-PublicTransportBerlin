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

    // when value for a request is calculated to be 5 minutes before travelTimeToStation time
    // so we can also show the non-reachable departures in the module
    let when;

    if (this.config.travelTimeToStation > 0) {
        when = new Date();
        when.setTime((Date.now() + this.config.travelTimeToStation * 60000) - (5 * 60000));
    } else {
        when = Date.now();
    }

    let opt;

    // Handle single direction case
    if(!this.config.directionStationId) {
        opt = {
            when: when,
            duration: this.config.departureMinutes
        };
    } else {
        let results = this.config.maxUnreachableDepartures + this.config.maxReachableDepartures;
        opt = {
            nextStation: this.config.directionStationId,
            when: when,
            results: results
        };
    }

    // For use in testing environments:
    // opt.identifier = "Testing - MagicMirror module MMM-PublicTransportBerlin";    // send testing identifier

    return vbbClient.departures(this.config.stationId, opt)
        .then((response) => {
            return this.processData(response);
        }).catch((e) => {
            throw e;
        });
};

VbbFetcher.prototype.processData = function (data) {

    let departuresData = {
        stationId: this.config.stationId,
        departuresArray: []
    };

    data.forEach((row) => {
        // check for:
        // ignored stations
        // excluded transportation types
        // ignored lines
        if (!this.config.ignoredStations.includes(row.station.id)
            && !this.config.excludedTransportationTypes.includes(row.line.product)
                && !this.config.ignoredLines.includes(row.line.name)
                    && row.when !== null    // Sort out trips without when, because we can't sort them
        ) {

            let current = {
                when: row.when,
                delay: row.delay || 0,
                cancelled: row.cancelled || false,
                name: row.line.name,
                nr: row.line.nr,
                type: row.line.product,
                direction: row.direction
            };

            printDeparture(row);

            departuresData.departuresArray.push(current);
        }
    });

    departuresData.departuresArray.sort(compareTimes);
    return departuresData;
};

function compareTimes(a, b) {

    let timeA = a.when.getTime();
    let timeB = b.when.getTime();

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

    let delayMinutes = Math.floor((((row.delay % 31536000) % 86400) % 3600) / 60);

    let time = row.when.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    console.log(time + " " + delayMinutes + " " + row.line.product + " " + row.direction + " | stationId: " + row.station.id);
}

module.exports = VbbFetcher;