const NodeHelper = require("node_helper");
const lineColors = require("vbb-line-colors");
const Log = require("logger");
const BvgFetcher = require("./BvgFetcher");

module.exports = NodeHelper.create({
  start () {
    this.departuresFetchers = [];
  },

  async createFetcher (config) {
    const fetcherId = config.identifier;
    let fetcher;

    if (typeof this.departuresFetchers[fetcherId] === "undefined") {
      fetcher = new BvgFetcher(config);
      await fetcher.init();
      this.departuresFetchers[fetcherId] = fetcher;
      this.sendInit(fetcher);

      try {
        const stationName = await fetcher.getStationName();
        const directionDescriptor = await fetcher.getDirectionDescriptor();
        Log.log(
          `Created transportation fetcher for station ${stationName} (toward ${directionDescriptor}). (Station ID: ${fetcher.getStationId()}, Direction ID: ${
            config.directionStationId
          })`
        );
      } catch (error) {
        Log.error("[MMM-PublicTransportBerlin]", error);
      }
    } else {
      fetcher = this.departuresFetchers[fetcherId];
      this.sendInit(fetcher);

      try {
        const stationName = await fetcher.getStationName();
        const directionDescriptor = await fetcher.getDirectionDescriptor();
        Log.log(
          `Using existing transportation fetcher for station ${stationName} (toward ${directionDescriptor}) created. (Station ID: ${fetcher.getStationId()}, Direction ID: ${
            config.directionStationId
          })`
        );
      } catch (error) {
        Log.error("[MMM-PublicTransportBerlin]", error);
      }
    }

    await this.getDepartures(fetcherId);
  },

  async sendInit (fetcher) {
    try {
      let stationName = await fetcher.getStationName();
      const directionDescriptor = await fetcher.getDirectionDescriptor();
      if (
        directionDescriptor !== "all directions" &&
        fetcher.config.showDirection
      ) {
        stationName += `<br />(toward ${directionDescriptor})`;
      }

      this.sendSocketNotification("FETCHER_INITIALIZED", {
        stationId: fetcher.getStationId(),
        stationName,
        fetcherId: fetcher.getIdentifier()
      });
    } catch (error) {
      Log.error(`[MMM-PublicTransportBerlin] Error initializing fetcher: ${error}`);
    }
  },

  async getDepartures (fetcherId) {
    try {
      const departuresData =
        await this.departuresFetchers[fetcherId].fetchDepartures();

      this.pimpDeparturesArray(departuresData.departuresArray);
      this.sendSocketNotification("DEPARTURES_FETCHED", departuresData);
    } catch (error) {
      Log.error(`Error while fetching departures (for module instance ${fetcherId}): ${error}`);
      // Add stationId to error for identification in the main instance
      error.fetcherId = fetcherId;
      error.message = error;
      this.sendSocketNotification("FETCH_ERROR", error);
    }
  },

  pimpDeparturesArray (departuresArray) {
    let currentProperties = {};

    departuresArray.forEach((current) => {
      currentProperties = this.getLineProperties(current);

      // if (!this.config.marqueeLongDirections) {
      //    current.direction = this.trimDirectionString(current.direction);
      // }
      current.bgColor = currentProperties.bgColor;
      current.fgColor = currentProperties.fgColor;
      current.cssClass = currentProperties.cssClass;
    });

    return departuresArray;
  },

  getLineProperties (product) {
    const properties = {
      bgColor: "#333",
      fgColor: "#FFF",
      cssClass: ""
    };

    const type = product.type;
    const lineType = product.line;
    const name = product.name;
    let colors = {};

    switch (type) {
      case "suburban":
        colors = lineColors.suburban[name];
        properties.cssClass = "ptb-sbahnsign";
        break;
      case "subway":
        colors = lineColors.subway[name];
        properties.cssClass = "ptb-ubahnsign";
        break;
      case "bus":
        colors.bg = "#B60079";
        colors.fg = "#FFF";
        properties.cssClass = "ptb-bussign";
        break;
      case "tram":
        colors = lineColors.tram[name];
        properties.cssClass = "ptb-tramsign";
        break;
      case "regional":
        colors = lineColors.regional[name];
        properties.cssClass = "ptb-dbsign";
        break;
      case "express":
        if (lineType === "LOCOMORE") {
          colors.bg = "#E5690B";
          colors.fg = "#3E1717";
          properties.cssClass = "ptb-locsign";
        } else {
          properties.cssClass = "ptb-expresssign";
        }
        break;
    }

    // In case new lines get added but are not listed in the vbb-line-colors module
    if (typeof colors === "undefined") {
      // If no color has been found for the line, default to grey
      properties.bgColor = "#535353";
      properties.fgColor = "#fff";
    } else {
      // Change default values if we changed them
      if ("bg" in colors) {
        properties.bgColor = colors.bg;
      }
      if ("fg" in colors) {
        properties.fgColor = colors.fg;
      }
    }

    return properties;
  },

  socketNotificationReceived (notification, payload) {
    if (notification === "FETCH_DEPARTURES") {
      this.getDepartures(payload);
    }

    if (notification === "CREATE_FETCHER") {
      this.createFetcher(payload);
    }
  }
});
