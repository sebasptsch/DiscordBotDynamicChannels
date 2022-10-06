import help from '@/help/bitrate';
import Command from '@classes/command';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkCreator from '@preconditions/creator';
import checkSecondary from '@preconditions/secondary';
import { ErrorEmbed } from '@utils/discordEmbeds';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('bitrate')
  .setDescription('Edit the bitrate of the current channel.')
  .addIntegerOption((option) =>
    option
      .setDescription('The bitrate to set the channel to.')
      .setName('bitrate')
  );
const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const bitrate = interaction.options.getInteger('bitrate');

  const guildMember = await interaction.guild.members.cache.get(
    interaction.user.id
  );

  const { channel } = guildMember.voice;

  if (!channel.manageable) {
    interaction.reply({
      embeds: [ErrorEmbed('Unable to manage channel.')],
    });
    return;
  }

  if (!bitrate) {
    channel.edit({ bitrate: 64000 }).then(() => {
      interaction.reply('Set bitrate to default.');
    });
    return;
  }
  if (!(bitrate <= 96 && bitrate >= 8)) {
  }
  try {
    await channel.edit({
      bitrate: bitrate ? bitrate * 1000 : 64000,
    });
    interaction.reply(
      `<#${channel.id}> bitrate changed to ${bitrate ?? 'default'}kbps.`
    );
  } catch (error) {
    interaction.reply({
      embeds: [
        ErrorEmbed(
          'Make sure that the bitrate is within the rang you have access to (kBps) e.g. 64 for 64000bps'
        ),
      ],
    });
  }
};

export const bitrate = new Command({
  preconditions: [checkSecondary, checkCreator],
  help,
  data,
  response,
});
