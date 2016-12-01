"use strict";
const vbbClient = require('vbb-client');
const dbClient = require('db-hafas');

let DbFetcher = function (config) {
    this.config = config;
};

let typeData = {
    'U': {
        type: 'subway',
        color: '#0067AD'
    },
    'Bus': {
        type: 'bus',
        color: '#a5037b'
    }
}

DbFetcher.prototype.getStationId = function () {
    return this.config.stationId;
};

DbFetcher.prototype.getStationName = function () {
    return dbClient.locations(this.config.name).then((response) => {
        return response ? response[0].name : '';
    });
};

DbFetcher.prototype.fetchDepartures = function () {

    // when value for a request is calculated to be 5 minutes before delay time
    let when;

    if (this.config.delay > 0) {
        when = new Date();
        when.setTime((Date.now() + this.config.delay * 60000) - (5 * 60000));
    } else {
        when = Date.now();
    }

    let direction = null;
    if (this.config.direction) {
        direction = this.config.direction;
    }

    let opt = {
        when: when,
        duration: this.config.departureMinutes,
        direction: direction
    };

    return dbClient.departures(this.config.stationId, opt).then((response) => {
        return this.processData(response)
    });
};

DbFetcher.prototype.processData = function (data) {

    let departuresData = {
        stationId: this.config.stationId,
        departuresArray: []
    };

    //console.log(data);

    data.forEach((row) => {
        if (!this.config.ignoredStations.includes(row.station.id)) {

            //console.log('------------------------------------------------------------------------------');
            //console.log('Parsing: ' + row.product.name + ' nach ' + row.direction + ' um ' + row.when);

            let delay = row.delay;
            if (!delay) {
                row.delay = 0
            }

            let productType = row.product.type;
            if (!productType) {
                productType = typeData[row.product.productName];
            }

            let current = {
                when: row.when,
                delay: row.delay,
                line: row.product.name,
                nr: row.product.nr,
                type: productType.type,
                color: productType.color,
                direction: row.direction
            };

            //console.log(current);

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

module.exports = DbFetcher;