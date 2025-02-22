const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const { MessageEmbedVideo } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('frames')
    .setDescription('Pick character name and move, to get a response with all available move data.')
    .addStringOption(character =>
  		character.setName('character')
        .setAutocomplete(true)
  			.setDescription('The character name (e.g. Kyo, Iori).')
  			.setRequired(true))
    .addStringOption(move =>
  		move.setName('move')
        .setAutocomplete(true)
  			.setDescription('The move name or input.')
  			.setRequired(true)),
  async execute(interaction) {
    const char = interaction.options.getString('character');
    const move = interaction.options.getString('move');
    // Load frame data json.
    fs.readFile("./assets/framedataxiii.json", "utf8", (err, jsonObject) => {
      if (err) {
        // console.log("Error reading file from disk:", err);
        return interaction.reply('Could not load frame data file. Refer to the [Google sheet](https://docs.google.com/spreadsheets/d/1SYthdRZpnCAaH5WzgESqxkFnkU2EfPJgozz1PAM_vMw) for the data.');
      }
      try {
        let data = JSON.parse(jsonObject);
        // Capitilize first letter of character name.
        let character = char.charAt(0).toUpperCase() + char.slice(1);
        // Temp: validate extra names.
        if (character === 'Ex iori' ||
            character === 'Ex Iori') {
          character = 'EX Iori'
            }
        if (character === 'Ex kyo' ||
            character === 'Ex Kyo') {
          character = 'EX Kyo'
            }
        if (character === 'Mr. karate' ||
            character === 'Mr Karate' ||
            character === 'Karate') {
          character = 'Mr. Karate'
            }
        if (character === 'K Dash' ||
            character === 'K`') {
          character = 'K'
            }
        character = this.getCharacter(character)
        // If character not found, exit.
        if (data.hasOwnProperty(character) === false) {
          return interaction.reply('Could not find character: ' + character + '. Refer to the [Google sheet](https://docs.google.com/spreadsheets/d/1SYthdRZpnCAaH5WzgESqxkFnkU2EfPJgozz1PAM_vMw) for available characters.');
        }
        // Trim extra whitespaces from move.
        /* let parsedMove = move.trim();
        let singleButton = false
        // Check if single button passed.
        if (parsedMove.match(/^[+\-aAbBcCdD() .]+$/g)) {
          singleButton = true
          // console.log(parsedMove)
          // Preppend "far" to return valid value.
          parsedMove = (parsedMove === 'cd' || parsedMove === 'CD') ? parsedMove : 'far ' + parsedMove;
        }
        // console.log(parsedMove)
        // Convert dots into whitespaces.
        parsedMove = parsedMove.replace('.', ' ')
        // Trim whitespaces and add caps, turning "236 a" into "236A".
        if (parsedMove.match(/^[\d+ $+\-aAbBcCdD().]+$/g) ) {
          parsedMove = parsedMove.toUpperCase()
          parsedMove = parsedMove.replace(' ', '')
          console.log("Is this still useful? " + parsedMove)
        } */
        console.log(character, move)
        //let escapedMoves = move
        /* console.log(parsedMove)
        let escapedMoves = ''
        const moveArray = parsedMove.split(" ")
        moveArray.forEach((element) => {
          // Turn ABCD to uppercase if they are not.
          if (element.match(/^[+\-aAbBcCdD() .]+$/g) ) {
            element = element.toUpperCase()
          }
          escapedMoves += element + ' ';
        }) ;
        escapedMoves = escapedMoves.trimEnd();*/
        // If move not found, exit.
        if (data[character].hasOwnProperty(move) === false) {
          return interaction.reply('Could not find specified move: ' + move + 'for ' + character + '. Refer to the [Google sheet](https://docs.google.com/spreadsheets/d/1SYthdRZpnCAaH5WzgESqxkFnkU2EfPJgozz1PAM_vMw) for available data.');
        }
        let moveData = data[character][move];
        const startup = (moveData['Startup (F)'] !== null) ? moveData['Startup (F)'].toString() : '-';
        const active = (moveData['Active (F)'] !== null) ? moveData['Active (F)'].toString() : '-';
        const recovery = (moveData['Recovery (F)'] !== null) ? moveData['Recovery (F)'].toString() : '-';
        const oh = (moveData['On Hit (F)'] !== null) ? moveData['On Hit (F)'].toString() : '-';
        const ob = (moveData['On Guard (F)'] !== null) ? moveData['On Guard (F)'].toString() : '-';
        const inv = (moveData['Invincibility'] !== null) ? moveData['Invincibility'].toString() : 'No known invincibility.';
        const notes = (moveData['Notes'] !== null) ? moveData['Notes'].toString() : 'No notes found.';
        // const dmg = (moveData['Damage'] !== null) ? moveData['Damage'].toString() : '-'; no damage field yet
        // Get character link and img for url and thumbnail.
        const link = character.replace(' ','_'); // necessary, somehow.
        const img = this.getCharacterImg(character);
        // console.log(charNo);
        const embeds = [];
        const embed = new MessageEmbed()
          .setColor('#0x1a2c78')
          .setTitle(character)
          .setURL('https://dreamcancel.com/wiki/The_King_of_Fighters_XIII/' + link)
          .setAuthor({ name: move, iconURL: 'https://pbs.twimg.com/profile_images/1150082025673625600/m1VyNZtc_400x400.png', url: 'https://docs.google.com/spreadsheets/d/1SYthdRZpnCAaH5WzgESqxkFnkU2EfPJgozz1PAM_vMw' })
          // .setDescription('Move input')
          .setThumbnail('https://tiermaker.com/images/media/template_images/2024/1448043/kof-xiii-global-match-characters-1448043/thumb' + img + '.png')
          .addFields(
            { name: 'Startup', value: startup, inline: true },
            { name: 'Active', value: active, inline: true },
            { name: 'Recovery', value: recovery, inline: true },
            { name: '\u200B', value: '\u200B' },
            //{ name: 'Damage', value: dmg, inline: true },
            { name: 'On hit', value: oh, inline: true },
            { name: 'On block', value: ob, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Invincibility', value: inv },
            { name: '\u200B', value: '\u200B' },
            { name: 'Notes', value: notes },
            // { name: 'Inline field title', value: 'Some value here', inline: true },
          )
          .setFooter({ text: 'Got feedback? Join the XIII server: discord.gg/tNgSuGJ', iconURL: 'https://cdn.iconscout.com/icon/free/png-128/discord-3-569463.png' });
          (moveData['Image'] != null) ? embed.setImage(moveData['Image']) : embed.addField('No image was found for this move', 'Feel free to share with the [developers](https://github.com/FranckFrost/kofxiii_framebot/issues) if you have one.', true);
        embeds.push(embed);
        if (moveData['Image1'] != null) {
          const embed1 = new MessageEmbed().setImage(moveData['Image1']);
          embeds.push(embed1);
        }
        if (moveData['Image2'] != null) {
          const embed2 = new MessageEmbed().setImage(moveData['Image2']);
          embeds.push(embed2);
        }
        if (moveData['Image3'] != null) {
          const embed3 = new MessageEmbed().setImage(moveData['Image3']);
          embeds.push(embed3);
        }
        if (moveData['Image4'] != null) {
          const embed4 = new MessageEmbed().setImage(moveData['Image4']);
          embeds.push(embed4);
        }
        if (moveData['Image5'] != null) {
          const embed5 = new MessageEmbed().setImage(moveData['Image5']);
          embeds.push(embed5);
        }
        if (moveData['Image6'] != null) {
          const embed6 = new MessageEmbed().setImage(moveData['Image6']);
          embeds.push(embed6);
        }
        if (moveData['Image7'] != null) {
          const embed7 = new MessageEmbed().setImage(moveData['Image7']);
          embeds.push(embed7);
        }
        if (moveData['Image8'] != null) {
          const embed8 = new MessageEmbed().setImage(moveData['Image8']);
          embeds.push(embed8);
        }
        if (moveData['Image9'] != null) {
          const embed9 = new MessageEmbed().setImage(moveData['Image9']);
          embeds.push(embed9);
        } //10 embeds max per message
        return interaction.reply({embeds: embeds});
      } catch (err) {
        console.log("Error parsing JSON string:", err);
        return interaction.reply('There was an error while processing your request, if the problem persists, contact the bot developers. Refer to the [Google sheet](https://docs.google.com/spreadsheets/d/1SYthdRZpnCAaH5WzgESqxkFnkU2EfPJgozz1PAM_vMw) to look for the data.');
      }
    });
  },
  getCharacter: function(character) {
    const chart = {
      'Andy': 'Andy Bogard',
      'Ash': 'Ash Crimson',
      'Athena': 'Athena Asamiya',
      'Benimaru': 'Benimaru Nikaido',
      'Billy': 'Billy Kane',
      'Chin': 'Chin Gentsai',
      'Duo': 'Duo Lon',
      'Clark': 'Clark Still',
      'Elisabeth': 'Elisabeth Branctorche',
      'Daimon': 'Goro Daimon',
      'Hwa': 'Hwa Jai',
      'Iori': 'Iori Yagami',
      'Joe': 'Joe Higashi',
      'Kim': 'Kim Kaphwan',
      'Kula': 'Kula Diamond',
      'Kyo': 'Kyo Kusanagi',
      'Leona': 'Leona Heidern',
      'Mai': 'Mai Shiranui',
      'Ralf': 'Ralf Jones',
      'Robert': 'Robert Garcia',
      'Ryo': 'Ryo Sakazaki',
      'Shen': 'Shen Woo',
      'Kensou': 'Sie Kensou',
      'Takuma': 'Takuma Sakazaki',
      'Terry': 'Terry Bogard',
      'Yuri': 'Yuri Sakazaki'
    };
    if (chart[character] === undefined) {
      return character;
    }
    return chart[character];
  },
  getCharacterImg: function(character) {
    const chartImg = {
      'Andy Bogard': '42',
      'Ash Crimson': '111',
      'Athena Asamiya': '61',
      'Benimaru Nikaido': '22',
      'Billy Kane': '112',
      'Chin Gentsai': '63',
      'Clark Still': '83',
      'Duo Lon': '12',
      'Elisabeth Branctorche': '11',
      'EX Iori': '114',
      'EX Kyo': '115',
      'King': '93',
      'Goro Daimon': '23',
      'Mature': '32',
      'Maxima': '103',
      'Mr. Karate': '116',
      'Raiden': '53',
      'Saiki': '113',
      'Vice': '33',
      'Hwa Jai': '52',
      'Iori Yagami': '31',
      'Joe Higashi': '43',
      'K': '101',
      'Kim Kaphwan': '51',
      'Kula Diamond': '102',
      'Kyo Kusanagi': '21',
      'Leona Heidern': '81',
      'Mai Shiranui': '91',
      'Ralf Jones': '82',
      'Robert Garcia': '72',
      'Ryo Sakazaki': '71',
      'Shen Woo': '13',
      'Sie Kensou': '62',
      'Takuma Sakazaki': '73',
      'Terry Bogard': '41',
      'Yuri Sakazaki': '92'
    };
    return chartImg[character];
  }
};
