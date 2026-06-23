import "dotenv/config";
import fs from "fs";
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
const companyInfo = fs.readFileSync("companyInfo.txt", "utf8");
const smartTakeoffInfo = fs.readFileSync("smarttakeoff.txt", "utf8");
const sparkAIInfo = fs.readFileSync("sparkairesearch.txt", "utf8");
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
if (commandName === "help") {
  return interaction.reply(
    "SparkAI Bot Commands:\n\n/about - Learn about SparkAIResearch\n/team - See leadership\n/roadmap - View current focus\n/idea - Share a research idea\n/ask - Ask SparkAI Bot a question\n/help - Show this command list"
  );
}
  if (commandName === "roadmap") {
    return interaction.reply(
      "Current Focus:\n• SparkAI Bot\n• Research Infrastructure\n• SmartTakeoff Development\n• Community Growth"
    );
  }

  if (commandName === "idea") {
  const idea = interaction.options.getString("idea");
  const channel = interaction.guild.channels.cache.find(
    ch => ch.name === "ideas-submissions"
  );

  if (!channel) {
    return interaction.reply("I could not find the ideas-submissions channel.");
  }

  await channel.send(
    `💡 New Idea Submission\n\nSubmitted by: ${interaction.user.username}\n\nIdea:\n${idea}\n\nStatus: Pending Review`
  );

  return interaction.reply("Idea submitted successfully.");
}

  if (commandName === "ask") {
  await interaction.deferReply();

  try {
    const prompt = interaction.options.getString("question");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are SparkAI Bot, the official Discord assistant for SparkAIResearch.

Use the approved company information below when answering questions.

Approved company information:

${companyInfo}
SmartTakeoff information:

${smartTakeoffInfo}
SparkAIResearch information:

${sparkAIInfo}
Rules:
- Be clear, friendly, and professional.
- Do not invent facts.
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

    return interaction.editReply(response.choices[0].message.content);
  } catch (error) {
    console.error(error);
    return interaction.editReply("Sorry, I had trouble answering that. Please try again in a minute.");
  }
}
});

client.login(process.env.DISCORD_BOT_TOKEN);


