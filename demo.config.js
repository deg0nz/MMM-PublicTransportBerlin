const config = {
  address: "0.0.0.0",
  ipWhitelist: [],
  logLevel: ["INFO", "LOG", "WARN", "ERROR", "DEBUG"],
  modules: [
    {
      module: "clock",
      position: "middle_center"
    },
    {
      module: "MMM-PublicTransportBerlin",
      position: "top_left",
      config: {
        stationId: "900100003",             // Alexanderplatz
        travelTimeToStation: 10,            // How long do you need to walk to the next station?
        interval: 120000,                   // How often should the table be updated in ms?
        departureMinutes: 30,               // For how many minutes should departures be shown?
        showColoredLineSymbols: true,       // Want colored line symbols?
        useColorForRealtimeInfo: true,      // Want colored real time information (delay, early)?
        showTableHeaders: true,             // Show table headers?
        showTableHeadersAsSymbols: true,    // Table headers as symbols or written?
        maxUnreachableDepartures: 3,        // How many unreachable departures should be shown?
        maxReachableDepartures: 7,          // How many reachable departures should be shown?
        fadeUnreachableDepartures: true,
        fadeReachableDepartures: true,
        marqueeLongDirections: true
      }
    }
  ]
};

/** ************* DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = config;
}
