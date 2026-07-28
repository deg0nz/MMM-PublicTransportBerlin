/* eslint-disable no-console */
import * as readline from "node:readline";
import {createClient} from "hafas-client";
import process from "node:process";

let profileName = "";
const productMap = {};

/**
 * Get proper names for the product keys.
 * @param {object} products An object with the available transport products as a keys.
 * @returns {string} A list of transport products as a string.
 */
function refineProducts (products) {
  if (!products) {
    return "none";
  }

  const productNames = new Set();

  for (const key of Object.keys(products)) {
    if (products[key]) {
      productNames.add(productMap[key]);
    }
  }

  const productNamesList = [...productNames].join(", ");

  return productNamesList;
}

/**
 * Output the information about the station on the console.
 * @param {object} station The station it's about.
 */
function printStationInfo (station) {
  if (station.id && station.name) {
    console.info(
      ` > Stop: ${station.name}\n   ID: ${
        station.id
      }\n   Transport product(s): ${refineProducts(station.products)} \n`
    );
  }
}

function query (profile) {
  if (profile !== "" && typeof profile !== "undefined") {
    const client = createClient(profile, "MMM-PublicTransportHafas");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question("Enter an address or station name: ", async (answer) => {
      rl.close();

      const opt = {
        addresses: false,
        poi: false,
        results: 10,
        stations: true
      };

      try {
        const response = await client.locations(
          answer,
          opt
        );
        console.info(`\nStops found for '${answer}':\n`);
        for (const station of response) {
          printStationInfo(station);
        }
      } catch (error) {
        console.error(error);
      }
    }
    );
  }
}

if (process.argv.length === 3) {
  profileName = process.argv[2];
  console.info(`Using hafas-client profile: ${profileName}\n`);
} else {
  console.info("Using default hafas-client profile: 'bvg'");
  profileName = "bvg";
}

async function importProfile () {
  const {profile} = await import(`hafas-client/p/${profileName}/index.js`);

  Object.keys(profile.products).forEach((key) => {
    const productMapKey = profile.products[key].id;
    const productMapName = profile.products[key].name;
    productMap[productMapKey] = productMapName;
  });

  query(profile);
}

try {
  importProfile();
} catch (error) {
  console.error(`${error.message}\n\n Did you choose the right profile name? \n`);
}
