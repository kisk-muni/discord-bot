import { EmbedBuilder, TextChannel, Client } from "discord.js";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import supabase from "./supabase";
import { stripHtml } from "string-strip-html";
import { parseISO, sub, isBefore } from "date-fns";

type PortfolioRecord = {
  title?: string;
  url?: string;
  feed_url?: string;
  image_url?: string;
};

const tableRecordSchema = z.object({
  id: z.string(),
  created_at: z.string().nullable(),
  title: z.string().nullable(),
  url: z.string().nullable(),
  description: z.string().nullable(),
  published_at: z.string().nullable(),
  portfolio_id: z.string(),
  thumbnail_url: z.string().nullable(),
  discord_message_id: z.string().nullable(),
});

const payloadSchema = z.object({
  type: z.enum(["INSERT", "UPDATE", "DELETE"]),
  table: z.string(),
  schema: z.string(),
  record: tableRecordSchema.nullable(),
  old_record: tableRecordSchema.nullable(),
});

export async function syncPost(
  req: Request,
  res: Response,
  next: NextFunction,
  client: Client
) {
  try {
    // check auth
    const apiKey = req?.headers?.authorization?.substring("Bearer ".length);
    if (apiKey !== process.env.API_KEY)
      throw new Error("Provided API key is invalid.");

    // parse supabase webhook payload
    // info: https://supabase.com/docs/guides/database/webhooks#payload
    const { type, record } = payloadSchema.parse(req.body);

    // get discord channel
    const channelId =
      req?.query?.env == "production"
        ? process.env.SCRAPBOOK_CHANNEL_ID
        : process.env.SCRAPBOOK_TEST_CHANNEL_ID;
    const channel = client.channels.cache.get(
      /* eslint-disable  @typescript-eslint/no-non-null-assertion */
      channelId!
    ) as TextChannel | undefined;
    if (!channel) throw new Error("Posts channel not found.");

    if (type === "INSERT" && record) {
      // skip articles older thay 1 day
      if (record.published_at) {
        const publishedAt = parseISO(record.published_at);
        const dayBefore = sub(new Date(), {
          days: 1,
        });
        if (isBefore(publishedAt, dayBefore)) {
          res.json({ message: `Skipping old post ${type}.` });
          return;
        }
      }

      // discord message prerequisite:
      // get portfolio data
      const { data, error: portfolioError } = await supabase
        .from("portfolios")
        .select()
        .eq("id", record.portfolio_id)
        .limit(1)
        .single();
      if (portfolioError)
        throw new Error(`Couldnt find portfolio ${record.portfolio_id}`);
      const portfolio = data as PortfolioRecord;

      // send discord message
      const embed = new EmbedBuilder()
        .setColor(0xfcda0b) // yellow
        .setTitle(record?.title || null)
        .setURL(record?.url || null)
        .setAuthor({
          name: portfolio?.title || portfolio?.url || "Beze jména",
          iconURL: portfolio?.image_url,
          url: `https://scrapbook.kisk.cz/portfolio?feed=${portfolio.feed_url}`,
        })
        .setDescription(
          record?.description ? stripHtml(record.description).result : null
        )
        .setImage(record?.thumbnail_url || null);
      const message = await channel.send({ embeds: [embed] });

      // save discord_message_id
      const { error: updatePortfolioPostError } = await supabase
        .from("portfolio_posts")
        .update({ discord_message_id: message.id })
        .eq("id", record.id);
      if (updatePortfolioPostError)
        console.log(
          `Updating discord_message_id on portfolio_post ${record.id} has failed.`
        );

      res.json({ message: "The update was successfully posted to discord." });
      return;
    } else {
      res.json({ message: `Skipping ${type}.` });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
}
