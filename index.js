import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Events
} from "discord.js";
import OpenAI from "openai";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === "about") {
    return interaction.reply(
      "SparkAIResearch is focused on practical AI systems, automation, research, and real-world deployment."
    );
  }

  if (commandName === "team") {
    return interaction.reply(
      "CEO/Founder: Jameson Davies\nCTO: Dominik Desoto"
    );
  }

  if (commandName === "roadmap") {
    return interaction.reply(
      "Current Focus:\n• SparkAI Bot\n• Research Infrastructure\n• SmartTakeoff Development\n• Community Growth"
    );
  }

  if (commandName === "idea") {
    return interaction.reply(
      "Share your idea in the research channels and the team can review it."
    );
  }

  if (commandName === "ask") {
    await interaction.deferReply();

    const prompt = interaction.options.getString("question");

    const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `
You are SparkAI Bot, the official Discord assistant for SparkAIResearch.

Your job is to help members with:
- SparkAIResearch questions
- AI learning
- research ideas
- Discord guidance
- project help

Company facts:
- SparkAIResearch focuses on practical AI systems, automation, research, and real-world deployment.
- CEO/Founder: Jameson Davies
- CTO: Dominik Desoto
- Current focus: SparkAI Bot, research infrastructure, SmartTakeoff development, and community growth.

Rules:
- Be clear, friendly, and professional.
- Do not invent facts.
- Do not make up investors, partnerships, products, prices, legal claims, or team members.
- If you do not know something, say: "I don't have verified information on that yet."
- Keep answers helpful but not too long.
`
    },
    {
      role: "user",
      content: prompt
    }
  ]
});
    return interaction.editReply(
      response.choices[0].message.content
    );
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
