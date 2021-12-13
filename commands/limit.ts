import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../lib/prisma";
import { CommandInteraction } from "discord.js";
import { info } from "../lib/colourfulLogger";
import { ErrorEmbed, SuccessEmbed } from "../lib/discordEmbeds";
import { getChannel, getGuildMember } from "../lib/getCached";
import { checkPermissions } from "../lib/checks/permissions";
import { checkSecondary } from "../lib/checks/validSecondary";
import { checkOwner } from "../lib/checks/owner";

// Set General Template
module.exports = {
  data: new SlashCommandBuilder()
    .setName("limit")
    .setDescription("Edit the max number of people allowed in the current channel").addIntegerOption(option => option.setDescription("The maximum number of people that are allowed to join the channel.").setName("number").setRequired(true)),
  async execute(interaction: CommandInteraction) {
    const userLimit = interaction.options.getInteger("number", true);

    if (!interaction.guild) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    if (!(await checkSecondary(interaction))) {
      await interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Not a valid Dynamica channel.")],
      });
      return;
    }

    const channel = guildMember?.voice.channel;

    if (!channel) return;
    if (!guildMember?.voice.channel) return;

    // check if current owner
    if (!((await checkOwner(guildMember.voice.channel, guildMember)) || (await checkPermissions(interaction)))) {
      interaction.reply({
        embeds: [ErrorEmbed("You are not the current owner of this channel.")],
        ephemeral: true,
      });
      return;
    }
    await guildMember.voice.channel.edit({userLimit})
    await interaction.reply({
      embeds: [
        SuccessEmbed(
          `Channel limit changed to ${userLimit}.`
        ),
      ],
    });
  },
};
