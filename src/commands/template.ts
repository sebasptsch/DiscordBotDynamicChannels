import { Command } from '@/classes/Command';
import { MQTT } from '@/classes/MQTT';
import { interactionDetails } from '@/utils/mqtt';
import DynamicaSecondary from '@classes/Secondary';
import db from '@db';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

export class TemplateCommand extends Command {
  constructor() {
    super('template');
  }

  response = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const name = interaction.options.getString('template', true);
    const channel = interaction.options.getString('channel', true);

    const primary = await db.primary.update({
      where: { id: channel },
      data: { template: name },
      include: { secondaries: true },
    });

    primary.secondaries.forEach(async (secondary) => {
      const dynamicaSecondary = DynamicaSecondary.get(secondary.id);

      dynamicaSecondary.update(interaction.client);
    });

    interaction.reply(`Template changed to \`${name}\`.`);
    const mqtt = MQTT.getInstance();
    mqtt?.publish(`dynamica/command/${interaction.commandName}`, {
      name,
      ...interactionDetails(interaction),
    });
  };

  data = new SlashCommandBuilder()
    .setName('template')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Edit the template for all secondary channels.')
    .addStringOption((option) =>
      option
        .setAutocomplete(true)
        .setName('channel')
        .setDescription('The channel to change the template for.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('template')
        .setDescription('The new template for all secondary channels.')
        .setRequired(true)
    );
}
