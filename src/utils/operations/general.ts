import { Client } from "discord.js";
import { db } from "../db";

/**
 * Refresh Channel Activity Count
 */
export const updateActivityCount = (client: Client) => {
  return db.secondary.count().then((count) => {
    client.user?.setActivity(
      `with ${count} ${count === 1 ? "channel" : "channels"}.`
    );
  });
};
