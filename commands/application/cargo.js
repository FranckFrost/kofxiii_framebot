const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { MessageEmbedVideo } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cargo')
    .setDescription('Pick character name and move, to get a response with all available cargo data.')
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
    await interaction.deferReply();
    const character = this.getCharacter(interaction.options.getString('character'));
    const [id, move] = interaction.options.getString('move').split("??");
    console.log("cargo", character, move)

    try {
      // Fetch the cargo data with the appropriate moveId
      const url_cargo = "https://dreamcancel.com/w/index.php?title=Special:CargoExport&tables=MoveData_KOFXIII%2C&&fields=MoveData_KOFXIII.rank%2C+MoveData_KOFXIII.idle%2C+MoveData_KOFXIII.images%2C+MoveData_KOFXIII.hitboxes%2C+MoveData_KOFXIII.damage%2C+MoveData_KOFXIII.guard%2C+MoveData_KOFXIII.cancel%2C+MoveData_KOFXIII.startup%2C+MoveData_KOFXIII.active%2C+MoveData_KOFXIII.recovery%2C+MoveData_KOFXIII.hitadv%2C+MoveData_KOFXIII.blockadv%2C+MoveData_KOFXIII.invul%2C&where=moveId%3D%22"+encodeURIComponent(id)+"%22&order+by=&limit=100&format=json";
      const response_cargo = await fetch(url_cargo);
      const cargo = await response_cargo.json();
  
      // Preparing the embed data from cargo
      let moveData = cargo[0];
      const startup = this.getHyperLink(moveData['startup']);
      const active = this.getHyperLink(moveData['active']);
      const recovery = this.getHyperLink(moveData['recovery']);
      const rank = this.getHyperLink(moveData['rank']);
      const idle = this.getHyperLink(moveData['idle']);
      const oh = this.getHyperLink(moveData['hitadv']);
      const ob = this.getHyperLink(moveData['blockadv']);
      const inv = this.getHyperLink(moveData['invul'],1);
      const dmg = this.getHyperLink(moveData['damage']);
      const guard = this.getHyperLink(moveData['guard']);
      const cancel = this.getHyperLink(moveData['cancel']);

      // Fetch hitboxes or images if lack of the former.
      let images = (moveData['images'] !== null) ? moveData['images'].toString().trim().split(',') : [];
      let hitboxes = (moveData['hitboxes'] !== null) ? moveData['hitboxes'].toString().trim().split(',') : images;
    
      // Get character link and img for header and thumbnail.
      const link = 'https://dreamcancel.com/wiki/The_King_of_Fighters_XIII/' + encodeURIComponent(character);
      const img = this.getCharacterImg(character);
      
      const embeds = [];
      const embed = new MessageEmbed()
        .setColor('#0x1a2c78')
        .setTitle(character)
        .setURL(link)
        .setAuthor({ name: move, iconURL: 'https://pbs.twimg.com/profile_images/1150082025673625600/m1VyNZtc_400x400.png', url: link + '/Data' })
        // .setDescription('Move input')
        .setThumbnail('https://tiermaker.com/images/media/template_images/2024/1448043/kof-xiii-global-match-characters-1448043/thumb' + img + '.png')
        .addFields(
          { name: 'Startup', value: startup, inline: true },
          { name: 'Active', value: active, inline: true },
          { name: 'Recovery', value: recovery, inline: true },
          { name: '\u200B', value: '\u200B' },
          )
      if (idle === "yes") {
        embed.addFields({ name: 'Rank', value: rank})
      }else{
        embed.addFields(
          { name: 'Damage', value: dmg, inline: true },
          { name: 'Cancel', value: cancel, inline: true },
          { name: '\u200B', value: '\u200B' },
          { name: 'Guard', value: guard, inline: true },
          { name: 'On hit', value: oh, inline: true },
          { name: 'On block', value: ob, inline: true },
          { name: '\u200B', value: '\u200B' },
          { name: 'Invincibility', value: inv },
          // { name: 'Inline field title', value: 'Some value here', inline: true },
          )
      }
        embed.setFooter({ text: 'Got feedback? Join the XIII server: discord.gg/tNgSuGJ', iconURL: 'https://cdn.iconscout.com/icon/free/png-128/discord-3-569463.png' });
        if (hitboxes.length === 0) {
          embed.addField('No image was found for this move', 'Feel free to share with the [developers](https://github.com/FranckFrost/kofxiii_framebot/issues) if you have one.', true);
        } else {
          let ind = "url\":\""
          
          let url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url"
          let response = await fetch(url)
          let car = await response.text()
          let s = car.indexOf(ind) + ind.length
          let image = car.slice(s,car.indexOf("\"",s))
          embed.setImage(image)
          embeds.push(embed)

          if (hitboxes.length > 0) {
            url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url"
            response = await fetch(url)
            car = await response.text()
            s = car.indexOf(ind) + ind.length
            let image1 = car.slice(s,car.indexOf("\"",s))
            const embed1 = new MessageEmbed().setImage(image1)
            embeds.push(embed1)
          }
  
          if (hitboxes.length > 0) {
            url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url"
            response = await fetch(url)
            car = await response.text()
            s = car.indexOf(ind) + ind.length
            let image2 = car.slice(s,car.indexOf("\"",s))
            const embed2 = new MessageEmbed().setImage(image2)
            embeds.push(embed2)
          }
  
          if (hitboxes.length > 0) {
            url = "https://dreamcancel.com/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + encodeURIComponent(hitboxes.shift()) + "&iiprop=url"
            response = await fetch(url)
            car = await response.text()
            s = car.indexOf(ind) + ind.length
            let image3 = car.slice(s,car.indexOf("\"",s))
            const embed3 = new MessageEmbed().setImage(image3)
            embeds.push(embed3)
          }
        }
      await interaction.editReply({embeds: embeds});
      return;
      } catch (error) {
        console.log("Error finishing cargo request", error);
        return interaction.editReply('There was an error while processing your request, if the problem persists, contact the bot developers. Refer to the [Google sheet](https://docs.google.com/spreadsheets/d/1Sxx9kKOmJ6DNn3wEwNinnuMxSKn6UnF_8QkrYLMSREc) to look for the data.');
      }
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
      'Ex Kyo': 'EX Kyo',
      'Ex Iori': 'EX Iori',
      'Daimon': 'Goro Daimon',
      'Hwa': 'Hwa Jai',
      'Iori': 'Iori Yagami',
      'Joe': 'Joe Higashi',
      'K`': 'K',
      'K Dash': 'K',
      'Kim': 'Kim Kaphwan',
      'Kula': 'Kula Diamond',
      'Kyo': 'Kyo Kusanagi',
      'Leona': 'Leona Heidern',
      'Mai': 'Mai Shiranui',
      'Karate': 'Mr. Karate',
      'Mr Karate': 'Mr. Karate',
      'Mr.Karate': 'Mr. Karate',
      'MrKarate': 'Mr. Karate',
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
  getHyperLink: function(str,inv) {
    if (inv && str === null) return 'No recorded invincibility.'; // no invuln found
    if (str === null) return '-'; // no property found
    let s = str.toString().replaceAll('&#039;','');
    if (s.match(/.*?\[\[.*?\]\].*/) === null) return s.replaceAll('_',' '); // no hyperlink found
    
    let t="", u="", v=[], w=[], x=[], y=[], z=(s.split(',')[1]!==undefined) ? s.split(',') : s.split(';')
    for (let i in z) {
        y[i] = z[i].match(/.*?\[\[.*?\]\].*/g)
    }
    for (let i in y) {
      if (y[i] === null) {
          x.push(z[i])
      }else{
          let wiki = "https://dreamcancel.com/wiki/"
          for (let j in y[i]) {
              w = y[i][j].replace(']]','').split('[[')
              v = w[1].split('|')
              if (v[1].includes("HKD")) u = " \'Hard Knockdown\'"
              if (v[1].includes("SKD")) u = " \'Soft Knockdown\'"
              x.push(w[0] + '[' + v[1] + '](' + wiki + v[0] + u + ')')
          }
      }
    }
    for (let i in x) {
        t = t + x[i] + ','
    }
    return t.slice(0, -1);
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
