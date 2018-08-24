# MMM-PublicTransportBerlin

MMM-PublicTransportBerlin is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by 
[Michael Teeuw](https://github.com/MichMich).

It shows live public transport information for Berlin and Brandenburg based on <strike>[VBB-Hafas](http://www.hafas.de/company/referenzen/vbb)</strike> [BVG-Hafas](https://github.com/derhuerst/bvg-rest) data.
<strike>Since it uses VBB data, the whole transport network is covered.</strike> Public transport in Brandenburg should work as well.
MMM-PublicTransportBerlin uses the <strike>[vbb-hafas](https://github.com/derhuerst/vbb-hafas) REST API</strike> [hafas-client](https://github.com/public-transport/hafas-client) with a BVG-specific profile by [derhuerst](https://github.com/derhuerst).

*Notes:* 
* *The module is working fine. But I think some value combinations could still lead to strange behaviour. I'd appreciate any error report.*

You can enter a delay time for "How long does it take to get to my station?". 
Then the module calculates the next reachable departures and draws a line between reachable and unreachable departures.

## Screenshot

The module looks like this:

![Example for Alexanderplatz with time delay](img/MMM-PublicTransport_screenshot.png)

## Preconditions

* MagicMirror<sup>2</sup> instance
* Node.js version > 6.0.0
* npm

## Installation

Just clone the module into your MagicMirror modules folder and execute `npm install` in the module's directory:

```
git clone https://github.com/deg0nz/MMM-PublicTransportBerlin.git
cd MMM-PublicTransportBerlin
npm install
```

## Update

Just enter your MMM-PublicTransportBerlin folder in the MagicMirror's modules folder and execute the following commands in the module's directory:

```
git pull
npm install
```

## How to get the `stationId`

You will need a `stationId` for your module. You can get it as described in the [BVG-rest API documentation](https://github.com/derhuerst/bvg-rest/blob/master/docs/index.md).
This is a cURL example for getting all possible stations with the keyword "alexanderplatz":

```
curl 'https://1.bvg.transport.rest/locations?query=alexanderplatz'
```

The answer should contain one or more possible stations with valid station IDs. More queries are possible, 
like searching via coordinates or autocompletion of stations. Please check the [BVG-rest API documentation](https://github.com/derhuerst/bvg-rest/blob/master/docs/index.md)
for more options. Please note, that you need to query `1.bvg.transport.rest`.

You can prettify the JSON output with [`jq`](https://stedolan.github.io/jq/) if you have it installed:

```
curl 'https://1.bvg.transport.rest/locations?query=alexanderplatz' | jq
```

## Configuration

The module quite configurable. These are the possible options:

|Option|Description|
|---|---|
|`name`|The name of the module instance (if you want multiple modules).<br><br>**Type:** `string`<br>|
|`stationId`|The ID of the station. How to get the ID for your station is described below.<br><br>**Type:** `String` This value is **Required**.|
|`ignoredStations`|To allow appearance of multiple transportation methods, `vbb-hafas` returns departures of multiple stations in the area of the main station (including bus and tram stations for example). You can exclude those stations by adding them to this array. Usually, this can be empty.<br><br>**Type:** `integer array` (comma separated `integers` in the array).<br>**Default value:** `<empty>`|
|`directionStationId`|If you want the module to show departures only in a specific direction, you can enter the ID of the next station on your line to specify the direction. <br><br> *Note: After some tests, the data delivery of this feature seems not to be as reliable as the normal version. Also, please make sure you actually have the right `stationId` for the direction station. Please check your MagicMirror log for errors before reporting them. <br> Additionally, more request results take more time for the request. So please make sure to keep your `maxUnreachableDepartures` and `maxReachabledepartures` low when using this feature.* <br><br> **Type:** `string` <br>**Default value:** `<empty>`|
|`ignoredLines`|You can exclude different lines of a station by adding them to this array. Usually, this can be empty.<br><br>**Type:** `string array` (comma separated `strings` in the array).<br>**Default value:** `<empty>` <br>**Possible values:** All valid line names like `'U5'` (for subway) , `'M10'` or `'21'` (for tram), `'S75'` (for suburban) , `'Bus 200'`(for bus), etc.|
|`excludedTransportationTypes`|Transportation types to be excluded from appearing on a module instance can be listed here.<br><br>**Type:** `string`, comma-separated list<br>**Default vaule:** `<empty>` <br>**Possible values:** `bus`, `tram`, `suburban`, `subway`, `regional`, `ferry`|
|`marqueeLongDirections`|Makes a marquee/ticker text out of all direction descriptions with more than 25 characters. If this value is false, the descriptions are trimmed to the station names. You can see a video of it [here](https://ds.kayuk.de/kAfzU/) (rendered by a regular computer).<br><br> *Note: The rendering on the mirror is not perfect, but it is OK in my opinion. If the movement is not fluent enough for you, you should turn it off.*<br><br>**Type:** `boolean`<br>**Default vaule:** `true`|
|`interval`|How often the module should be updated. The value is given in milliseconds.<br><br>**Type:** `integer`<br>**Default value:** `120000 // 2 minutes`|
|`hidden`|Visibility of the module.<br><br>**Type:** `boolean`<br>**Default vaule:** `false`|
|`travelTimeToStation`|How long does it take you to get from the mirror to the station? The value is given in minutes. (this is the former `delay` option)<br><br>**Type:** `integer`<br>**Default vaule:** `10 // 10 minutes`|
|`departureMinutes`|For how many minutes in the future should departures be fetched? If `travelTimeToStation` is set > 0, then this time will be added to `now() + travelTimeToStation`. (This could be obsolete in future versions but is needed for now.)<br><br>**Type:** `integer`<br>**Default vaule:** `10`|
|`showColoredLineSymbols`|If you want the line colored and shaped or text only.<br><br>**Type:** `boolean`<br>**Default vaule:** `true`|
|`useColorForRealtimeInfo`|Set colors for realtime information<br><br>**Type:** `boolean`<br>**Default vaule:** `true`|
|`showTableHeaders`|Show or hides the table headers.<br><br>**Type:** `boolean`<br>**Default vaule:** `true`|
|`showTableHeadersAsSymbols`|Show the table headers as text or symbols.<br><br>**Type:** `boolean`<br>**Default vaule:** `true`|
|`maxUnreachableDepartures`|How many unreachable departures should be shown. Only necessary, of you set `delay` > 0<br><br>**Type:** `integer`<br>**Default vaule:** `3`|
|`maxReachableDepartures`|How many reachable departures should be shown. If your `delay = 0`, this is the value for the number of departures you want to see.<br><br>**Type:** `integer`<br>**Default vaule:** `7`|
|`fadeUnreachableDepartures`|Activates/deactivates fading for unreachable departures.<br><br>**Type:** `boolean`<br>**Default vaule:** `true`|
|`fadeReachableDepartures`|Activates/deactivates fading for reachable departures.<br><br>**Type:** `boolean`<br>**Default vaule:** `true`|
|`fadePointForReachableDepartures`|Fading point for reachable departures. Thìs value is also valid for `delay = 0` <br><br>**Type:** `float`<br>**Default vaule:** `0.5` <br>**Possible values:** `0.0 - 1.0`|
|`excludeDelayFromTimeLabel`|The API provides time labels which include the delay time of the departure. This flag removes the delay time to show times like they are shown in the BVG-App.<br><br>**Type:** `boolean`<br>**Default vaule:** `false`|

Here is an example of an entry in `config.js`:

``` JavaScript
{
    module: "MMM-PublicTransportBerlin",
    position: "top_right",
    config: {
        name: "Alexanderplatz",
        stationId: "90000010000",
        hidden: false,
        ignoredStations: [900000100003,2342,1337],
        ignoredLines: ["U5", "U8", "S75" "Bus 100"],               
        excludedTransportationTypes: "bus,suburban,subway",   
        travelTimeToStation: 10,
        interval: 120000,
        departureMinutes: 10,          
        maxDepartures: 15,
        marqueeLongDirections: true,
        showColoredLineSymbols: true,  
        useColorForRealtimeInfo: true,
        showTableHeaders: true,
        showTableHeadersAsSymbols: true,
        maxUnreachableDepartures: 3,    
        maxReachableDepartures: 7,
        fadeUnreachableDepartures: true,
        fadeReachableDepartures: true,
        fadePointForReachableDepartures: 0.25,
        excludeDelayFromTimeLabel: true
    }
},
```

## Multiple Modules

Multiple instances of this module are possible. Just add another entry of the MMM-PublicTransportBerlin module to the `config.js` of your mirror.

## Special Thanks

* [Michael Teeuw](https://github.com/MichMich) for inspiring me and many others to build a MagicMirror.
* [Jannis Redmann](https://github.com/derhuerst) for creating the [hafas-client](https://github.com/public-transport/hafas-client).
You made my life a lot easier with this! Please consider supporting him on [Patreon](https://patreon.com/derhuerst)!
* The community of [magicmirror.builders](https://magicmirror.builders) for help in the development process and all contributors for finding and fixing errors in this module.

## Issues

If you find any problems, bugs or have questions, please [open a GitHub issue](https://github.com/deg0nz/MMM-PublicTransportBerlin/issues) in this repository.
