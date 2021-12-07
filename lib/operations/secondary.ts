import {
  BaseGuildVoiceChannel,
  GuildChannelManager,
  GuildMember,
} from "discord.js";
import { SimpleIntervalJob, Task } from "toad-scheduler";
import { debug } from "../colourfulLogger";
import { formatString } from "../formatString";
import { prisma } from "../prisma";
import { scheduler } from "../scheduler";
import { updateActivityCount } from "./general";

/**
 * Deletes Secondary Channel.
 * @param channelManager Discord Channel Manager
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deleteSecondary = async (channel: BaseGuildVoiceChannel) => {
  const { id } = channel;
  const channelConfig = await prisma.secondary.findUnique({
    where: { id },
  });
  if (channel?.members.size !== 0 || !channel?.deletable || !channelConfig)
    return;
  await Promise.all([
    prisma.secondary.delete({ where: { id } }),
    channel?.delete(),
  ]);
  scheduler.removeById(id);
  await updateActivityCount(channel.client);
  await debug(`Secondary channel deleted ${id}.`);
};

/**
 * Deleted Secondary Channel.
 * @param channelId Channel ID to delete
 * @returns Promise
 */
export const deletedSecondary = async (channelId: string) => {
  const channel = await prisma.secondary.findUnique({
    where: { id: channelId },
  });
  if (!channel) return;
  await prisma.secondary.delete({ where: { id: channelId } });
  await debug(`Secondary channel deleted ${channelId}`);
};

/**
 * Creates a secondary channel linked to a primary.
 * @param channelManager Discord's Channel Manager.
 * @param primaryId ID of the primary channel to link to.
 * @param member The user (if they're specified) to be moved to the new channel.
 * @returns
 */
export const createSecondary = async (
  channelManager: GuildChannelManager,
  primaryId: string,
  member?: GuildMember
) => {
  const primaryChannel = await prisma.primary.findUnique({
    where: { id: primaryId },
    include: { aliases: true, secondaries: true },
  });

  if (!primaryChannel) return;
  const cachedChannel = channelManager.cache.get(primaryId);
  const channel = cachedChannel
    ? cachedChannel
    : await channelManager.fetch(primaryId);
  if (!primaryChannel || !channel || !channel.isVoice()) return;
  const activities = Array.from(channel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });
  const str = !activities.length
    ? primaryChannel.generalName
    : primaryChannel.template;
  const secondary = await channelManager.create(
    formatString(str, {
      creator: member?.displayName as string,
      channelNumber: primaryChannel.secondaries.length + 1,
      activities: activities,
      aliases: primaryChannel.aliases,
      memberCount: channel.members.size,
    }),
    {
      type: "GUILD_VOICE",
      parent: channel?.parent ? channel.parent : undefined,
      position: channel?.position ? channel.position + 1 : undefined,
    }
  );
  secondary.setPosition(channel?.position + 1);
  if (secondary.parent) {
    secondary.lockPermissions();
  }
  if (member) {
    member.voice.setChannel(secondary);
  }

  await prisma.secondary.create({
    data: {
      id: secondary.id,
      primaryId,
    },
  });
  scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob(
      { minutes: 5 },
      new Task(secondary.id, () => refreshSecondary(secondary))
    )
  );
  await updateActivityCount(channelManager.client);
  await debug(
    `Secondary channel ${secondary.name} created by ${member?.user.tag} in ${channelManager.guild.name}.`
  );
};

/**
 * Retrieves data from db and changes channel name with formatting.
 * @param id Secondary channel id.
 * @param channelManager Discord Channel Manager
 * @returns nothing.
 */
export const refreshSecondary = async (channel: BaseGuildVoiceChannel) => {
  const { id } = channel;
  const channelConfig = await prisma.secondary.findUnique({
    where: { id },
  });
  if (!channelConfig) return;
  const primaryConfig = await prisma.primary.findUnique({
    where: { id: channelConfig.primaryId },
    include: { aliases: true },
  });
  if (!channelConfig || !primaryConfig) return;
  const channelCreator = channelConfig.creator
    ? channel.members.get(channelConfig.creator)?.displayName
    : "";
  const creator = channelCreator
    ? channelCreator
    : channel.members.at(0)?.displayName;
  if (!channel?.manageable) return;
  const activities = Array.from(channel.members).flatMap((entry) => {
    if (!entry[1].presence) return [];
    return entry[1].presence?.activities.map((activity) => activity.name);
  });
  const str = channelConfig.name
    ? channelConfig.name
    : !activities.length
    ? primaryConfig.generalName
    : primaryConfig.template;
  const name = formatString(str, {
    creator: creator ? creator : "",
    aliases: primaryConfig.aliases,
    channelNumber: 1,
    activities,
    memberCount: channel.members.size,
  });
  if (channel.name === name) {
    debug(`Skipped rename for ${channel.name} as name hasn't changed.`);
  } else {
    await channel.edit({
      name,
    });
    debug(
      `Secondary channel ${channel.name} in ${channel.guild.name} refreshed.`
    );
  }
};
