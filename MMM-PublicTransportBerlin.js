"use strict";

Module.register("MMM-PublicTransportBerlin", {
    // default values
    // Nöldi: 9160003
    // Alex: 9100003
    defaults: {
        name: "MMM-PublicTransportBerlin",
        hidden: false,
        delay: 10,                      // How long do you need to walk to the next Station?
        interval: 120000,               // How often should the table be updated in ms?
        departureMinutes: 30,           // For how many minutes should departures be shown?
        maxDepartures: 15,              // how many departures should be shown in the widget?
        showColoredLineSymbols: true,   // Want colored line symbols?
        maxUnreachableDepartures: 3,    // How many unreachable departures should be shown?
        maxReachableDepartures: 7,      // How many reachable departures should be shown?
        fade: true,
        fadeUnreachableDepartures: true,
        fadeReachableDepartures: true,
        fadePointForReachableDepartures: 0.25,
        stationId: 9160003
    },

    start: function () {
        Log.info("Starting module: " + this.name);

        this.departuresArray = [];
        this.stationName = "";
        this.loaded = false;
        this.firstReachableDepartureFound = false;

        this.sendSocketNotification('CREATE_FETCHER', this.config);

        setTimeout(() => {
            this.sendSocketNotification('GET_DEPARTURES', this.config.stationId);
        }, 1000);

        if(this.config.interval < 30000){
            this.config.interval = 30000;
        }
        setInterval(() => {
            this.sendSocketNotification('GET_DEPARTURES', this.config.stationId);
        }, this.config.interval)
    },

    // for updating the DOM
    getDom: function () {

        this.firstReachableDepartureFound = false;

        var wrapper = document.createElement("div");
        wrapper.className = "ptbWrapper";

        if (this.departuresArray.length === 0) {
            wrapper.innerHTML = (this.loaded) ? this.translate("EMPTY") : this.translate("LOADING");
            wrapper.className = "small light dimmed";
            return wrapper;
        }

        var heading = document.createElement("header");
        heading.innerHTML = this.stationName;
        wrapper.appendChild(heading);


        // table header
        var table = document.createElement("table");
        table.className = "ptbTable small light";

        var tHead = document.createElement("thead");

        var headerRow = document.createElement("tr");

        var headerTime = document.createElement("td");
        headerTime.innerHTML = "Abfahrt";
        headerRow.appendChild(headerTime);

        var delayTime = document.createElement("td");
        delayTime.innerHTML = "&nbsp;";
        headerRow.appendChild(delayTime);

        var headerLine = document.createElement("td");
        headerLine.innerHTML = "Linie";
        headerRow.appendChild(headerLine);

        var headerDirection = document.createElement("td");
        headerDirection.innerHTML = "Nach";
        headerRow.appendChild(headerDirection);

        headerRow.className = "bold dimmed";

        tHead.appendChild(headerRow);

        table.appendChild(tHead);


        // create table body from data
        var tBody = document.createElement("tbody");

        var now = moment();

        // Das nach first rechable pos!!
        var nowWithDelay = now.add(this.config.delay, 'minutes');

        this.getFirstReachableDeparturePositionInArray(now, nowWithDelay).then((reachableDeparturePos) => {

            Log.log("getFirstReachableDeparturePositionInArray: " + reachableDeparturePos);

            this.departuresArray.forEach((current, i) => {

                if (i >= reachableDeparturePos - this.config.maxUnreachableDepartures
                    && i < reachableDeparturePos + this.config.maxReachableDepartures ) {

                    var currentWhen = moment(new Date(current.when));

                    if (i === reachableDeparturePos) {

                        var ruleRow = document.createElement("tr");
                        var ruleTimeCell = document.createElement("td");

                        var ruleCell = document.createElement("td");

                      //  var rule = document.createElement("hr");

                      //  ruleCell.appendChild(rule);
                        ruleCell.colSpan = 3;
                        ruleCell.className = "ruleCell";


                        ruleRow.appendChild(ruleTimeCell);
                        ruleRow.appendChild(ruleCell);

                        tBody.appendChild(ruleRow);
                    }


                    var row = document.createElement("tr");

                    var timeCell = document.createElement("td");

                    timeCell.innerHTML = currentWhen.format("HH:mm");
                    row.appendChild(timeCell);

                    var delayCell = document.createElement("td");
                    delayCell.className = "delayTime";

                    var delay = Math.floor((((current.delay % 31536000) % 86400) % 3600) / 60);

                    if (delay > 0) {
                        delayCell.innerHTML = "+" + delay + " ";
                        delayCell.style.color = "red";
                    } else if (delay < 0) {
                        delayCell.innerHTML = delay + " ";
                        delayCell.style.color = "green";
                    } else if (delay === 0) {
                        delayCell.innerHTML = "";
                    }

                    row.appendChild(delayCell);

                    var lineCell = document.createElement("td");
                    var lineSymbol = this.getLineSymbol(current);

                    lineCell.appendChild(lineSymbol);
                    row.appendChild(lineCell);

                    var directionCell = document.createElement("td");
                    directionCell.innerHTML = current.direction;
                    row.appendChild(directionCell);

                    // fading for entries before "delay rule"
                    if (this.config.fade && this.config.fadeUnreachableDepartures && this.config.delay > 0) {

                        var steps = this.config.maxUnreachableDepartures;

                        if (i >= reachableDeparturePos - steps && i < reachableDeparturePos) {
                            var currentStep = reachableDeparturePos - i;
                            row.style.opacity = 1 - ((1 / steps * currentStep) - 0.2);
                        }
                    }

                    // fading for entries after "delay rule"

                    if (this.config.fade && this.config.fadeReachableDepartures && this.config.fadePointForReachableDepartures < 1) {
                        if (this.config.fadePointForReachableDepartures < 0) {
                            this.config.fadePointForReachableDepartures = 0;
                        }
                        var startingPoint = this.config.maxReachableDepartures * this.config.fadePointForReachableDepartures;
                        var steps = (reachableDeparturePos + this.config.maxReachableDepartures) - startingPoint;
                        if (i >= reachableDeparturePos + startingPoint) {
                            var currentStep = (i - reachableDeparturePos) - startingPoint;
                            row.style.opacity = 1 - (1 / steps * currentStep);
                        }
                    }

                    tBody.appendChild(row);
                }

            });
        });

        table.appendChild(tBody);

        wrapper.appendChild(table);

        return wrapper;

    },

    // noch mal überprüfen!!
    getFirstReachableDeparturePositionInArray: function (now, nowWithDelay) {
        return new Promise((resolve, reject) => {
            this.departuresArray.forEach((current, i, depArray) => {
                if (i < depArray.length - 1) {
                    var currentWhen = moment(new Date(current.when));
                    var nextWhen = moment(new Date(depArray[i + 1].when));

                    if (!this.firstReachableDepartureFound && currentWhen.isSameOrBefore(nowWithDelay) && nextWhen.isAfter(nowWithDelay)) {
                        //Log.log("getFirstReachableDeparturePositionInArray: " + i);
                        resolve(i);
                    }
                }
            })
        });
    },

    getLineSymbol: function (product) {
        if (this.config.showColoredLineSymbols) {

        }
        var symbol = document.createElement('div');

        symbol.innerHTML = product.line;
        symbol.className = product.cssClass + " xsmall";
        symbol.style.backgroundColor = product.color;

        return symbol;
    },

    // Define required styles.
    getStyles: function () {
        return ['style.css'];
    },

    // Define required scripts.
    getScripts: function () {
        return [
            "moment.js",
            this.file('./vendor/bluebird-3.4.5.min.js')
        ];
    },

    socketNotificationReceived: function (notification, payload) {

        if (notification === 'DEPARTURES') {
            if (payload.stationId === this.config.stationId) {
                this.stationName = payload.stationName;
                this.departuresArray = payload.departuresArray;
                this.updateDom(3000);
            }
        }
    }
});
