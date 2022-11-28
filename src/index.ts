import { REST, Routes, Client, GatewayIntentBits, Partials } from "discord.js";
import bodyParser from "body-parser";
import { syncPost } from "./sync-post";
import express from "express";

if (!process.env.DISCORD_BOT_TOKEN)
  throw new Error("Missing DISCORD_BOT_TOKEN.");
if (!process.env.DISCORD_APP_CLIENT_ID)
  throw new Error("Missing DISCORD_APP_CLIENT_ID.");
if (!process.env.SCRAPBOOK_CHANNEL_ID)
  throw new Error("Missing SCRAPBOOK_CHANNEL_ID.");
if (!process.env.API_KEY) throw new Error("Missing API_KEY.");
if (!process.env.SUPABASE_ANON_KEY)
  throw new Error("Missing SUPABASE_ANON_KEY.");
if (!process.env.SUPABASE_API_URL) throw new Error("Missing SUPABASE_API_URL.");

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

app.post("/sync-post", (req, res, next) => syncPost(req, res, next, client));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// To invoke:
// curl --request POST \
//   --url 'http://localhost:3000/sync-post?env=development' \
//   --header 'Authorization: Bearer API_KEY' \
//   --header 'Content-Type: application/json' \
//   --data '{
//     "type": "INSERT",
//     "table": "portfolio_posts",
//     "schema": "public",
//     "record": {
//        "created_at": "2022-11-20 19:48:24.495018+00",
//        "title": "Reflexe: Connectivism: A Learning Theory for the Digital Age",
//        "url": "https://daliborcernocky.wordpress.com/2020/11/22/reflexe-connectivism-a-learning-theory-for-the-digital-age/",
//        "description": "Siemens, G. (2015). Connectivism: A Learning Theory for the Digital Age: A knowledge learning theory for the digital age? International Journal &#8230; <a class=\"more-link\" href=\"https://daliborcernocky.wordpress.com/2020/11/22/reflexe-connectivism-a-learning-theory-for-the-digital-age/\">Další</a>",
//        "published_at": "2022-11-22 19:43:05+00",
//        "id": "d3764265-80a6-4e39-b3e9-dfc75688e577",
//        "portfolio_id": "e3a6917a-b4f9-4428-b148-fe59444b5f8c",
//        "thumbnail_url": "",
//        "discord_message_id": ""
//      },
//      "old_record": null
//    }'
