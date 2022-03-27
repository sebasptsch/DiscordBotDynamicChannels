import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import { checkAdminPermissions } from "../utils/conditions/admin.js";
import { checkCreator } from "../utils/conditions/index.js";
import { db } from "../utils/db.js";
import { ErrorEmbed } from "../utils/discordEmbeds.js";
import { getGuildMember } from "../utils/getCached.js";
import { editChannel } from "../utils/operations/secondary.js";

// export const unlock: CommandType = {
//   preconditions: [checkCreator, checkAdminPermissions],
//   data: new SlashCommandBuilder()
//     .setName("unlock")
//     .setDescription("Remove any existing locks on locked secondary channels."),
//   helpText: {
//     short:
//       "This resets the permissions channel whose permissions have been altered by any of the permissions related command like /lock and /permission.",
//   },
//   async execute(interaction) {
//     const guildMember = await getGuildMember(
//       interaction.guild.members,
//       interaction.user.id
//     );

//     const { channel } = guildMember.voice;

//     if (channel.manageable) {
//       channel.lockPermissions();
//       db.secondary.update({
//         where: { id: channel.id },
//         data: {
//           locked: false,
//         },
//       });

//       editChannel({ channel });
//       return interaction.reply(`Removed lock on <#${channel.id}>`);
//     } else {
//       return interaction.reply({
//         ephemeral: true,
//         embeds: [ErrorEmbed("Couldn't edit channel.")],
//       });
//     }
//   },
// };

export const unlock = new Command()
  .setPreconditions([checkCreator, checkAdminPermissions])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("unlock")
      .setDescription("Remove any existing locks on locked secondary channels.")
  )
  .setHelpText(
    "This resets the permissions channel whose permissions have been altered by any of the permissions related command like /lock and /permission."
  )
  .setResponse(async (interaction) => {
    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const { channel } = guildMember.voice;

    if (channel.manageable) {
      channel.lockPermissions();
      db.secondary.update({
        where: { id: channel.id },
        data: {
          locked: false,
        },
      });

      editChannel({ channel });
      return interaction.reply(`Removed lock on <#${channel.id}>`);
    } else {
      return interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed("Couldn't edit channel.")],
      });
    }
  });
