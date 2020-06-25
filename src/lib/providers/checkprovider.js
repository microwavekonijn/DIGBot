const config = require('config');
const ServiceProvider = require('../foundation/serviceprovider');

const autodelete = require('../admin/channels/autodelete.js');
const mentionSpam = require('../admin/antispam/mentionspam.js');
const server = require('../server/server.js');

// eslint-disable-next-line no-mixed-operators
const mod = (a, N) => (a % N + N) % N;

module.exports = class CheckProvider extends ServiceProvider {
    async boot() {
        // Interval call auto delete to get rid of inactive temp channels
        setInterval(() => {
            if (server.getGuild(config.get('general.server')) === null) { return; }
            autodelete.execute(server.getGuild(config.get('general.server')));
        }, config.get('autoDeleteChannels'));

        setInterval(() => {
            mentionSpam.release();
        }, 5 * 1000 * 60);

        setTimeout(() => {
            setInterval(() => {
                mentionSpam.dailyReset();
            }, 24 * 3600 * 1000);
        }, mod(2 * 3600 * 1000 - Date.now(), 24 * 3600 * 1000));
    }
};
