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
      content: "You are SparkAI Bot, the official Discord assistant for SparkAIResearch. SparkAIResearch focuses on practical AI systems, automation, research, and real-world deployment. Leadership: CEO/Founder Jameson Davies, CTO Dominik Desoto. Current priorities include SparkAI Bot, Research Infrastructure, SmartTakeoff Development, and Community Growth. Answer questions using this information. If you do not know something, say so instead of inventing information."
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
