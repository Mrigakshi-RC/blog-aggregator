import { desc, eq } from "drizzle-orm";
import { db } from "..";
import { feed_follows, posts } from "../schema";

export async function createPost(title: string, url: string, description: string, feedId: string, publishedAt: Date) {
    await db.insert(posts).values({ title, url, description, feedId, publishedAt }).returning();
}

export async function getPostsForUser(userId: string) {
    const result = await db.select({ id: posts.id, title: posts.title, url: posts.url, description: posts.description, publishedAt: posts.publishedAt })
        .from(posts)
        .innerJoin(
            feed_follows,
            eq(posts.feedId, feed_follows.feedId)
        )
        .where(
            eq(feed_follows.userId, userId)
        )
        .orderBy(desc(posts.publishedAt));
    return result;
}