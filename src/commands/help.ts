import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import _ from "lodash";
import Command from "../classes/command.js";
import * as commandsList from "../commands/index.js";
export const help = new Command()
  .setHelpText("Shows a list of commands and their asociated descriptions. ")
  .setCommandData(
    new SlashCommandBuilder()
      .setName("help")
      .setDescription(
        "A help command that lists all commands available to users of the bot."
      )
      .addStringOption((option) =>
        option
          .setRequired(false)
          .setName("subcommand")
          .setDescription("Subcommand help")
          .setAutocomplete(true)
      )
  )
  .setResponse(async (interaction) => {
    const subcommand = interaction.options.getString("subcommand", false);
    const subcommandFile = commandsList[subcommand];
    if (subcommand) {
      const { helpText } = subcommandFile;
      const embed = new Embed()
        .setAuthor({
          name: "Dynamica",
          url: "https://dynamica.dev",
          iconURL: "https://dynamica.dev/img/dynamica.png",
        })
        .setColor(3066993)
        .setTitle(subcommand)
        .setFooter({
          text: `Find out more https://dynamica.dev/docs/commands/${subcommand}`,
        })
        .setDescription(helpText.long ?? helpText.short);
      return interaction.reply({ embeds: [embed] });
    } else {
      const commands = Object.values(commandsList) as Command[];
      const commandFields: { value: string; name: string; inline: true }[][] =
        _.chunk(
          commands.map((command) => ({
            name: command.commandData.name,
            value: commandsList[command.commandData.name].helpText
              .short as string,
            inline: true,
          })),
          25
        );
      return interaction.reply({
        embeds: commandFields.map((commandField) =>
          new Embed()
            .setAuthor({
              name: "Dynamica",
              url: "https://dynamica.dev",
              iconURL: "https://dynamica.dev/img/dynamica.png",
            })
            .setColor(3066993)
            .setTitle("Help")
            .setFooter({
              text: `Find out more https://dynamica.dev/docs/commands`,
            })
            .addFields(...commandField)
        ),
      });
    }
  });
