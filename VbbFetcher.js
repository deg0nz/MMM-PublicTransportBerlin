"use strict";
const createClient = require('hafas-client');
const bvgProfile = require('hafas-client/p/bvg');

const vbbClient = createClient(bvgProfile, 'MagicMirror module MMM-PublicTransportBerlin v1.2.5');

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
    if(!this.config.directionStationId || this.config.directionStationId === "") {
        opt = {
            when: when,
            duration: this.config.departureMinutes
        };
    } else {
        let results = this.config.maxUnreachableDepartures + this.config.maxReachableDepartures;
        opt = {
            nextStation: this.config.directionStationId,
            when: when,
            results: results,
        };
    }

    opt.identifier = "MagicMirror2 module MMM-PublicTransportBerlin";


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

      // TODO: Make real stop/station handling here
      // Quick fix to work around missing station objects
      if(!row.station)
      {
          row.station = row.stop;
      }

        if (!this.config.ignoredStations.includes(row.station.id)
            && !this.config.excludedTransportationTypes.includes(row.line.product)
                && !this.config.ignoredLines.includes(row.line.name)
        ) {
            let current = {
                when: row.when || row.formerScheduledWhen,
                delay: row.delay || 0,
                cancelled: row.cancelled || false,
                name: row.line.name,
                nr: row.line.nr,
                type: row.line.product,
                direction: row.direction
            };
            
            departuresData.departuresArray.push(current);
        }
    });

    departuresData.departuresArray.sort(compareTimes);
    return departuresData;
};

function compareTimes(a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1
    }
    return 0
}

// helper function to print departure for debugging
function printDeparture(row) {
    let delayMinutes = Math.floor((((row.delay % 31536000) % 86400) % 3600) / 60);

    let time = row.when.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

    console.log(time + " " + delayMinutes + " " + row.line.product + " " + row.direction + " | stationId: " + row.station.id);
}

module.exports = VbbFetcher;
