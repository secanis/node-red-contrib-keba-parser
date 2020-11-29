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
    });
}

function parseKebaData(node, config, cb) {
    let payload;
    JSDOM.fromURL(`${config.url}/status.shtml`)
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
            return { state: state[0], stateTime: { rate: state[1].trim(), value: +state[2].trim() } };
        case 'Current limit (PWM | hardware setup)':
            const limit = val
                .replace(/[()\|]/g, '')
                .replace(/ +(?= )/g, '')
                .split(' ');
            return {
                limit: {
                    current: limit[0],
                    pwm: limit[1],
                    hardware: limit[4],
                },
            };
        case 'Voltage':
            const voltage = val.replace('V', '').split('|');
            return {
                voltage: {
                    l1: `${voltage[0].trim()} V`,
                    l2: `${voltage[1].trim()} V`,
                    l3: `${voltage[2].trim()} V`,
                },
            };
        case 'Current':
            const current = val.replace('A', '').split('|');
            return {
                current: {
                    l1: `${current[0].trim()} A`,
                    l2: `${current[1].trim()} A`,
                    l3: `${current[2].trim()} A`,
                },
            };
        case 'RealPower | PowerFactor':
            const power = val.trim().split('|');
            return { realPower: power[0].trim(), powerFactor: power[1].trim() };
        case 'Energy (present session)':
            return { energySession: val };
        case 'Energy (total)':
            return { energyTotal: val };
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
