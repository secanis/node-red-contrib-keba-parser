# node-red-contrib-keba-parser

[![NPM](https://nodei.co/npm/red-contrib-keba-parser.png?compact=true)](https://npmjs.org/package/red-contrib-keba-parser)

This is a node-red extension to parse the current state over the web ui from [KEBA E-Car charing stations](https://www.keba.com).
The most of KEBA charing stations have an ethernet port to bring management and monitoring features to the charging station.
With this node-red plugin you should be able to parse the available charing station monitoring web page to JSON.
This is currently required because no full JSON REST API is available.

![Keba Parser](https://raw.githubusercontent.com/secanis/red-contrib-keba-parser/main/images/screenshot-keba-parser.jpg)

> Tested with the currently latest firmware version: P30 v3.10.28

## Usage

### Configuration

This node requires two properties for configuration

```text
url             KEBA url of the charging station web ui
interval        Interval to fetch data in seconds (default: 60 seconds)
```

### Output Example Data

```jsonc
{
    "title": "KeContact P30",
    "productId": "KC-P30-XYZ",
    "mac": "AA:BB:CC:DD:EE",
    "version": "P30 v 1.2.3. xxx",
    "serviceInfo": "0 : 0 : 0 : 0 : 0 : 888 : 88 : 888",
    "state": "unplugged ",
    "stateTime": { "rate": "seconds", "value": 10000 },
    "limit": { "current": 0, "pwm": 100.0, "hardware": 32 }, // in A, %, A
    "voltage": { "l1": 0, "l2": 0, "l3": 0 }, // in V
    "current": { "l1": 0, "l2": 0, "l3": 0 }, // in A
    "realPower": 10, // in kW
    "powerFactor": 0, // in %
    "energySession": 0.0, // in kWh
    "energyTotal": 145.57, // in kWh
    "energyHousegrid": { "in": null, "out": null },
    "energySolar": { "in": null, "out": null }
}
```

## Contribution

### Prerequisites

-   Installed Node
-   Installed Docker for Desktop (or on Linux native Docker)

### Development

Start locally a Docker container with the following command:

```powershell
# careful this command is i.e. for Powershell
docker run -it -p 1880:1880 -v ${PWD}:/usr/src/node-red/development --name mynodered nodered/node-red

# cleanup
docker kill mynodered
docker rm mynodered
```

Then you can attatch your Visual Studio Code instance to the running container (official `Remote Docker` extension required).
After that you can connect with the Powershell, shell, whatever to the running container by entering

```powershell
docker exec -it mynodered bash

npm install ./development/
```

May you have to restart the container/Node-Red to see the plugin in over the Node-RED UI at `http://localhost:1880/`.
