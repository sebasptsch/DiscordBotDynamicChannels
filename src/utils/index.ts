import DynamicaAlias from '@/classes/Alias';
import DynamicaGuild from '@/classes/Guild';
import { MQTT } from '@/classes/MQTT';
import DynamicaPrimary from '@/classes/Primary';
import DynamicaSecondary from '@/classes/Secondary';
import logger from '@utils/logger';
import { ActivityType, Client, version } from 'discord.js';

/**
 * Refresh Channel Activity Count
 */
const updateActivityCount = async (client: Client) => {
  try {
    const secondaryCount = DynamicaSecondary.count;

    client.user.setActivity({
      type: ActivityType.Watching,
      name: `${secondaryCount} channels`,
      url: 'https://dynamica.dev',
    });
    client.user.client.user.setAFK(!!secondaryCount);
    client.user.setStatus(secondaryCount ? 'online' : 'idle');
    const mqtt = MQTT.getInstance();
    mqtt?.publish('dynamica/status', {
      readyAt: new Date(client.readyTimestamp).toISOString(),
      time: new Date().toISOString(),
      count: {
        secondary: DynamicaSecondary.count,
        primary: DynamicaPrimary.count,
        alias: DynamicaAlias.count,
        guild: DynamicaGuild.count,
      },
      version: {
        name: process.env.VERSION,
        discord: version,
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

export default updateActivityCount;
