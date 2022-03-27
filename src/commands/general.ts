import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import { checkManager } from "../utils/conditions/index.js";
import { db } from "../utils/db.js";
import { editChannel } from "../utils/operations/secondary.js";

export const general = new Command()
  .setPreconditions([checkManager])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("general")
      .setDescription("Edit the name/template for the default general channel.")
      .addStringOption((option) =>
        option
          .setAutocomplete(true)
          .setName("channel")
          .setDescription("The channel to change the template for.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The new template for the general channel.")
          .setRequired(true)
      )
  )
  .setHelpText(
    "Using the /general command you can set the template for the channel name of the channel you're in when nobody is playing a game."
  )
  .setResponse(async (interaction) => {
    const name = interaction.options.getString("name", true);
    const channel = interaction.options.getString("channel", true);

    await db.primary.update({
      where: { id: channel },
      data: { generalName: name },
    });
    const discordChannel = interaction.guild.channels.cache.get(channel);
    if (discordChannel.isVoice()) {
      editChannel({ channel: discordChannel });
    }
    await interaction.reply(
      `General template for <#${channel}> changed to ${name}.`
    );
  });
