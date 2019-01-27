const config = require('config');
const Command = require('../core/command');

/* eslint consistent-return: 0 */
module.exports = class StatsCommand extends Command {
    constructor() {
        super();

        this.name = 'dragons';
        this.onlyHelpFull = true;
    }

    /**
     * @param message
     * @return {Promise<void>}
     */
    async execute(message) {
        // TODO: Maybe use the reasons parameter?
        if (message.guild === config.get('general.server')) { return; } // TODO: This needs to be removed

        const dragonRole = config.get('general.herebedragonsRoleID');

        if (message.member.roles.has(dragonRole)) {
            await message.member.removeRole(dragonRole);

            return message.reply(
                'you already had the herebedragons role. I\'ve removed it. Type **!dragons** again to resubscribe.',
            );
        }

        await message.member.addRole(dragonRole);

        return message.guild.channels.get(config.get('channels.mappings.herebedragons'))
            .sendMessage(
                `${message.member.displayName} has been granted access here. Note, this channel is lawless.`
                + ' If you get triggered, the community staff cannot help you.',
            );
    }

    /**
     * @param {boolean} full
     * @return {string}
     */
    help(full) {
        return !full
            ? '#herebedragons is a private, lawless channel which you can opt into with this command.'
            : '#herebedragons is a private, lawless channel which you can opt into with this command. If you are '
            + 'already subscribed, use this command again to unsubscribe.';
    }
};
