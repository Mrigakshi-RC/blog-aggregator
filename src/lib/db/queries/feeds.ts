import { readConfig } from "src/config";
import { db } from "..";
import { feeds } from "../schema";
import { getUser } from "./users";
import { eq } from "drizzle-orm";
import { Feed } from "src/utils";

export async function addFeed(name: string, url: string) {
    const username = readConfig().currentUserName ?? '';
    const user = (await getUser(username))[0].id;
    const [result] = await db.insert(feeds).values({ name, url, userId: user }).returning();
    return result;
}

export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result;
}

export async function getFeedByUrl(url: string) {
    const feed = await db.select()
        .from(feeds)
        .where(eq(feeds.url, url))
    return feed[0];
}