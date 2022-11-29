## Scrappy

Scrappy is the Discord bot that posts updates from [scrapbook.kisk.cz](https://scrapbook.kisk.cz/) to our Discord community.

## Geting started

Scrappy is powered by [Discord.js](https://discord.js.org/), [Express.js](https://expressjs.com/),
[Supabase Postgres database](https://supabase.com/) and runs on [Digitalocean’s App Platform](https://www.digitalocean.com/products/app-platform).

Developing Scrappy assumes having a runnning [Scrapbook’s](https://github.com/kisk-muni/scrapbook) Supabase database.
At this point we develop Scrappy on production database and make sure that all testing is done in private channel,
so community members don’t notice. Since Scrappy depends on Scrapbook’s database schema, its code may be moved or connected
to Scrapbook’s repository later on.

Useful resources:

- [Discord.js Guide](https://discordjs.guide/) - covers the most common Discord bot scenarios with code examples
- [Next.js Discord Bot](https://github.com/vercel/nextjs-discord-bot) - battle tested Discord.js bot that powers Next.js community and has small codebase
- [Hack Clubs’s Scrappy](https://github.com/hackclub/scrappy) - our spiritual ancestor with lots of social learning infrastructuring work and experience

1. install dependencies

```
npm i
```

2. set environmental variables

```
cp .env.example .env
```

3. run local development server

```
npm run dev
```

## Origin of Scrappy

Scrappy is a Discord sibling of Hack Clubs’s Slack bot [Scrappy](https://github.com/hackclub/scrappy).
