import { readConfig } from "src/config";
import { db } from "..";
import { feed_follows, feeds, users } from "../schema";
import { getUser } from "./users";
import { and, eq } from "drizzle-orm";
import { getFeedByUrl } from "./feeds";

export async function createFeedFollow(feedUrl: string) {
    const feedId = await getFeedByUrl(feedUrl).then(feed => feed.id);
    const userName = readConfig().currentUserName;

    if (!userName) {
        throw new Error("No active user found in configuration.");
    }

    const user = (await getUser(userName))[0];

    if (!user) {
        throw new Error(`User '${userName}' not found in database.`);
    }

    return db
        .insert(feed_follows)
        .values({
            userId: user.id,
            feedId
        })
        .returning();
}

export async function getFeedFollowsForUser(userId: string) {
    const result = await (db.select({ id: feed_follows.id, createdAt: feed_follows.createdAt, updatedAt: feed_follows.updatedAt, feedName: feeds.name, userName: users.name })
        .from(feed_follows)
        .innerJoin(feeds, eq(feed_follows.feedId, feeds.id)).innerJoin(users, eq(feed_follows.userId, users.id))).where(eq(feed_follows.userId, userId));
    return result;
}

export async function deleteFeedFollow(userId: string, url: string) {
    const feed = await getFeedByUrl(url);
    if (!feed) {
        throw new Error(`Feed with URL '${url}' not found.`);
    }

    await db.delete(feed_follows)
        .where(
            and(
                eq(feed_follows.feedId, feed.id),
                eq(feed_follows.userId, userId)
            )
        );
}