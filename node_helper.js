"use strict";
const NodeHelper = require("node_helper");
const BvgFetcher = require("./BvgFetcher");
const lineColors = require("vbb-line-colors");

module.exports = NodeHelper.create({
  start: function () {
    this.departuresFetchers = [];
  },

  createFetcher: async function (config) {
    const fetcherId = config.name;
    let fetcher;

    if (typeof this.departuresFetchers[fetcherId] === "undefined") {
      fetcher = new BvgFetcher(config);
      this.departuresFetchers[fetcherId] = fetcher;
      this.sendInit(fetcher);

      try {
        let stationName = await fetcher.getStationName();
        let directionDescriptor = await fetcher.getDirectionDescriptor();
        console.log(`Created transportation fetcher for station ${stationName} (toward ${directionDescriptor}). (Station ID: ${fetcher.getStationId()}, Direction ID: ${config.directionStationId})`);
      } catch (error) {
        console.error(error);
      }

    } else {
      fetcher = this.departuresFetchers[fetcherId];
      this.sendInit(fetcher);

      try {
        let stationName = await fetcher.getStationName();
        let directionDescriptor = await fetcher.getDirectionDescriptor();
        console.log(`Using existing transportation fetcher for station ${stationName} (toward ${directionDescriptor}) created. (Station ID: ${fetcher.getStationId()}, Direction ID: ${config.directionStationId})`);
      } catch (error) {
        console.error(error)
      }
    }

    await this.getDepartures(fetcherId);
  },

  sendInit: async function (fetcher) {
    try {
      let stationName = await fetcher.getStationName();
      let directionDescriptor = await fetcher.getDirectionDescriptor();
      if (directionDescriptor !== "all directions" && fetcher.config.showDirection) {
        stationName += `<br />(toward ${directionDescriptor})`
      }

      this.sendSocketNotification("FETCHER_INIT", {
        stationId: fetcher.getStationId(),
        stationName: stationName,
        fetcherId: fetcher.getId()
      });
    } catch (error) {
      console.error("Error initializing fetcher: ");
      console.error(error);
    }
  },

  getDepartures: async function (fetcherId) {
    try {
      let departuresData = await this.departuresFetchers[fetcherId].fetchDepartures();

      this.pimpDeparturesArray(departuresData.departuresArray);
      this.sendSocketNotification("DEPARTURES", departuresData);
    } catch (error) {
      console.log("Error while fetching departures (for module Instance " + fetcherId + "): " + error);
      // Add stationId to error for identification in the main instance
      error.fetcherId = fetcherId;
      error.message = error;
      this.sendSocketNotification("FETCH_ERROR", error);
    }
  },

  pimpDeparturesArray: function (departuresArray) {
    let currentProperties = {};

    departuresArray.forEach((current) => {
      currentProperties = this.getLineProperties(current);

      //if (!this.config.marqueeLongDirections) {
      //    current.direction = this.trimDirectionString(current.direction);
      //}
      current.bgColor = currentProperties.bgColor;
      current.fgColor = currentProperties.fgColor;
      current.cssClass = currentProperties.cssClass;
    });

    return departuresArray;
  },

  getLineProperties: function (product) {
    let properties = {
      bgColor: "#333",
      fgColor: "#FFF",
      cssClass: "",
    };

    let type = product.type;
    let lineType = product.line;
    let name = product.name;
    let colors = {};

    switch (type) {
      case "suburban":
        colors = lineColors.suburban[name];
        properties.cssClass = "sbahnsign";
        break;
      case "subway":
        colors = lineColors.subway[name];
        properties.cssClass = "ubahnsign";
        break;
      case "bus":
        colors.bg = "#B60079";
        colors.fg = "#FFF";
        properties.cssClass = "bussign";
        break;
      case "tram":
        colors = lineColors.tram[name];
        properties.cssClass = "tramsign";
        break;
      case "regional":
        colors = lineColors.regional[name];
        properties.cssClass = "dbsign";
        break;
      case "express":
        if (lineType === "LOCOMORE") {
          colors.bg = "#E5690B";
          colors.fg = "#3E1717";
          properties.cssClass = "locsign";
        } else {
          properties.cssClass = "expresssign";
        }
        break;
    }

    // Change default values if we changed them
    if (colors != undefined) {
      if ("bg" in colors) {
        properties.bgColor = colors.bg;
      }
  
      if ("fg" in colors) {
        properties.fgColor = colors.fg;
      }
    }
    else {
      // If no color has been found for the line, default to grey
      properties.bgColor = "#535353";
      properties.fgColor = "#fff";
    }

    return properties;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_DEPARTURES") {
      this.getDepartures(payload);
    }

    if (notification === "CREATE_FETCHER") {
      this.createFetcher(payload);
    }

    if (notification === "STATION_NAME_MISSING_AFTER_INIT") {
      this.sendInit(this.departuresFetchers[payload]);
    }
  },
});
