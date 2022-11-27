import { REST, Routes, Client, GatewayIntentBits, Partials } from "discord.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { handlePostUpdate } from "./send-update";
import express from "express";

dotenv.config();

if (!process.env.DISCORD_BOT_TOKEN)
  throw new Error("Missing DISCORD_BOT_TOKEN.");
if (!process.env.DISCORD_APP_CLIENT_ID)
  throw new Error("Missing DISCORD_APP_CLIENT_ID.");
if (!process.env.SCRAPBOOK_CHANNEL_ID)
  throw new Error("Missing SCRAPBOOK_CHANNEL_ID.");
if (!process.env.API_KEY) throw new Error("Missing API_KEY.");

const app = express();
const port = 3000;
app.use(bodyParser.json());

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
];

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN
);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      /* eslint-disable  @typescript-eslint/no-non-null-assertion */
      Routes.applicationCommands(process.env.DISCORD_APP_CLIENT_ID!),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

app.post("/send", (req, res, next) => handlePostUpdate(req, res, next, client));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// To invoke:
// curl --request POST \
//   --url http://localhost:3000/send \
//   --header 'Content-Type: application/json' \
//   --data '{"apiKey":"API_KEY","update":{"title":"nazev clanku","url":"https://discord.js.org","description":"popisek","imageUrl":"https://i.imgur.com/AfFp7pu.png","author":{"name":"jmeno prijmeni","url":"https://discord.js.org","imageUrl":"https://i.imgur.com/AfFp7pu.png"}}}'
