## node-red-contrib-keba-parser

[![NPM](https://nodei.co/npm/red-contrib-keba-parser.png?compact=true)](https://npmjs.org/package/red-contrib-keba-parser)

This is a node-red extension to parse the current state over the web ui from [KEBA E-Car charing stations](https://www.keba.com).
The most of KEBA charing stations have an ethernet port to bring management and monitoring features to the charging station.
With this node-red plugin you should be able to parse the available charing station monitoring web page to JSON.
This is currently required because no full JSON REST API is available.

![Keba Parser](https://raw.githubusercontent.com/secanis/red-contrib-keba-parser/main/images/screenshot-keba-parser.jpg)

### Configuration

This node requires two properties for configuration

```text
url             KEBA url of the charging station web ui
interval        Interval to fetch data in seconds (default: 60 seconds)
```

### Output Example Data

```json
{
    "title": "KeContact P30",
    "productId": "KC-P30-XYZ",
    "mac": "AA:BB:CC:DD:EE",
    "version": "P30 v 1.2.3. xxx",
    "serviceInfo": "0 : 0 : 0 : 0 : 0 : 888 : 88 : 888",
    "state": "unplugged ",
    "stateTime": { "rate": "seconds", "value": 10000 },
    "limit": { "current": "0,00A", "pwm": "100,0%", "hardware": "32A" },
    "voltage": { "l1": "0 V", "l2": "0 V", "l3": "0 V" },
    "current": { "l1": "0,00 A", "l2": "0,00 A", "l3": "0,00 A" },
    "realPower": "0,00 kW",
    "powerFactor": "0,0 %",
    "energySession": "0,00 kWh",
    "energyTotal": "145,57 kWh",
    "energyHousegrid": { "in": null, "out": null },
    "energySolar": { "in": null, "out": null }
}
```
