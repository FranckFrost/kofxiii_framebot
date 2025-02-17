const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Describes how to use the commands to retrieve frame data'),
  async execute(interaction) {
    const embed = new MessageEmbed()
          .setColor('#0x1a2c78')
          .setTitle('Need Help?')
          .setAuthor({ name: 'KOFXIII FrameBot', iconURL: 'https://cdn.discordapp.com/icons/284354385687871488/23c6ea888ff2fec1dea94da791b9265a.webp?size=128', url: 'https://discord.gg/tNgSuGJ' })
          .addFields(
            { name: 'Getting started', value: 'The bot provides a "move per command" response where you get to ask for information of a certain move of a certain character individually per request. The bot uses autocomplete, so please keep typing to filter the results to your needs. The bot has a **/frames** slash command which accept 2 arguments:', inline: false },
            { name: '\u200B', value: '\u200B' },
            { name: 'Character', value: 'The **character** which is a case insensitive string (e.g. takuma, Clark, iori)', inline: false },
            { name: 'Move', value: 'The **move** name or input which is a case insensitive string (e.g. crouchA, psycho ball)', inline: false },
            { name: '\u200B', value: '\u200B' },
            { name: 'Demo', value: 'The following is a visual representation of how the bot works:', inline: false },
          )
          .setImage('https://media.giphy.com/media/LrqUuAZB2E3hGvHtOH/giphy.gif')
          .setFooter({ text: 'Got feedback? Join the XIII server: https://discord.gg/tNgSuGJ', iconURL: 'https://cdn.iconscout.com/icon/free/png-128/discord-3-569463.png' });
        return interaction.reply({embeds: [embed]});
  },
};
