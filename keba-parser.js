const { JSDOM } = require('jsdom');

module.exports = (RED) => {
    function kebaParser(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        if (node && config && config.url) {
            sendMessage(node, config);
            setInterval(() => sendMessage(node, config), config.interval * 1000);
        } else {
            node.warn('no configured URL');
        }
    }

    RED.nodes.registerType('keba-parser', kebaParser);
};

function sendMessage(node, config) {
    parseKebaData(node, config, (payload) => {
        node.send({ payload });
        node.status(getStatus(payload));
    });
}

function parseKebaData(node, config, cb) {
    let payload;
    const url = config.url.replace('http://', '').replace('https://', '');

    JSDOM.fromURL(`http://${url}/status.shtml`)
        .then((dom) => {
            dom.serialize();

            payload = {
                title: dom.window.document.title,
            };

            // extract the keba status tables from the dom
            const tables = dom.window.document.querySelectorAll('table');

            payload = { ...payload, ...praseStatusTable(tables[0].rows) };
            payload = { ...payload, ...praseStatusTable(tables[1].rows) };

            cb(payload);
        })
        .catch((err) => node.error(err));
}

function praseStatusTable(tableRows) {
    let body = {};
    for (let i = 0; i < tableRows.length; i++) {
        const cells = tableRows[i].cells;
        body = { ...body, ...keyMatcher(cells[0].textContent.trim(), cells[1].textContent.trim()) };
    }
    return body;
}

function keyMatcher(key, val) {
    switch (key) {
        case 'Product-ID':
            return { productId: val };
        case 'MAC Address':
            return { mac: val };
        case 'Software':
            return { version: val };
        case 'Service Info':
            return { serviceInfo: val };
        case 'State / Seconds':
            const state = val.trim().split(':');
            return { state: state[0].trim(), stateTime: { rate: state[1].trim(), value: +state[2].trim() } };
        case 'Current limit (PWM | hardware setup)':
            const limit = val
                .replace(/[()\|]/g, '')
                .replace(/ +(?= )/g, '')
                .split(' ');
            return {
                limit: {
                    current: numberParser(limit[0].replace('A', '')),
                    pwm: numberParser(limit[1].replace('%', '')),
                    hardware: numberParser(limit[4].replace('A', '')),
                },
            };
        case 'Voltage':
            const voltage = val.replace('V', '').split('|');
            return {
                voltage: {
                    l1: numberParser(voltage[0]),
                    l2: numberParser(voltage[1]),
                    l3: numberParser(voltage[2]),
                },
            };
        case 'Current':
            const current = val.replace('A', '').split('|');
            return {
                current: {
                    l1: numberParser(current[0]),
                    l2: numberParser(current[1]),
                    l3: numberParser(current[2]),
                },
            };
        case 'RealPower | PowerFactor':
            const power = val.trim().split('|');
            return { realPower: numberParser(power[0].replace('kW', '')), powerFactor: numberParser(power[1].replace('%', '')) };
        case 'Energy (present session)':
            return { energySession: numberParser(val.replace('kWh', '')) };
        case 'Energy (total)':
            return { energyTotal: numberParser(val.replace('kWh', '')) };
        case 'Energy (housegrid meter) in | out':
            const housegrid = val.trim().split(',');
            return { energyHousegrid: { in: +housegrid[0].trim(), out: +housegrid[1].trim() } };
        case 'Energy (solar meter) in | out':
            const solar = val.trim().split(',');
            return { energySolar: { in: +solar[0].trim(), out: +solar[1].trim() } };

        default:
            return { key: val };
    }
}

function getStatus(payload) {
    let statusColor = 'grey';

    switch (payload.state) {
        case 'unplugged':
            statusColor = 'yellow';
            break;
        case 'plugged':
            statusColor = 'blue';
            break;
        case 'charging':
            statusColor = 'green';
            break;
        case 'error':
            statusColor = 'red';
            break;
    }

    return { fill: statusColor, shape: 'dot', text: `${payload.state} - ${payload.realPower} kW` };
}

function numberParser(stringVal) {
    return parseFloat(stringVal.trim().replace(',', '.'));
}
