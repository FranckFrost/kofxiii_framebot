// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const keepAlive = require('./server');
const path = require('path')
const fetch = require('node-fetch');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const appCommandFiles = fs.readdirSync('./commands/application').filter(file => file.endsWith('.js'));
const guildCommandFiles = fs.readdirSync('./commands/guild').filter(file => file.endsWith('.js'));

for (const file of appCommandFiles) {
  const command = require(`./commands/application/${file}`);
  client.commands.set(command.data.name, command);
}
for (const file of guildCommandFiles) {
  const command = require(`./commands/guild/${file}`);
  client.commands.set(command.data.name, command);
}

let json = null
let characters = [], json_characters = [];
client.once('ready', () => {
  json = fs.readFileSync("./assets/framedataxiii.json", 'utf8');
  json = JSON.parse(json);
  Object.keys(json).forEach(function (key) {
    json_characters.push(key);
  })
  console.log('Ready!');
});
client.on('interactionCreate', async autocomplete => {
	if (!autocomplete.isAutocomplete()) return;
  // console.log(autocomplete.commandName)
	if (autocomplete.commandName === 'embed' || autocomplete.commandName === 'frames' || autocomplete.commandName === 'cargo') {
    let currentOption = autocomplete.options.getFocused(true);
    let currentName = currentOption.name;
    let currentValue = currentOption.value;
    characters = json_characters;

    if (autocomplete.commandName === 'cargo') {
	    let cargo_characters = []
	    const url_char = "https://dreamcancel.com/w/index.php?title=Special:CargoExport&tables=MoveData_KOFXIII%2C&&fields=MoveData_KOFXIII.chara%2C&&group+by=MoveData_KOFXIII.chara&order+by=&limit=100&format=json"
	    const response_char = await fetch(url_char);
	    const cargo_char = await response_char.json();
	    for (let x in cargo_char) {
		    cargo_characters.push(cargo_char[x]["chara"])
	    }
	    characters = cargo_characters;
    }

    const options = [];
    if (currentName === "character") {
      characters.forEach((character) => {
        if (character.toLowerCase().includes(currentValue.toLowerCase())) {
          let charObj = {}
          charObj["name"] = character;
          charObj["value"] = character;
          if (options.length < 25) {
            options.push(charObj);
          }
        }
      })
    }
    // 
    let character = autocomplete.options.getString('character')
    // If move is focused 
    if (currentName === "move" && character !== "") {
      let moveObj = {}
	    // Capitilize first letter(s) of char name.
	    let a = (character.split(' ')[1]!==undefined) ? ' ' + character.split(' ')[1].charAt(0).toUpperCase() + character.split(' ')[1].slice(1) : ""
	    let char = character.split(' ')[0].charAt(0).toUpperCase() + character.split(' ')[0].slice(1) + a;
	    // Validate extra names.
	    character = getCharacter(char)
	    if (autocomplete.commandName === 'cargo') {
		    if (!characters.includes(character)) {
			    moveObj["name"] = 'No cargo data available for specified character. Gather framedata with /frames instead.';
                            moveObj["value"] = 'No cargo data available for specified character. Gather framedata with /frames instead.';
                            options.push(moveObj);
		    } else {
			    let move = "";
			    let val = "";
			    const url_moves = "https://dreamcancel.com/w/index.php?title=Special:CargoExport&tables=MoveData_KOFXIII%2C&&fields=MoveData_KOFXIII.input%2C+MoveData_KOFXIII.input2%2C+MoveData_KOFXIII.name%2C+MoveData_KOFXIII.moveId%2C&where=chara%3D%22"+encodeURIComponent(character)+"%22&order+by=MoveData_KOFXIII._ID+ASC&limit=100&format=json"
			    const response_moves = await fetch(url_moves);
			    const cargo_moves = await response_moves.json();
			    for (let x in cargo_moves) {
				    move = cargo_moves[x]["name"]
				    if (cargo_moves[x]["input"] !== null) {
					    move = cargo_moves[x]["name"] + " (" + cargo_moves[x]["input"] + ")"
					    if (cargo_moves[x]["input2"] !== null && cargo_moves[x]["input"] !== cargo_moves[x]["input2"]) {
						    move = cargo_moves[x]["name"] + " ([" + cargo_moves[x]["input"] + "] / [" + cargo_moves[x]["input2"] + "])"
						    val = cargo_moves[x]["moveId"] + "??" + move
						    if (val.length > 100) {   // choice character limit of 100
							    move = cargo_moves[x]["name"] + " ([" + cargo_moves[x]["input"].trim() + "] / [" + cargo_moves[x]["input2"].trim() + "])"; 
						    }
					    }
				    }
				    if (move.toLowerCase().includes(currentValue.toLowerCase())) {
					    moveObj = {}
					    moveObj["name"] = move;
					    moveObj["value"] = cargo_moves[x]["moveId"] + "??" + move;
					    if (options.length < 25) options.push(moveObj);
				    }
			    }
					  }
	    } else {
		    if (json[character] === undefined) {
			    moveObj["name"] = 'Moves not found for specified character, try another character';
			    moveObj["value"] = 'Moves not found for specified character, try another character';
			    options.push(moveObj);
		    } else {
			    let moves = [];
			    Object.keys(json[character]).forEach(function (key) {
				    moves.push(key);
			    })
			    moves.forEach((move) => {
				    if (move.toLowerCase().includes(currentValue.toLowerCase())) {
					    moveObj = {}
					    moveObj["name"] = move;
					    moveObj["value"] = move;
					    // console.log(move)
					    if (options.length < 25) options.push(moveObj);
				    }
			    })
					  }
	    }
    }
	    await autocomplete.respond(options);
	}
});
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});
client.on("ready", () => {
  console.log(`Hi, ${client.user.username} is now online and used in ${client.guilds.cache.size} servers.`);
  client.guilds.cache.forEach((guild) => {
    console.log(`${guild.name} with ${guild.memberCount} members.`)
  });

  client.user.setPresence({
    status: "online",
    activities: [{
      name: 'Kyo. Use /frames, /cargo or /help to get started.'
    }],
  }); 
});
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));
client.on('rateLimit', (info) => {
  console.log(`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout: 'Unknown timeout '}`)
})
// Keep bot alive. (doesn't seem to work on raspberry, port issue to look into later)
// keepAlive();
// Login to Discord with your client's token
const token = process.env['DISCORD_TOKEN']
client.login(token);

function getCharacter(character) {
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
};
