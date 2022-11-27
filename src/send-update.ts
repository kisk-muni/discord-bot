import { EmbedBuilder, TextChannel, Client } from "discord.js";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  author: z.object({
    name: z.string().optional(),
    url: z.string().url(),
    imageUrl: z.string().optional(),
  }),
});

const updateBodySchema = z.object({
  environment: z.string().optional().default("development"),
  update: updateSchema,
  apiKey: z.string(),
});

export function handlePostUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
  client: Client
) {
  try {
    if (req.method !== "POST") throw new Error("Method not allowed.");
    const { update, apiKey, environment } = updateBodySchema.parse(req.body);
    if (apiKey !== process.env.API_KEY)
      throw new Error("Provided API key is invalid.");
    const channelId =
      environment == "production"
        ? process.env.SCRAPBOOK_CHANNEL_ID
        : process.env.SCRAPBOOK_TEST_CHANNEL_ID;
    const channel = client.channels.cache.get(
      /* eslint-disable  @typescript-eslint/no-non-null-assertion */
      channelId!
    ) as TextChannel | undefined;
    if (!channel) throw new Error("Posts channel not found.");
    const embed = new EmbedBuilder()
      .setColor(0xfcda0b) // yellow
      .setTitle(update.title)
      .setURL(update.url)
      .setAuthor({
        name: update.author.name || update.author.url,
        iconURL: update.author.imageUrl,
        url: update.author.url,
      })
      .setDescription(update.description || null)
      .setImage(update.imageUrl || null);
    channel.send({ embeds: [embed] });
    res.json({ message: "The update was successfully posted to discord." });
  } catch (error) {
    console.error(error);
    next(error);
  }
}
