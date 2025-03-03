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
            { name: 'Getting started', value: 'The bot displays available data of a certain move of a certain character individually per request. It uses autocomplete, so please keep typing to filter the results to your needs.\n Source of the data is the latest [framedata sheet](https://docs.google.com/spreadsheets/d/1SYthdRZpnCAaH5WzgESqxkFnkU2EfPJgozz1PAM_vMw) for the **/frames** slash command and the [Dream Cancel wiki](https://dreamcancel.com/wiki/The_King_of_Fighters_XIII) for **/cargo**.\n Their common arguments are as follows:', inline: false },
            { name: '\u200B', value: '\u200B' },
            { name: 'Character', value: 'The **character** which is a case insensitive string (e.g. takuma, Clark, iori)', inline: false },
            { name: 'Move', value: 'The **move** name or input which is a case insensitive string (e.g. crouchA, psycho ball)', inline: false },
            { name: '\u200B', value: '\u200B' },
            { name: 'Demo', value: 'The following is a visual representation of how the bot works:', inline: false },
          )
          .setImage('https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTQ3cnF1c2Q2eXNzdWMydHVlYzQ1eXF3cnFkMGFidXpndG1uMHppMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/S03U5L21Mb3kyMvbcJ/giphy.gif')
          .setFooter({ text: 'Got feedback? Join the XIII server: https://discord.gg/tNgSuGJ', iconURL: 'https://cdn.iconscout.com/icon/free/png-128/discord-3-569463.png' });
        return interaction.reply({embeds: [embed]});
  },
};
