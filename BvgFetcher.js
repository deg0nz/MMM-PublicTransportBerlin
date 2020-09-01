"use strict";
const createClient = require("hafas-client");
const bvgProfile = require("hafas-client/p/bvg");
const pjson = require("./package.json");
const bvgClient = createClient(
  bvgProfile,
  "MagicMirror2 module MMM-PublicTransportBerlin v" +
    pjson.version +
    " (https://github.com/deg0nz/MMM-PublicTransportBerlin)"
);

let BvgFetcher = function (config) {
  this.config = config;
};

class BvgFetcher {
  constructor(config) {
    this.config = config;
  }

  getStationId() {
    return this.config.stationId;
  }

  async getStationName() {
    let station = await bvgClient.stop(this.config.stationId);

    return station.name;
  }

  async fetchDepartures() {
    // when value for a request is calculated to be 5 minutes before travelTimeToStation time
    // so we can also show the non-reachable departures in the module
    let when;

    if (this.config.travelTimeToStation > 0) {
      when = new Date();
      when.setTime(Date.now() + this.config.travelTimeToStation * 60000 - 5 * 60000);
    } else {
      when = Date.now();
    }

    let opt;

    // Handle single direction case
    if (!this.config.directionStationId || this.config.directionStationId === "") {
      opt = {
        when: when,
        duration: this.config.departureMinutes,
      };
    } else {
      opt = {
        direction: this.config.directionStationId,
        when: when,
        duration: this.config.departureMinutes,
      };
    }

    let departures = await bvgClient.departures(this.config.stationId, opt);
    let processedDepartures = this.processData(departures);

    return processedDepartures;
  }

  processData(data) {
    let departuresData = {
      stationId: this.config.stationId,
      departuresArray: [],
    };

    data.forEach((row) => {
      // check for:
      // ignored stations
      // excluded transportation types
      // ignored lines

      // TODO: Make real stop/station handling here
      // Quick fix to work around missing station objects
      if (!row.station) {
        row.station = row.stop;
      }

      if (
        !this.config.ignoredStations.includes(row.station.id) &&
        !this.config.excludedTransportationTypes.includes(row.line.product) &&
        !this.config.ignoredLines.includes(row.line.name)
      ) {
        let current = {
          when: row.when || row.scheduledWhen,
          delay: row.delay || 0,
          cancelled: row.cancelled || false,
          name: row.line.name,
          nr: row.line.nr,
          type: row.line.product,
          direction: row.direction,
        };

        departuresData.departuresArray.push(current);
      }
    });

    departuresData.departuresArray.sort(this.compareTimes);
    return departuresData;
  }

  compareTimes(a, b) {
    if (a.when < b.when) {
      return -1;
    }
    if (a.when > b.when) {
      return 1;
    }
    return 0;
  }

  // helper function to print departure for debugging
  printDeparture(row) {
    let delayMinutes = Math.floor((((row.delay % 31536000) % 86400) % 3600) / 60);

    let time = row.when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    console.log(
      time + " " + delayMinutes + " " + row.line.product + " " + row.direction + " | stationId: " + row.station.id
    );
  }
}

module.exports = BvgFetcher;
