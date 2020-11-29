const helper = require('node-red-node-test-helper');

const kebaParser = require('../keba-parser');

describe('keba-parser Node', () => {
    afterEach(() => {
        helper.unload();
    });

    it('should be loaded', (done) => {
        const flow = [{ id: 'n1', type: 'keba-parser', name: 'keba name' }];
        helper.load(kebaParser, flow, () => {
            const n1 = helper.getNode('n1');
            n1.should.have.property('name', 'keba name');
            done();
        });
    });
});
