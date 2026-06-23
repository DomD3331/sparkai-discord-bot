import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("about")
    .setDescription("About SparkAIResearch"),

  new SlashCommandBuilder()
    .setName("team")
    .setDescription("View the SparkAIResearch team"),

  new SlashCommandBuilder()
    .setName("roadmap")
    .setDescription("View current roadmap"),

  new SlashCommandBuilder()
    .setName("idea")
    .setDescription("Submit an idea"),

  new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask SparkAI Bot a question")
    .addStringOption(option =>
      option
        .setName("question")
        .setDescription("Your question")
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({
  version: "10"
}).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("Registering commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commands }
    );

    console.log("Commands registered.");
  } catch (error) {
    console.error(error);
  }
})();
