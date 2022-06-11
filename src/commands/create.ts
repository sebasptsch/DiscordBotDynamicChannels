import help from '@/help/create';
import Command from '@classes/command';
import DynamicaPrimary from '@classes/primary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkManager from '@preconditions/manager';
import { ErrorEmbed } from '@utils/discordEmbeds';
import { GuildChannel } from 'discord.js';

export default new Command()
  .setPreconditions([checkManager])
  .setCommandData(
    new SlashCommandBuilder()
      .setName('create')
      .setDescription('Create a primary channel.')
      .addChannelOption((option) =>
        option
          .addChannelTypes(4)
          .setName('section')
          .setDescription(
            'A section that the voice channel should be created under.'
          )
          .setRequired(false)
      )
  )
  .setHelp(help)
  .setResponse(async (interaction) => {
    const section = interaction.options.getChannel(
      'section'
    ) as GuildChannel | null;

    if (!interaction.guild?.me?.permissions.has('MANAGE_CHANNELS')) {
      return interaction.reply({
        ephemeral: true,
        embeds: [ErrorEmbed('Bot requires manage channel permissions.')],
      });
    }

    const newPrimary = new DynamicaPrimary(interaction.client);
    await newPrimary.create(interaction.guild, interaction.user, section);

    return interaction.reply(
      `New voice channel <#${newPrimary.id}> successfully created.`
    );
  });
