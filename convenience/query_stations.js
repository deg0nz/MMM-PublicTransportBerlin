/* eslint-disable no-console */
const createClient = require("hafas-client");
const readline = require("readline");

let profileName = "";
let profile = "bvg";
const productMap = {
  bus: "Bus",
  ferry: "Fähre",
  national: "Fernverkehr",
  nationalExpress: "Fernverkehr",
  regional: "Regionalverkehr",
  suburban: "S-Bahn",
  subway: "U-Bahn",
  taxi: "Taxi",
  tram: "Tram"
};

/**
 * Create an array without values that occur multiple times.
 *
 * @param {array} array An array that could have duplicate values.
 * @returns {array} An array without duplicate values.
 */
function arrayUnique(array) {
  return [...new Set(array)];
}

/**
 * Get proper names for the product keys.
 *
 * @param {object} products An object with the available transport products as a keys.
 * @returns {string} A list of transport products as a string.
 */
function refineProducts(products) {
  if (!products) {
    return "none";
  }

  const availableProducts = Object.keys(products).filter(
    (key) => products[key]
  );

  const availableProductsReadable = arrayUnique(
    availableProducts.map((product) => productMap[product])
  );

  return availableProductsReadable.join(", ");
}

/**
 * Output the information about the station on the console.
 *
 * @param {object} station The station it's about.
 */
function printStationInfo(station) {
  if (station.id && station.name) {
    console.info(
      ` > Stop: ${station.name}\n   ID: ${
        station.id
      }\n   Transport product(s): ${refineProducts(station.products)} \n`
    );
  }
}

if (process.argv.length === 3) {
  profileName = process.argv[2];
  console.info(`Using hafas-client profile: ${profileName}`);
} else {
  console.info("Using default hafas-client profile: 'db'");
  profileName = "db";
}

try {
  profile = require(`hafas-client/p/${profileName}`);
} catch (err) {
  console.error(`\n${err.message}\n Did you choose the right profile name? \n`);
}

if (profile !== "") {
  const client = createClient(profile, "MMM-PublicTransportHafas");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Enter an address or station name: ", (answer) => {
    rl.close();

    const opt = {
      results: 10,
      stations: true,
      adresses: false,
      poi: false
    };

    client
      .locations(answer, opt)
      .then((response) => {
        console.info(`\nStops found for '${answer}':\n`);
        response.forEach((station) => {
          printStationInfo(station);
        });
        process.exit(0);
      })
      .catch(console.error);
  });

  if (process.argv.length === 3) {
    profileName = process.argv[2];
    console.info(`Using hafas-client profile: ${profileName}\n`);
  } else {
    console.info("Using default hafas-client profile: 'bvg'");
    profileName = "bvg";
  }
}
