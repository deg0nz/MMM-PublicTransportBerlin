/* global Module moment Log */

Module.register("MMM-PublicTransportBerlin", {
  // default values
  // prettier-ignore
  defaults: {
    name: "MMM-PublicTransportBerlin",  // The name of this module
    hidden: false,                      // Hide this module?
    stationId: "900160003",             // The ID of the station
    // directionStationId: 0,           // The stationId of the next station in which direction departures should be shown
    ignoredLines: [],                   // Which lines should be ignored? (comma-separated list of line names)
    excludedTransportationTypes: "",    // Which transportation types should not be shown on the mirror? (comma-separated list of types) possible values: bus,tram,suburban,subway,ferry
    marqueeLongDirections: true,        // Use Marquee effect for long station names?
    travelTimeToStation: 10,            // How long do you need to walk/bike to the next Station?
    interval: 120000,                   // How often should the table be updated in ms?
    departureMinutes: 30,               // For how many minutes should departures be shown?
    showColoredLineSymbols: true,       // Want colored line symbols?
    useColorForRealtimeInfo: true,      // Want colored real time information (delay, early)?
    useBrightScheme: false,             // Brighten the display table
    showTableHeaders: true,             // Show table headers?
    showTableHeadersAsSymbols: true,    // Table Headers as symbols or written?
    maxUnreachableDepartures: 3,        // How many unreachable departures should be shown?
    maxReachableDepartures: 7,          // How many reachable departures should be shown?
    fadeUnreachableDepartures: true,    // Should unreachable departures be faded away from the reachable departures line?
    fadeReachableDepartures: true,      // Should reachable departures be faded away from the reachable departures line?
    fadePointForReachableDepartures: 0.25,  // The point to start fading the reachable departures
    excludeDelayFromTimeLabel: false,   // Should the delay time be excluded from the time label?
    showDirection: true,                // Adds direction of the module instance to the header if the instance is directed
    animationSpeed: 3000,               // Speed of the update animation. (milliseconds)
    timezone: "Europe/Berlin",          // Timezone
    shortenStationNames: true           // Shorten station names? See https://github.com/derhuerst/vbb-short-station-name
  },

  start() {
    Log.info(
      `Starting module: ${this.name} with identifier: ${this.identifier}`
    );

    this.departuresArray = [];
    this.loaded = false;
    this.error = {};
    this.configIssueDetected = false;
    this.config.identifier = this.identifier;

    // If the stationId is not a string, we'll print a warning
    if (typeof this.config.stationId === "number") {
      Log.warn(
        "MMM-PublicTransportBerlin deprecation warning: The stationId must be a String! Please check your configuration!"
      );
      this.configIssueDetected = true;
    }

    // If the stationId is an old id, we'll print a warning
    // (This test is for the migration to hafas-client v6. After a reasonable time (perhaps a year) after the migration, this test could be removed.)
    if (this.config.stationId.length === 12) {
      Log.warn(
        "MMM-PublicTransportBerlin deprecation warning: You are using an old stationId. Please change your configuration!"
      );
      this.configIssueDetected = true;
    }

    // Provide backwards compatibility for refactoring of config.delay to config.travelTimeToStation
    if (this.config.delay) {
      Log.warn(
        "MMM-PublicTransportBerlin deprecation warning: The delay option has been renamed to travelTimeToStation. Please change your configuration!"
      );
      this.config.travelTimeToStation = this.config.delay;
      this.configIssueDetected = true;
    }

    if (!this.configIssueDetected) {
      this.sendSocketNotification("CREATE_FETCHER", this.config);

      // Handle negative travelTimeToStation
      if (this.config.travelTimeToStation < 0) {
        this.config.travelTimeToStation = 0;
      }

      // Handle missing ignored lines
      if (typeof this.config.ignoredLines === "undefined") {
        this.config.ignoredLines = [];
      }

      // set minimum interval to 30 seconds
      if (this.config.interval < 30000) {
        this.config.interval = 30000;
      }

      setInterval(() => {
        Log.log(`Fetching Departures for ${this.config.name}`);
        this.sendSocketNotification("FETCH_DEPARTURES", this.identifier);
      }, this.config.interval);
    }
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "ptb-wrapper";

    if (this.configIssueDetected) {
      // Show issue message if there is a configuartion issue
      const issueDiv = document.createElement("div");
      issueDiv.className = "ptb-issue-div";
      issueDiv.innerHTML = `MMM-PublicTransportBerlin: ${this.translate(
        "CONFIG_ISSUE"
      )}`;
      wrapper.appendChild(issueDiv);
    } else if (this.departuresArray.length === 0 && !this.loaded) {
      // Handle loading sequence at init time
      wrapper.innerHTML = this.loaded
        ? this.translate("EMPTY")
        : this.translate("LOADING");
      wrapper.className = "small light dimmed";
    } else {
      const heading = document.createElement("header");
      heading.innerHTML = this.stationName;
      wrapper.appendChild(heading);

      // Handle departure fetcher error and show it on the screen
      if (Object.keys(this.error).length > 0) {
        const errorContent = document.createElement("div");
        errorContent.innerHTML = `${this.translate(
          "FETCHER_ERROR"
        )}: ${JSON.stringify(this.error.hafasMessage)}<br>`;
        errorContent.innerHTML += this.translate("NO_VBBDATA_ERROR_HINT");
        errorContent.className = "small light dimmed ptb-error-cell";
        wrapper.appendChild(errorContent);
      } else {
        // The table
        const table = document.createElement("table");
        table.className = `ptb-table small${
          this.config.useBrightScheme ? "" : " light"
        }`;

        // Table header (thead tag is mandatory)
        const tHead = document.createElement("thead");

        if (this.config.showTableHeaders) {
          const headerRow = this.getTableHeaderRow();
          tHead.appendChild(headerRow);
        }

        table.appendChild(tHead);

        // Create table body from data
        const tBody = document.createElement("tbody");

        // Handle empty departures array
        if (this.departuresArray.length === 0) {
          const row = this.getNoDeparturesRow(
            this.translate("NO_DEPARTURES_AVAILABLE")
          );

          tBody.appendChild(row);
          table.appendChild(tBody);
          wrapper.appendChild(table);
        } else {
          // Create all the content rows
          try {
            const reachableDeparturePos =
              this.getFirstReachableDeparturePosition();

            this.departuresArray.forEach((currentDeparture, i) => {
              if (
                i >=
                reachableDeparturePos -
                this.config.maxUnreachableDepartures &&
                i < reachableDeparturePos + this.config.maxReachableDepartures
              ) {
                // Insert rule to separate reachable from unreachable departures
                if (
                  reachableDeparturePos !== 0 &&
                  reachableDeparturePos === i &&
                  this.config.maxUnreachableDepartures !== 0
                ) {
                  const ruleRow = this.getRuleRow();
                  tBody.appendChild(ruleRow);
                }

                // create standard row
                const row = this.getRow(currentDeparture);
                row.style.opacity = this.getRowOpacity(
                  i,
                  reachableDeparturePos
                );

                tBody.appendChild(row);
              }
            });
          } catch (e) {
            const row = this.getNoDeparturesRow(e.message);
            tBody.appendChild(row);
          }

          table.appendChild(tBody);
          wrapper.appendChild(table);
        }
      }
    }
    return wrapper;
  },

  getRowOpacity(i, reachableDeparturePos) {
    // Per default, opacity is at 100%
    let opacity = 1;

    // Handle unreachable departures
    if (
      this.config.fadeUnreachableDepartures &&
      this.config.travelTimeToStation > 0
    ) {
      const steps = this.config.maxUnreachableDepartures;

      if (i >= reachableDeparturePos - steps && i < reachableDeparturePos) {
        const currentStep = reachableDeparturePos - i;
        opacity = 1 - (1 / steps * currentStep - 0.2);
      }
    }

    // Handle reachable departures
    if (
      this.config.fadeReachableDepartures &&
      this.config.fadePointForReachableDepartures < 1 &&
      i >= reachableDeparturePos
    ) {
      // Handle negative fading point
      if (this.config.fadePointForReachableDepartures < 0) {
        this.config.fadePointForReachableDepartures = 0;
      }

      const startingPoint =
        this.config.maxReachableDepartures *
        this.config.fadePointForReachableDepartures;
      const steps = this.config.maxReachableDepartures - startingPoint;
      if (i >= startingPoint) {
        const currentStep = i - reachableDeparturePos - startingPoint;
        opacity = 1 - 1 / steps * currentStep;
      }
    }

    return opacity;
  },

  getRuleRow() {
    const ruleRow = document.createElement("tr");

    const ruleTimeCell = document.createElement("td");
    ruleRow.appendChild(ruleTimeCell);

    const ruleCell = document.createElement("td");
    ruleCell.colSpan = 3;
    ruleCell.className = "ptb-rule-cell";
    ruleRow.appendChild(ruleCell);

    return ruleRow;
  },

  getTableHeaderRow() {
    const headerRow = document.createElement("tr");

    // Cell for departure time
    const headerTime = document.createElement("td");
    headerTime.className = "ptb-centered-td";

    if (this.config.showTableHeadersAsSymbols) {
      const timeIcon = document.createElement("span");
      timeIcon.className = "fa fa-clock-o";
      headerTime.appendChild(timeIcon);
    } else {
      headerTime.innerHTML = this.translate("WHEN");
    }

    headerRow.appendChild(headerTime);

    // Cell for travelTimeToStation time
    const delayTime = document.createElement("td");
    delayTime.innerHTML = "&nbsp;";
    headerRow.appendChild(delayTime);

    // Cell for line symbol
    const headerLine = document.createElement("td");
    headerLine.className = "ptb-centered-td";

    if (this.config.showTableHeadersAsSymbols) {
      const lineIcon = document.createElement("span");
      lineIcon.className = "fa fa-tag";
      headerLine.appendChild(lineIcon);
    } else {
      headerLine.innerHTML = this.translate("LINE");
    }

    headerRow.appendChild(headerLine);

    // Cell for direction
    const headerDirection = document.createElement("td");
    headerDirection.className = "ptb-centered-td";

    if (this.config.showTableHeadersAsSymbols) {
      const directionIcon = document.createElement("span");
      directionIcon.className = "fa fa-exchange";
      headerDirection.appendChild(directionIcon);
    } else {
      headerDirection.innerHTML = this.translate("DIRECTION");
    }

    headerRow.appendChild(headerDirection);
    headerRow.className = "bold dimmed";

    return headerRow;
  },

  getNoDeparturesRow(message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 4;
    cell.innerHTML = message;

    row.appendChild(cell);

    return row;
  },

  getRow(currentDeparture) {
    let currentWhen = moment(currentDeparture.when).tz(this.config.timezone);
    const delay = this.convertDelayToMinutes(currentDeparture.delay);

    if (this.config.excludeDelayFromTimeLabel) {
      currentWhen = this.getDepartureTimeWithoutDelay(currentWhen, delay);
    }

    const row = document.createElement("tr");

    const timeCell = document.createElement("td");
    timeCell.className = `ptb-centered-td ptb-time-cell ${
      this.config.useBrightScheme ? " light" : ""
    }`;
    timeCell.innerHTML = currentWhen.format("HH:mm");
    row.appendChild(timeCell);

    const delayCell = document.createElement("td");
    delayCell.className = "ptb-delay-time-cell";

    if (delay > 0) {
      delayCell.innerHTML = `+${delay} `;
      if (this.config.useColorForRealtimeInfo) {
        delayCell.style.color = "red";
      }
    } else if (delay < 0) {
      delayCell.innerHTML = `${delay} `;
      if (this.config.useColorForRealtimeInfo) {
        delayCell.style.color = "green";
      }
    } else if (delay === 0) {
      delayCell.innerHTML = "";
    }

    row.appendChild(delayCell);

    const lineCell = document.createElement("td");
    const lineSymbol = this.getLineSymbol(currentDeparture);
    lineCell.className = "ptb-centered-td ptb-no-padding ptb-line-cell";

    lineCell.appendChild(lineSymbol);
    row.appendChild(lineCell);

    const directionCell = document.createElement("td");
    directionCell.className = `directionCell ${
      this.config.useBrightScheme ? " bright" : ""
    }`;

    if (
      this.config.marqueeLongDirections &&
      currentDeparture.direction.length >= 26
    ) {
      directionCell.className = `ptb-direction-cell ptb-marquee${
        this.config.useBrightScheme ? " bright" : ""
      }`;
      const directionSpan = document.createElement("span");
      directionSpan.innerHTML = currentDeparture.direction;
      directionCell.appendChild(directionSpan);
    } else {
      directionCell.innerHTML = this.trimDirectionString(
        currentDeparture.direction
      );
    }

    row.appendChild(directionCell);

    // Add ptb-cancelled class to this row if the trip was cancelled
    if (currentDeparture.cancelled) {
      row.classList.add("ptb-cancelled");
    }

    return row;
  },

  getDepartureTimeWithoutDelay(departureTime, delay) {
    if (delay > 0) {
      departureTime.subtract(delay, "minutes");
    } else if (delay < 0) {
      departureTime.add(Math.abs(delay), "minutes");
    }

    return departureTime;
  },

  getFirstReachableDeparturePosition() {
    const now = moment();
    const nowWithDelay = now.add(this.config.travelTimeToStation, "minutes");
    let result = 0;

    if (this.config.travelTimeToStation !== 0) {
      this.departuresArray.forEach((departure, i) => {
        const currentWhen = moment(this.departuresArray[i].when);
        const nextWhen = i < this.departuresArray.length - 1 ? moment(this.departuresArray[i + 1].when) : null;


        if (
          currentWhen.isBefore(nowWithDelay) &&
          (nextWhen && nextWhen.isSameOrAfter(nowWithDelay) || i === 0 && nextWhen && nextWhen.isSameOrAfter(nowWithDelay))
        ) {
          result = i;
        } else if (i === this.departuresArray.length - 1 && currentWhen.isBefore(nowWithDelay)) {
          throw new Error(this.translate("NO_REACHABLE_DEPARTURES"));
        }
      });
    }
    return result;
  },

  trimDirectionString(string) {
    let dirString = string;

    if (dirString.indexOf(",") > -1) {
      dirString = dirString.split(",")[0];
    }

    const viaIndex = dirString.search(/( via )/gu);
    if (viaIndex > -1) {
      dirString = dirString.split(/( via )/gu)[0];
    }

    return dirString;
  },

  getLineSymbol(product) {
    const symbol = document.createElement("div");

    if (product.type === "express") {
      if (product.name === "LOCOMORE") {
        symbol.innerHTML = "LOC";
      } else {
        symbol.innerHTML = "ICE";
      }
    } else {
      symbol.innerHTML = product.name;
    }

    symbol.classList.add(product.cssClass);
    symbol.classList.add("xsmall");

    if (this.config.showColoredLineSymbols) {
      symbol.style.backgroundColor = product.bgColor;
      symbol.style.color = product.fgColor;
    } else {
      symbol.style.backgroundColor = "#333333";
      symbol.style.color = "#FFFFFF";
    }

    return symbol;
  },

  convertDelayToMinutes(delay) {
    return Math.floor(delay % 31536000 % 86400 % 3600 / 60);
  },

  getTranslations() {
    return {
      en: "translations/en.json",
      de: "translations/de.json"
    };
  },

  getStyles() {
    return ["style.css", "font-awesome.css"];
  },

  getScripts() {
    return ["moment.js", "moment-timezone.js"];
  },

  socketNotificationReceived(notification, payload) {
    if (payload.fetcherId === this.identifier) {
      switch (notification) {
        case "FETCHER_INITIALIZED":
          this.stationName = payload.stationName;
          this.loaded = true;
          break;

        case "DEPARTURES_FETCHED":
          this.loaded = true;
          // Empty error object
          this.error = {};
          // Proceed with normal operation
          this.departuresArray = payload.departuresArray;
          this.updateDom(this.config.animationSpeed);
          break;

        case "FETCH_ERROR":
          this.loaded = true;
          this.error = payload;
          this.updateDom(this.config.animationSpeed);
      }
    }
  }
});
