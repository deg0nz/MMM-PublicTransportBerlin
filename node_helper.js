"use strict";
const NodeHelper = require("node_helper");
const VbbFetcher = require("./VbbFetcher");

module.exports = NodeHelper.create({

    start: function () {
        this.departuresFetchers = []
    },

    createFetcher: function (config) {
        let fetcher;

        if (typeof this.departuresFetchers[config.stationId] === "undefined") {

            fetcher = new VbbFetcher(config);
            this.departuresFetchers[config.stationId] = fetcher;
            this.sendInit(fetcher);

            fetcher.getStationName().then((res) => {
                console.log("Transportation fetcher for station " + res + " created. (Station ID: " + fetcher.getStationId() + ")");
            })
        } else {
            fetcher = this.departuresFetchers[config.stationId];
            this.sendInit(fetcher);

            fetcher.getStationName().then((res) => {
                console.log("Using existing transportation fetcher for station " + res + " (Station ID: " + fetcher.getStationId() + ")");
            });
        }
        this.getDepartures(fetcher.getStationId());
    },

    sendInit: function (fetcher) {
        fetcher.getStationName().then((name) => {
            this.sendSocketNotification("FETCHER_INIT", {
                stationId: fetcher.getStationId(),
                stationName: name
            });
        });
    },

    getDepartures: function (stationId) {
        this.departuresFetchers[stationId].fetchDepartures().then((departuresData) => {
            this.pimpDeparturesArray(departuresData.departuresArray);
            this.sendSocketNotification("DEPARTURES", departuresData);
        }).catch((e) => {
            let error = {};
            console.log("Error while fetching departures (for Station ID " + stationId + "): " + e);
            // Add stationId to error for identification in the main instance
            error.stationId = stationId;
            error.message = e;
            this.sendSocketNotification("FETCH_ERROR", error);
        });
    },

    pimpDeparturesArray: function (departuresArray) {
        let currentProperties = {};

        departuresArray.forEach((current) => {
            currentProperties = this.getLineProperties(current);

            //if (!this.config.marqueeLongDirections) {
            //    current.direction = this.trimDirectionString(current.direction);
            //}
            current.color = currentProperties.color;
            current.cssClass = currentProperties.cssClass;
        });

        return departuresArray;
    },

    getLineProperties: function (product) {
        let out = {
            color: "",
            cssClass: ""
        };

        let type = product.type;
        let lineType = product.line;
        let lineNumber = product.nr;

        switch (type) {
            case "suburban":
                out.color = this.getSuburbanLineColor(lineNumber);
                out.cssClass = "sbahnsign";
                break;
            case "subway":
                out.color = this.getSubwayLineColor(lineNumber);
                out.cssClass = "ubahnsign";
                break;
            case "bus":
                out.color = "#B60079";
                out.cssClass = "bussign";
                break;
            case "tram":
                out.color = "#BE1414";
                out.cssClass = "tramsign";
                break;
            case "regional":
                out.color = "#BE1414";
                out.cssClass = "dbsign";
                break;
            case "express":
                if (lineType === "LOCOMORE") {
                    out.cssClass = "locsign";
                } else {
                    out.cssClass = "expresssign";
                }
                out.color = this.getExpressLineColor(lineType);
                break;
        }
        
        return out;
    },

    getSuburbanLineColor: function (lineNumber) {
        let color;

        switch (lineNumber) {

            case 1:
                color = "#F414A0";
                break;
            case 2:
                color = "#006529";
                break;
            case 3:
                color = "#053983";
                break;
            case 5:
                color = "#FF3E00";
                break;
            case 7:
                color = "#7A3F9D";
                break;
            case 8:
                color = "#00B123";
                break;
            case 9:
                color = "#980026";
                break;
            case 25:
                color = "#006529";
                break;
            case 41:
                color = "#B02C00";
                break;
            case 42:
                color = "#CF6423";
                break;
            case 45:
            case 46:
            case 47:
                color = "#CC8625";
                break;
            case 75:
                color = "#7A3F9D";
                break;
            case 85:
                color = "#00B123";
                break;
        }

        return color;
    },

    getSubwayLineColor: function (lineNumber) {
        let color;

        switch (lineNumber) {
            case 1:
            case 12:
                color = "#7DAD4C";
                break;
            case 2:
                color = "#DA421E";
                break;
            case 3:
                color = "#007A5B";
                break;
            case 4:
                color = "#F0D722";
                break;
            case 5:
            case 55:
                color = "#7E5330";
                break;
            case 6:
                color = "#8C6DAB";
                break;
            case 7:
                color = "#528DBA";
                break;
            case 8:
                color = "#224F86";
                break;
            case 9:
                color = "#F3791D";
                break;
        }

        return color;
    },

    getExpressLineColor: function (lineNumber) {
        let color;

        switch (lineNumber) {
            case "LOCOMORE":
                color = "#E5690B";
                break;
            default:
                color = "#000000";
                break;
        }

        return color;
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
    }
});
