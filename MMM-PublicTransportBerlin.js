"use strict";

Module.register("MMM-PublicTransportBerlin", {

    // default values
    defaults: {
        name: "MMM-PublicTransportBerlin",
        hidden: false,
        stationId: 900000160003,
        ignoredStations: [],                // Which stations should be ignored? (comma-separated list of station IDs)
        ignoredLines: [],                   // Which lines should be ignored? (comma-separated list of line names)
        excludedTransportationTypes: '',    // Which transportation types should not be shown on the mirror? (comma-separated list of types) possible values: bus,tram,suburban,subway,ferry
        marqueeLongDirections: true,        // Use Marquee effect for long station names?
        delay: 10,                          // How long do you need to walk to the next Station?
        interval: 120000,                   // How often should the table be updated in ms?
        departureMinutes: 30,               // For how many minutes should departures be shown?
        showColoredLineSymbols: true,       // Want colored line symbols?
        useColorForRealtimeInfo: true,      // Want colored real time information (delay, early)?
        showTableHeaders: true,             // Show table headers?
        showTableHeadersAsSymbols: true,    // Table Headers as symbols or written?
        maxUnreachableDepartures: 3,        // How many unreachable departures should be shown?
        maxReachableDepartures: 7,          // How many reachable departures should be shown?
        fadeUnreachableDepartures: true,
        fadeReachableDepartures: true,
        fadePointForReachableDepartures: 0.25
    },

    start: function () {
        Log.info("Starting module: " + this.name);

        this.departuresArray = [];
        this.stationName = "";
        this.loaded = false;

        this.sendSocketNotification('CREATE_FETCHER', this.config);

        if(this.config.delay < 0) {
            this.config.delay = 0;
        }

        // set minimum interval to 30 seconds
        if (this.config.interval < 30000) {
            this.config.interval = 30000;
        }

        setInterval(() => {
            this.sendSocketNotification('GET_DEPARTURES', this.config.stationId);
        }, this.config.interval)
    },

    getDom: function () {

        let wrapper = document.createElement("div");
        wrapper.className = "ptbWrapper";

        if (this.departuresArray.length === 0 && !this.loaded) {
            wrapper.innerHTML = (this.loaded) ? this.translate("EMPTY") : this.translate("LOADING");
            wrapper.className = "small light dimmed";
            return wrapper;
        }

        let heading = document.createElement("header");
        heading.innerHTML = this.stationName;
        wrapper.appendChild(heading);


        // Table header
        let table = document.createElement("table");
        table.className = "ptbTable small light";

        let tHead = document.createElement("thead");

        let headerRow = document.createElement("tr");

        // Cell for departure time
        let headerTime = document.createElement("td");
        if (this.config.showTableHeadersAsSymbols) {
            headerTime.className = "centeredTd";
            let timeIcon = document.createElement("span");
            timeIcon.className = "fa fa-clock-o";
            headerTime.appendChild(timeIcon);
        } else {
            headerTime.innerHTML = "Abfahrt";
        }

        headerRow.appendChild(headerTime);

        // Cell for delay time
        let delayTime = document.createElement("td");
        delayTime.innerHTML = "&nbsp;";
        headerRow.appendChild(delayTime);

        // Cell for line symbol
        let headerLine = document.createElement("td");
        if (this.config.showTableHeadersAsSymbols) {
            headerLine.className = "centeredTd";
            let lineIcon = document.createElement("span");
            lineIcon.className = "fa fa-tag";
            headerLine.appendChild(lineIcon);
        } else {
            headerLine.innerHTML = "Linie";
        }

        headerRow.appendChild(headerLine);

        // Cell for direction
        let headerDirection = document.createElement("td");
        if (this.config.showTableHeadersAsSymbols) {
            headerDirection.className = "centeredTd";
            let directionIcon = document.createElement("span");
            directionIcon.className = "fa fa-exchange";
            headerDirection.appendChild(directionIcon);
        } else {
            headerDirection.innerHTML = "Nach";
        }

        headerRow.appendChild(headerDirection);

        headerRow.className = "bold dimmed";

        if (this.config.showTableHeaders) {
            tHead.appendChild(headerRow);
        }

        table.appendChild(tHead);

        // Create table body from data
        let tBody = document.createElement("tbody");

        // Handle empty departures array
        if (this.departuresArray.length === 0) {
            let row = this.getNoDeparturesRow("There are currently no departures.");

            tBody.appendChild(row);

            table.appendChild(tBody);

            wrapper.appendChild(table);

            return wrapper;
        }

        // handle delay === 0
        if (this.config.delay === 0) {
            this.departuresArray.forEach((current, i) => {
                if (i < this.config.maxReachableDepartures) {
                    let row = this.getRow(current);
                    tBody.appendChild(row);

                    // fading
                    if (this.config.fadeReachableDepartures && this.config.fadePointForReachableDepartures < 1) {
                        if (this.config.fadePointForReachableDepartures < 0) {
                            this.config.fadePointForReachableDepartures = 0;
                        }
                        let startingPoint = this.config.maxReachableDepartures * this.config.fadePointForReachableDepartures;
                        let steps = this.config.maxReachableDepartures - startingPoint;
                        if (i >= startingPoint) {
                            let currentStep = i - startingPoint;
                            row.style.opacity = 1 - (1 / steps * currentStep);
                        }
                    }
                }
            });

        // handle delay > 0
        } else {
            this.getFirstReachableDeparturePosition().then((reachableDeparturePos) => {
                this.departuresArray.forEach((current, i) => {

                    if (i >= reachableDeparturePos - this.config.maxUnreachableDepartures
                        && i < reachableDeparturePos + this.config.maxReachableDepartures) {

                        // insert rule to separate reachable departures
                        if (i === reachableDeparturePos
                            && reachableDeparturePos !== 0
                            && this.config.maxUnreachableDepartures !== 0) {

                            let ruleRow = document.createElement("tr");

                            let ruleTimeCell = document.createElement("td");
                            ruleRow.appendChild(ruleTimeCell);

                            let ruleCell = document.createElement("td");
                            ruleCell.colSpan = 3;
                            ruleCell.className = "ruleCell";
                            ruleRow.appendChild(ruleCell);

                            tBody.appendChild(ruleRow);
                        }

                        // create standard row
                        let row = this.getRow(current);

                        // fading for entries before "delay rule"
                        if (this.config.fadeUnreachableDepartures && this.config.delay > 0) {
                            let steps = this.config.maxUnreachableDepartures;
                            if (i >= reachableDeparturePos - steps && i < reachableDeparturePos) {
                                let currentStep = reachableDeparturePos - i;
                                row.style.opacity = 1 - ((1 / steps * currentStep) - 0.2);
                            }
                        }

                        // fading for entries after "delay rule"
                        if (this.config.fadeReachableDepartures && this.config.fadePointForReachableDepartures < 1) {
                            if (this.config.fadePointForReachableDepartures < 0) {
                                this.config.fadePointForReachableDepartures = 0;
                            }
                            let startingPoint = this.config.maxReachableDepartures * this.config.fadePointForReachableDepartures;
                            let steps = this.config.maxReachableDepartures - startingPoint;
                            if (i >= reachableDeparturePos + startingPoint) {
                                let currentStep = (i - reachableDeparturePos) - startingPoint;
                                row.style.opacity = 1 - (1 / steps * currentStep);
                            }
                        }

                        tBody.appendChild(row);
                    }
                });
            }, (message) => {
                let row = this.getNoDeparturesRow(message);
                tBody.appendChild(row);
            });
        }

        table.appendChild(tBody);

        wrapper.appendChild(table);

        return wrapper;
    },

    getNoDeparturesRow: function (message) {
        let row = document.createElement("tr");
        let cell = document.createElement("td");
        cell.colSpan = 4;

        cell.innerHTML = message;

        row.appendChild(cell);

        return row;
    },

    getRow: function (current) {

        let currentWhen = moment(current.when);

        let row = document.createElement("tr");

        let timeCell = document.createElement("td");
        timeCell.className = "centeredTd timeCell";
        timeCell.innerHTML = currentWhen.format("HH:mm");
        row.appendChild(timeCell);

        let delayCell = document.createElement("td");
        delayCell.className = "delayTimeCell";

        let delay = Math.floor((((current.delay % 31536000) % 86400) % 3600) / 60);

        if (delay > 0) {
            delayCell.innerHTML = "+" + delay + " ";
            if (this.config.useColorForRealtimeInfo) {
                delayCell.style.color = "red";
            }
        } else if (delay < 0) {
            delayCell.innerHTML = delay + " ";
            if (this.config.useColorForRealtimeInfo) {
                delayCell.style.color = "green";
            }
        } else if (delay === 0) {
            delayCell.innerHTML = "";
        }

        row.appendChild(delayCell);

        let lineCell = document.createElement("td");
        let lineSymbol = this.getLineSymbol(current);
        lineCell.className = "centeredTd noPadding lineCell";

        lineCell.appendChild(lineSymbol);
        row.appendChild(lineCell);

        let directionCell = document.createElement("td");
        directionCell.className = "directionCell";

        if (this.config.marqueeLongDirections && current.direction.length >= 26) {
            directionCell.className = "directionCell marquee";
            let directionSpan = document.createElement("span");
            directionSpan.innerHTML = current.direction;
            directionCell.appendChild(directionSpan);
        } else {
            directionCell.innerHTML = this.trimDirectionString(current.direction);
        }

        row.appendChild(directionCell);

        return row;
    },

    getFirstReachableDeparturePosition: function () {
        let now = moment();
        let nowWithDelay = now.add(this.config.delay, 'minutes');

        return new Promise((resolve, reject) => {
            this.departuresArray.forEach((current, i, depArray) => {
                let currentWhen = moment(current.when);
                if (depArray.length > 1 && i < depArray.length - 1) {
                    let nextWhen = moment(depArray[i + 1].when);
                    if ((currentWhen.isBefore(nowWithDelay) && nextWhen.isSameOrAfter(nowWithDelay))
                        || (i === 0 && nextWhen.isSameOrAfter(nowWithDelay))) {

                        Log.log("--> Reachable departure for " + this.stationName + ": " + i);

                        resolve(i);
                    }
                } else if (i === depArray.length - 1 && currentWhen.isBefore(nowWithDelay)) {
                    Log.log("--> No reachable departure for " + this.stationName + " found.");

                    reject("No reachable departures found.");
                } else {
                    reject("No reachable departures found.");
                }
            });
        });
    },

    trimDirectionString: function (string) {

        let dirString = string;

        if (dirString.indexOf(',') > -1) {
            dirString = dirString.split(',')[0]
        }

        let viaIndex = dirString.search(/( via )/g);
        if (viaIndex > -1) {
            dirString = dirString.split(/( via )/g)[0]
        }

        return dirString
    },

    getLineSymbol: function (product) {
        let symbol = document.createElement('div');

        console.log(product);
        if (product.type === 'express') {
            if (product.name === 'LOCOMORE')
                symbol.innerHTML = 'LOC';
            else
                symbol.innerHTML = 'ICE';
        } else {
            symbol.innerHTML = product.name;
        };
        
        symbol.className = product.cssClass + " xsmall";

        if (this.config.showColoredLineSymbols) {
            symbol.style.backgroundColor = product.color;
        } else {
            symbol.style.backgroundColor = "#333333";
        }

        return symbol;
    },

    getStyles: function () {
        return [
            'style.css',
            'font-awesome.css'
        ];
    },

    getScripts: function () {
        return [
            "moment.js",
            this.file('./vendor/bluebird-3.4.5.min.js')
        ];
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'FETCHER_INIT') {
            if (payload.stationId === this.config.stationId) {
                this.stationName = payload.stationName;
                this.loaded = true;
            }
        }

        if (notification === 'DEPARTURES') {
            this.config.loaded = true;
            if (payload.stationId === this.config.stationId) {
                this.departuresArray = payload.departuresArray;
                this.updateDom(3000);
            }
        }
    }
});
