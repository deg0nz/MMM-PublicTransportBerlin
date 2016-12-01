"use strict";
const NodeHelper = require('node_helper');
const Fetcher = require('./DbFetcher');
const Promise = require('./vendor/bluebird-3.4.5.min');

module.exports = NodeHelper.create({

    start: function () {
        this.departuresFetchers = []
    },

    createFetcher: function (config) {
        let fetcher;

        if (typeof this.departuresFetchers[config.stationId] === "undefined") {

            fetcher = new Fetcher(config);
            this.departuresFetchers[config.stationId] = fetcher;
            this.sendInit(fetcher);
            console.log("Transportation fetcher created. (Station ID: " + fetcher.getStationId() + ")");

        } else {

            fetcher = this.departuresFetchers[config.stationId];
            this.sendInit(fetcher);

        }
        this.getDepartures(fetcher.getStationId());
    },

    sendInit: function(fetcher){
        this.sendSocketNotification('FETCHER_INIT', {
            stationId: fetcher.getStationId(),
            stationName: 'name'
        });
    },

    getDepartures: function (stationId) {
        this.departuresFetchers[stationId].fetchDepartures().then((departuresData) => {
            this.pimpDeparturesArray(departuresData.departuresArray);
            this.sendSocketNotification('DEPARTURES', departuresData);
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
            color: "#000000",
            cssClass: ""
        };

        let type = product.type;
        let line = product.nr;

        switch (type) {
            case "suburban":
                out.color = product.color;
                out.cssClass = "sbahnsign";
                break;
            case "subway":
                out.color = product.color;
                out.cssClass = "ubahnsign";
                break;
            case "bus":
                out.color = product.color;
                out.cssClass = "bussign";
                break;
            case "tram":
                out.color = product.color;
                out.cssClass = "tramsign";
                break;
            case "regional":
                out.color = product.color;
                out.cssClass = "dbsign";
                break;
        }

        return out;
    },

    getSuburbanLineColor: function (lineNumber) {
        let color;

        return color;
    },

    getSubwayLineColor: function (lineNumber) {
        let color;
     
        return color;
    },

    socketNotificationReceived: function (notification, payload) {

        if (notification === 'GET_DEPARTURES') {

            this.getDepartures(payload);

        } else if (notification === 'CREATE_FETCHER') {

            this.createFetcher(payload);
        }
    }
});