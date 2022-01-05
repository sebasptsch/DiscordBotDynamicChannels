import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandBuilder } from "../lib/builders";
import { checkManager } from "../lib/conditions";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { updateGuild } from "../lib/operations/guild.js";

export const text = new CommandBuilder()
  .setConditions([checkManager])
  .setData(
    new SlashCommandBuilder()
      .setName("text")
      .setDescription("Enable or disable temporary text channels")
      .addBooleanOption((option) =>
        option
          .setName("state")
          .setDescription(
            "Set to true to enable text channels. Set to false to disable them."
          )
          .setRequired(true)
      )
  )
  .setResponse(async (interaction) => {
    const state = interaction.options.getBoolean("state", true);
    if (!interaction.guildId) return;

    await updateGuild(interaction.guildId, { textChannelsEnabled: state });
    await interaction.reply({
      ephemeral: true,
      embeds: [
        SuccessEmbed(
          `Temporary text channels ${
            !state ? "disabled" : "enabled"
          } for all future created channels.`
        ),
      ],
    });
  });
