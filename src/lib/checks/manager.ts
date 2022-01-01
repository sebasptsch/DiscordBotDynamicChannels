import { CommandInteraction } from "discord.js";
import { ErrorEmbed } from "../discordEmbeds.js";
import { getGuildMember } from "../getCached.js";
import { Check } from "./check.js";

/**
 * Checks permissions for Dynamica Manager role. (admin overrides)
 * @param interaction Discord Interaction
 * @returns Boolean if the member has permission to manage dynamica channels.
 */
export const checkManager: Check = async (interaction: CommandInteraction) => {
  if (!interaction.guild) return false;
  const guildMember = await getGuildMember(
    interaction.guild.members,
    interaction.user.id
  );
  const dynamicaManager = guildMember?.roles.cache.some(
    (role) => role.name === "Dynamica Manager"
  );
  const admin = guildMember.permissions.has("ADMINISTRATOR");
  if (!dynamicaManager && !admin) {
    await interaction.reply({
      embeds: [
        ErrorEmbed(
          "You must have the Dynamica Manager role to execute this command."
        ),
      ],
    });
  }

  return dynamicaManager || admin;
};
