import "dotenv/config";
import fs from "fs";
import {
  Client,
  GatewayIntentBits,
  Events
} from "discord.js";
import OpenAI from "openai";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions
  ]
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
    "SparkAI Bot Commands:\n\n/about - Learn about SparkAIResearch\n/team - See leadership\n/roadmap - View current focus\n/idea - Share a research idea\n/bug - Report a bug\n/ask - Ask SparkAI Bot a question\n/help - Show this command list"
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
  if (commandName === "bug") {
  const issue = interaction.options.getString("issue");

  const bugChannel = interaction.guild.channels.cache.find(
    ch => ch.name === "bug-reports"
  );

  if (!bugChannel) {
    return interaction.reply("I could not find the bug-reports channel.");
  }

  const bugMessage = await bugChannel.send(
    `🐞 Bug Report

Reported by: ${interaction.user.username}

Issue:
${issue}

Status: Open`
  );

  await bugMessage.react("🛠️");
  await bugMessage.react("✅");
  await bugMessage.react("❌");

  return interaction.reply("Bug report submitted successfully.");
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

Use only the approved knowledge below when answering questions.

Approved company information:
${companyInfo}

SmartTakeoff information:
${smartTakeoffInfo}

SparkAIResearch information:
${sparkAIInfo}

Rules:
- Be clear, friendly, and professional.
- Do not invent facts.
- Do not guess.
- If the answer is not in the approved knowledge, say: "I don't have verified information on that yet."
- For SmartTakeoff, never say it verifies, certifies, guarantees, proves, or approves code, compliance, pricing, products, or scope.
- SmartTakeoff is not an authority.
- Say SmartTakeoff helps organize, draft, trace, index, support, and assist contractor review.
- Licensed contractors, AHJs, NEC, NFPA, manufacturers, distributors, contract documents, and applicable law remain the authorities.
- Keep answers helpful and concise.
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
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  const message = reaction.message;
  console.log(
  "REACTION:",
  reaction.emoji.name,
  "CHANNEL:",
  message.channel.name
);

  const allowedChannels = [
  "ideas-submissions",
  "research-queue",
  "research-active",
  "research-critical",
  "research-medium",
  "research-low",
  "bug-reports",
  "bug-active",
  "bug-fixed"
];

  if (!allowedChannels.includes(message.channel.name)) return;

  const approvedChannel = message.guild.channels.cache.find(
    ch => ch.name === "approved-ideas"
  );

  const rejectedChannel = message.guild.channels.cache.find(
    ch => ch.name === "rejected-ideas"
  );

  if (
    message.channel.name === "ideas-submissions" &&
    reaction.emoji.name === "✅" &&
    approvedChannel
  ) {
    await approvedChannel.send(
      `✅ Approved Idea\n\nReviewed by: ${user.username}\n\nOriginal submission:\n${message.content}`
    );

    const researchQueue = message.guild.channels.cache.find(
      ch => ch.name === "research-queue"
    );

    if (researchQueue) {
      const queueMessage = await researchQueue.send(
        `🧠 Research Queue Item\n\nApproved by: ${user.username}\n\n${message.content}`
      );

      await queueMessage.react("🔴");
      await queueMessage.react("🟡");
      await queueMessage.react("🟢");
      await queueMessage.react("🔬");
    }
  }

  if (
    message.channel.name === "ideas-submissions" &&
    reaction.emoji.name === "❌" &&
    rejectedChannel
  ) {
    await rejectedChannel.send(
      `❌ Rejected Idea\n\nReviewed by: ${user.username}\n\nOriginal submission:\n${message.content}`
    );
  }

  if (
  ["research-queue", "research-critical", "research-medium", "research-low"].includes(message.channel.name) &&
  reaction.emoji.name === "🔬"
) {
    const researchActive = message.guild.channels.cache.find(
      ch => ch.name === "research-active"
    );

    if (researchActive) {
      await researchActive.send(
        `🔬 Active Research\n\nAssigned To: ${user.username}\n\nStarted: ${new Date().toLocaleDateString()}\n\nStatus: In Progress\n\n${message.content}`
      );
    }
  }
if (message.channel.name === "research-queue" && reaction.emoji.name === "🔴") {
  const criticalChannel = message.guild.channels.cache.find(
    ch => ch.name === "research-critical"
  );

  if (criticalChannel) {
    await criticalChannel.send(
      `🔴 Critical Research\n\nAssigned Priority: Critical\n\n${message.content}`
    );
  }
}

if (message.channel.name === "research-queue" && reaction.emoji.name === "🟡") {
  const mediumChannel = message.guild.channels.cache.find(
    ch => ch.name === "research-medium"
  );

  if (mediumChannel) {
    await mediumChannel.send(
      `🟡 Medium Priority Research\n\nAssigned Priority: Medium\n\n${message.content}`
    );
  }
}

if (message.channel.name === "research-queue" && reaction.emoji.name === "🟢") {
  const lowChannel = message.guild.channels.cache.find(
    ch => ch.name === "research-low"
  );

  if (lowChannel) {
    await lowChannel.send(
      `🟢 Low Priority Research\n\nAssigned Priority: Low\n\n${message.content}`
    );
  }
}
  if (message.channel.name === "research-active" && reaction.emoji.name === "✅") {
    const researchComplete = message.guild.channels.cache.find(
      ch => ch.name === "research-complete"
    );

    if (researchComplete) {
      await researchComplete.send(
  `✅ Research Complete

Completed By: ${user.username}

Completed: ${new Date().toLocaleDateString()}

${message.content
  .replace("Status: Pending Review", "Status: Closed")
  .replace("Status: In Progress", "Status: Closed")}`
);
    }
  }

if (message.channel.name === "bug-reports" && reaction.emoji.name === "🛠️") {
  const bugActive = message.guild.channels.cache.find(
    ch => ch.name === "bug-active"
  );

 if (bugActive) {
  await bugActive.send(
    `🛠️ Active Bug\n\nAssigned To: ${user.username}\n\n${message.content.replace(
      "Status: Open",
      "Status: In Progress"
    )}`
  );
}
}

if (
  ["bug-reports", "bug-active"].includes(message.channel.name) &&
  reaction.emoji.name === "✅"
) {
  const bugFixed = message.guild.channels.cache.find(
    ch => ch.name === "bug-fixed"
  );

if (bugFixed) {
  await bugFixed.send(
    `✅ Bug Fixed\n\nFixed By: ${user.username}\n\n${message.content
      .replace("Status: Open", "Status: Closed")
      .replace("Status: In Progress", "Status: Closed")}`
  );
}
}
  });

client.login(process.env.DISCORD_BOT_TOKEN);
