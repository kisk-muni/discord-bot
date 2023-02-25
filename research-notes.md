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

## feature research: auto thread creation

- [thread events](https://discordjs.guide/popular-topics/threads.html#thread-related-gateway-events)

```js
const thread = await message.startThread({
  name: "food-talk",
  autoArchiveDuration: "MAX", // 'MAX',
  reason: "Needed a separate thread for food",
});
console.log(`Created thread: ${thread.name}`);
```

## feature research: GPT-3 Scrappy replies

- [playground](https://platform.openai.com/playground/p/default-qa?lang=node.js)
- [examples](https://platform.openai.com/examples)

```js
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const response = await openai.createCompletion({
  model: "text-davinci-003",
  prompt:
    'I am a highly intelligent question answering bot. If you ask me a question that is rooted in truth, I will give you the answer. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with "Unknown".\n\nQ: What is human life expectancy in the United States?\nA: Human life expectancy in the United States is 78 years.\n\nQ: Who was president of the United States in 1955?\nA: Dwight D. Eisenhower was president of the United States in 1955.\n\nQ: Which party did he belong to?\nA: He belonged to the Republican Party.\n\nQ: What is the square root of banana?\nA: Unknown\n\nQ: How does a telescope work?\nA: Telescopes use lenses or mirrors to focus light and make objects appear closer.\n\nQ: Where were the 1992 Olympics held?\nA: The 1992 Olympics were held in Barcelona, Spain.\n\nQ: How many squigs are in a bonk?\nA: Unknown\n\nQ:',
  temperature: 0,
  max_tokens: 100,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop: ["\n"],
});
```
