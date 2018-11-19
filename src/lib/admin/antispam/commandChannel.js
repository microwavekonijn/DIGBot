//  Copyright © 2018 DIG Development team. All rights reserved.

'use strict';

// Enforces DIGBot to only respond to messages inside of #digbot or #developer.

const config = require('config');
const commands = require('../../commands/commands.js');
const crashHandler = require('../../crash-handling.js');
const logger = require('../../logger.js');
const server = require('../../server/server.js');

const TAG = 'Command Channel Antispam';

const ignoreList = {};
let timer;

module.exports = {
    execute(msg) {
        const digbotChannel = server.getChannel('digbot');

        if (digbotChannel === null) {
            logger.warning(TAG, 'DIGBot command channel not set!');
            return true; // Allow it otherwise shit might break otherwise
        }

        if (msg.guild.id !== server.getGuild().id) { return false; }

        /* If not from #digbot or #developers or a nsfw channel (in the sense that it is unmoderated)
        and if it starts with the prefix */
        if (msg.channel.id !== config.get('channels.mappings.developers') &&
            msg.channel.id !== config.get('channels.mappings.digbot') &&
            commands.check(msg.content)) {
            const date = new Date();

            // Check if already being ignored.
            if (ignoreList[msg.author.id]) {
                logger.info(TAG, `Ignored message from ${msg.author.id} as they're in the commandChannel ` +
                'ignore list');
                return false;
            }

            msg.reply(`Please issue your command in the channel ${digbotChannel} and try again. ` +
            'I\'ll no longer respond to any further commands.');

            ignoreList[msg.author.id] = {
                expires: date.getTime() + (6 * 60 * 60 * 1000), // Now + 6 hours
                displayName: msg.member.displayName,
            };
            logger.info(TAG, `Added ${msg.member.displayName} to commandChannel ignore list`);

            return false;
        }

        return true;
    },

    ready() {
        if (timer) {
            clearInterval(timer);
        }

        timer = setInterval(() => {
            crashHandler.logEvent(TAG, 'commandChannel release timer');
            const time = new Date().getTime();
            for (const user in ignoreList) {
                if (ignoreList[user].expires < time) {
                    logger.info(TAG, `Released ${ignoreList[user].displayName} from commandChannel ignore list`);
                    delete ignoreList[user];
                }
            }
        }, (5 * 60 * 1000)); // 5 mins
    },
};
