"use strict";
const vbbClient = require('vbb-client');

var VbbFetcher = function (config){

    this.config = config;

    this.getStationName().then((res) => {
        console.log("Fetcher for station " + res + " created. (Station ID: " + this.config.stationId + ")")
    })
}

VbbFetcher.prototype.getStationId = function() {
    return this.config.stationId;
}

VbbFetcher.prototype.getStationName = function() {
    return vbbClient.station(this.config.stationId).then( (response) => {
        return response.name;
    })
}


VbbFetcher.prototype.fetchDepartures = function() {
    var now = new Date();
    var opt = {
        when: now.setMinutes(now.getMinutes()),
        duration: this.config.departureMinutes,
       // identifier: "Testing - MagicMirror module MMM-PublicTransportBerlin"    // send testing identifier
    }

    return vbbClient.departures(this.config.stationId, opt).then( (response) => {
        return this.processData(response)
    });
}

VbbFetcher.prototype.processData = function(data) {

    var departuresData = {
        stationId: this.config.stationId,
        stationName: "",
        departuresArray: []
    }

    data.forEach( (row) => {

        let delay = row.delay;

        if (!delay){
            row.delay = 0
        }

        var dateObject = new Date(row.when);

        var current = {
            when: dateObject,
            delay: row.delay,
            line: row.product.line,
            nr: row.product.nr,
            type: row.product.type.type,
            color: row.product.type.color,
            direction: row.direction
        }

        departuresData.departuresArray.push(current);
    })

    departuresData.departuresArray.sort(compare);

    return this.getStationName(this.config.stationId).then( (name) => {
        departuresData.stationName = name;
        return departuresData;
    });
}

function compare(a,b) {

    // delay must be converted to milliseconds
    var timeA = a.when.getTime() + a.delay * 1000;
    var timeB = b.when.getTime() + b.delay * 1000;

    if(timeA < timeB) {
        return -1;
    }
    if(timeA > timeB){
        return 1
    }
    return 0
}

module.exports = VbbFetcher;