// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const keepAlive = require('./server');
const path = require('path')
const fetch = require('node-fetch');
const he = require('he');

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

let json = null, cargo = null;
let characters = [], json_characters = [], cargo_characters = [];
const url = "https://dreamcancel.com/w/index.php?title=Special:CargoExport&tables=MoveData_KOFXIII%2C&&fields=MoveData_KOFXIII.chara%2C+MoveData_KOFXIII.moveId%2C+MoveData_KOFXIII.name%2C+MoveData_KOFXIII.input%2C+MoveData_KOFXIII.input2%2C+MoveData_KOFXIII.version%2C&&order+by=MoveData_KOFXIII.chara+ASC&limit=4000&format=json"
client.once('ready', async () => {
  json = fs.readFileSync("./assets/framedataxiii.json", 'utf8');
  json = JSON.parse(json);
  Object.keys(json).forEach(function (key) {
    json_characters.push(key);
  })

  const response = await fetch(url);
  cargo = await response.json();
  for (let x in cargo) {
	  if (cargo[x]["chara"]!==null && (!cargo_characters.includes(cargo[x]["chara"]))) cargo_characters.push(cargo[x]["chara"])
  }

  console.log('Ready!');
});
client.on('interactionCreate', async autocomplete => {
	if (!autocomplete.isAutocomplete()) return;
  // console.log(autocomplete.commandName)
	if (autocomplete.commandName === 'embed' || autocomplete.commandName === 'frames' || autocomplete.commandName === 'cargo') {
    let currentOption = autocomplete.options.getFocused(true);
    let currentName = currentOption.name;
    let currentValue = currentOption.value;
    characters = (autocomplete.commandName === 'cargo') ? cargo_characters : json_characters;

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
    // If move is focused 
    if (currentName === "move") {
      let character = getCharacter(autocomplete.options.getString('character'))
      let moveObj = {}
      if (character === null) {
	    moveObj["name"] = 'You have to enter the character first. Delete and reset the command to try again.';
	    moveObj["value"] = 'You have to enter the character first. Delete and reset the command to try again.';
	    options.push(moveObj);
      } else {
	    if (autocomplete.commandName === 'cargo') {
		    if (!characters.includes(character)) {
			    moveObj["name"] = 'No cargo data available for ' + character + ' yet. Gather framedata with /frames instead.';
                            moveObj["value"] = 'No cargo data available for ' + character + ' yet. Gather framedata with /frames instead.';
                            options.push(moveObj);
		    } else {
			    let move = "", x = 0;
			    while (cargo[x]["chara"] !== character) x++;
			    do {
				    move = cargo[x]["name"]
				    if (cargo[x]["input"] !== null) {
					    move = cargo[x]["name"] + " (" + cargo[x]["input"] + ")"
					    if (cargo[x]["input2"] !== null && cargo[x]["input"] !== cargo[x]["input2"]) {
						    let ver = (cargo[x]["version"] === 'Raw' || cargo[x]["version"] === "Canceled into") ? cargo[x]["version"]+" " : "";
						    move = cargo[x]["name"] + " (" + ver + "[" + cargo[x]["input"] + "] / [" + cargo[x]["input2"] + "])"
					    }
				    }			    
				    if (move.toLowerCase().includes(currentValue.toLowerCase())) {
					    moveObj = {}
					    moveObj["name"] = he.decode(move);
					    moveObj["value"] = cargo[x]["moveId"];
					    if (options.length < 25) options.push(moveObj);
				    }
				    x++;
			    } while (cargo[x]["chara"] === character)
		    }
	    } else {
		    if (json[character] === undefined) {
			    moveObj["name"] = 'Moves not found for ' + character + ', try another character';
			    moveObj["value"] = 'Moves not found for ' + character + ', try another character';
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
    }
	    await autocomplete.respond(options);
	}
});
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
	
  if (!command) return;
  await command.execute(interaction);

  if (interaction.commandName === 'cargo') {
	  cargo_characters = []
	  const response = await fetch(url);
	  cargo = await response.json();
	  for (let x in cargo) {
		  if (cargo[x]["chara"]!==null && (!cargo_characters.includes(cargo[x]["chara"]))) cargo_characters.push(cargo[x]["chara"])
	  }
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
      name: 'Claw. Use /frames, /cargo or /help to get started.'
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
    if (character === null) return null
    // Capitilize first letters of each word of the char name.
    let words = character.split(' ')
    for (let i in words) {
	    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1)
    }
    let char = words.join(' ');
	
    // Validate extra names.
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
    if (chart[char] === undefined) {
      return char;
    }
    return chart[char];
};
