const createClient = require("hafas-client");
const shortenStationName = require("vbb-short-station-name");
const profile = require("hafas-client/p/bvg");
const Log = require("logger");
const pjson = require("./package.json");

const hafasClient = createClient(
  profile,
  `MMM-PublicTransportBerlin v${pjson.version}`
);

module.exports = class BvgFetcher {
  constructor(config) {
    this.config = config;
    this.id = config.name;
  }

  getIdentifier() {
    return this.id;
  }

  getStationId() {
    return this.config.stationId;
  }

  async getStationName() {
    const station = await hafasClient.stop(this.config.stationId);
    return station.name;
  }

  async getDirectionDescriptor() {
    if (typeof this.config.directionStationId === "undefined") {
      return "all directions";
    }
    const station = await hafasClient.stop(this.config.directionStationId);
    return station.name;
  }

  async fetchDepartures() {
    // when value for a request is calculated to be 5 minutes before travelTimeToStation time
    // so we can also show the non-reachable departures in the module
    let when;

    if (this.config.travelTimeToStation > 0) {
      when = new Date();
      when.setTime(
        Date.now() + this.config.travelTimeToStation * 60000 - 5 * 60000
      );
    } else {
      when = Date.now();
    }

    let opt;

    // Handle single direction case
    if (
      !this.config.directionStationId ||
      this.config.directionStationId === ""
    ) {
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

    const departures = await hafasClient.departures(this.config.stationId, opt);
    const processedDepartures = this.processData(departures);

    return processedDepartures;
  }

  processData(data) {
    const departuresData = {
      fetcherId: this.id,
      departuresArray: []
    };

    data.forEach((row) => {
      // check for:
      // excluded transportation types
      // ignored lines

      // TODO: Make real stop/station handling here
      // Quick fix to work around missing station objects
      if (!row.station) {
        row.station = row.stop; // eslint-disable-line no-param-reassign
      }

      // If log level is set to debug print infos about departures
      if (config.logLevel.includes("DEBUG")) this.printDeparture(row); // eslint-disable-line no-undef

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

  static compareTimes(a, b) {
    if (a.when < b.when) {
      return -1;
    }
    if (a.when > b.when) {
      return 1;
    }
    return 0;
  }

  // helper function to print departure for debugging
  static printDeparture(row) {
    const delayMinutes = Math.floor(
      (((row.delay % 31536000) % 86400) % 3600) / 60
    );

    const time = new Date(row.when).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    Log.log(
      `${time} ${delayMinutes} ${row.line.product} ${row.direction} | stationId: ${row.station.id}`
    );
  }
};
