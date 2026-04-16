import { readConfig } from "src/config";
import { db } from "..";
import { feeds } from "../schema";
import { getUser } from "./users";

export async function addFeed(name: string, url: string) {
    const username = readConfig().currentUserName ?? '';
    const user = (await getUser(username))[0].id;
    const [result] = await db.insert(feeds).values({ name, url, userId: user }).returning();
    return result;
}