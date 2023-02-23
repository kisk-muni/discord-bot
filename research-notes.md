# discord bot notes

## feature research: collection of reactions on posts in #scrapbook channel

main parts:

1. fetch all old reactions
2. collect all new reactions

resources:

- [Listening for reactions on old messages](https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages)
  - contains simple code example
- [Discord Emoji gist](https://gist.github.com/scragly/b8d20aece2d058c8c601b44a689a47a0)
  - two types of emojis:
    - unicode emojis - identified only by emoji.name eg. `🙂`
    - custom emojis
      - discord specific objects
      - have their own discord id
      - specific name
