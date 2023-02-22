import {
  REST,
  Routes,
  Events,
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import bodyParser from "body-parser";
import { syncPost } from "./sync-post";
import express from "express";
import supabase from "./supabase";

if (!process.env.DISCORD_BOT_TOKEN)
  throw new Error("Missing DISCORD_BOT_TOKEN.");
if (!process.env.DISCORD_APP_CLIENT_ID)
  throw new Error("Missing DISCORD_APP_CLIENT_ID.");
if (!process.env.SCRAPBOOK_CHANNEL_ID)
  throw new Error("Missing SCRAPBOOK_CHANNEL_ID.");
if (!process.env.SCRAPBOOK_TEST_CHANNEL_ID)
  throw new Error("Missing SCRAPBOOK_TEST_CHANNEL_ID.");
if (!process.env.API_KEY) throw new Error("Missing API_KEY.");
if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
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

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (
    reaction.message.partial &&
    [
      process.env.SCRAPBOOK_CHANNEL_ID,
      process.env.SCRAPBOOK_TEST_CHANNEL_ID,
    ].includes(reaction.message.channelId)
  ) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message: ", error);
    }
  }
  const { error } = await supabase.from("discord_message_reactions").insert({
    message_id: reaction.message.id,
    emoji_name: reaction.emoji.name,
    discord_user_id: user.id,
    emoji_id: reaction.emoji.id,
  });
  if (error)
    console.error(
      `Couldnt insert discord_message_reaction ${reaction.message.id} ${error.message}.`
    );
  console.log(
    `${user.username} with id ${user.id} created "${reaction.emoji.name}" reaction on message ${reaction.message.id}.`
  );
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (
    reaction.message.partial &&
    [
      process.env.SCRAPBOOK_CHANNEL_ID,
      process.env.SCRAPBOOK_TEST_CHANNEL_ID,
    ].includes(reaction.message.channelId)
  ) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message: ", error);
    }
  }
  const match: {
    message_id: string;
    emoji_name: string | null;
    discord_user_id: string;
    emoji_id?: string;
  } = {
    message_id: reaction.message.id,
    emoji_name: reaction.emoji.name,
    discord_user_id: user.id,
  };
  if (reaction.emoji.id) match.emoji_id = reaction.emoji.id;
  const { error } = await supabase
    .from("discord_message_reactions")
    .delete()
    .match(match);
  if (error)
    console.error(
      `Couldnt delete discord_message_reaction ${reaction.message.id} ${error.message}.`
    );
  console.log(
    `${user.username} with id ${user.id} removed their "${reaction.emoji.name}" reaction on message ${reaction.message.id}.`
  );
});

client.login(process.env.DISCORD_BOT_TOKEN);

app.post("/sync-post", (req, res, next) => syncPost(req, res, next, client));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
