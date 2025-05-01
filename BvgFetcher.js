const shortenStationName = require("vbb-short-station-name");
const Log = require("logger");
const pJson = require("./package.json");

module.exports = class BvgFetcher {
  constructor (config) {
    this.config = config;
  }

  async init () {
    const {createClient} = await import("hafas-client");
    const {profile} = await import("hafas-client/p/bvg/index.js");
    this.hafasClient = createClient(
      profile,
      `MMM-PublicTransportBerlin v${pJson.version}`
    );
  }

  getIdentifier () {
    return this.config.identifier;
  }

  getStationId () {
    return this.config.stationId;
  }

  async getStationName () {
    const station = await this.hafasClient.stop(this.config.stationId);
    return this.config.shortenStationNames
      ? shortenStationName(station.name)
      : station.name;
  }

  async getDirectionDescriptor () {
    if (this.config.directionStationId === "") {
      return "all directions";
    }
    const station = await this.hafasClient.stop(this.config.directionStationId);
    return station.name;
  }

  async fetchDepartures () {
    // when value for a request is calculated to be 5 minutes before travelTimeToStation time
    // so we can also show the non-reachable departures in the module
    let when;

    if (this.config.travelTimeToStation > 0) {
      when = new Date(Date.now());
      when.setTime(
        Date.now() + this.config.travelTimeToStation * 60000 - 5 * 60000
      );
    } else {
      when = Date.now();
    }

    let opt;

    // Handle single direction case
    if (this.config.directionStationId === "") {
      opt = {
        when,
        duration: this.config.departureMinutes
      };
    } else {
      opt = {
        direction: this.config.directionStationId,
        when,
        duration: this.config.departureMinutes
      };
    }

    const departures = await this.hafasClient.departures(
      this.config.stationId,
      opt
    );
    const processedDepartures = this.processData(departures);

    return processedDepartures;
  }

  processData (data) {
    const departuresData = {
      fetcherId: this.config.identifier,
      departuresArray: []
    };

    data.departures.forEach((row) => {
      // check for:
      // excluded transportation types
      // ignored lines

      // TODO: Make real stop/station handling here
      // Quick fix to work around missing station objects
      if (!row.station) {
        row.station = row.stop;
      }

      // If log level is set to debug print infos about departures
      if (config.logLevel.includes("DEBUG")) {
        BvgFetcher.printDeparture(row);
      }

      if (
        !this.config.excludedTransportationTypes.includes(row.line.product) &&
        !this.config.ignoredLines.includes(row.line.name)
      ) {
        const current = {
          when: row.when || row.plannedWhen,
          delay: row.delay || 0,
          cancelled: row.cancelled || false,
          name: row.line.name,
          nr: row.line.nr,
          type: row.line.product,
          direction: this.config.shortenStationNames
            ? shortenStationName(row.direction)
            : row.direction
        };

        departuresData.departuresArray.push(current);
      }
    });

    departuresData.departuresArray.sort(this.compareTimes);
    return departuresData;
  }

  static compareTimes (a, b) {
    if (a.when < b.when) {
      return -1;
    }
    if (a.when > b.when) {
      return 1;
    }
    return 0;
  }

  // helper function to print departure for debugging
  static printDeparture (row) {
    const delayMinutes = Math.floor(
      row.delay % 31536000 % 86400 % 3600 / 60
    );

    const time = new Date(row.when).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    Log.debug(
      `${time} ${delayMinutes} ${row.line.product} ${row.direction} | stationId: ${row.station.id}`
    );
  }
};
