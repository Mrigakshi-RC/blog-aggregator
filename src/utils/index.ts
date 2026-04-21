import { XMLParser } from "fast-xml-parser";
import { getNextFeedToFetch, markFeedFetched } from "src/lib/db/queries/feeds";
import { createPost } from "src/lib/db/queries/posts";
import { feeds, users } from "src/lib/db/schema";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

type FeedData = {
    title: string,
    link: string,
    pubDate: string,
    description: string
}

export async function fetchFeed(feedURL: string) {
    try {
        const response = await fetch(feedURL, {
            headers: {
                'User-Agent': 'gator',
            },
        });
        const xmlContent = await response.text();
        const parser = new XMLParser();
        const content = parser.parse(xmlContent);
        if (!content.rss || !content.rss.channel) {
            throw new Error("Invalid RSS feed");
        }
        const metadata = {
            title: content.rss.channel.title,
            description: content.rss.channel.description,
            link: content.rss.channel.link,
        }
        let items = Array.isArray(content.rss.channel.item) ? content.rss.channel.item : []
        items = items.filter((item: any) => item.title && item.link && item.pubDate && item.description).map((item: any) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            description: item.description,
        }));
        return { metadata, items };
    } catch (error) {
        console.error("Error fetching or parsing feed:", error);
        throw error;
    }
}

export function printFeed(feed: Feed, user: User) {
    console.log(`Feed: ${feed.name} (${feed.url})`);
    console.log(`Added by: ${user.name}`);
    console.log(`Created at: ${feed.createdAt}`);
}

export async function scrapeFeeds() {
    const nextFeed = await getNextFeedToFetch();
    if (!nextFeed) {
        console.log("No feeds to fetch");
        return;
    }
    markFeedFetched(nextFeed.id);
    const feedData = await fetchFeed(nextFeed.url);
    for (const item of feedData.items as FeedData[]) {
        await createPost(
            item.title,
            item.link,
            item.description,
            nextFeed.id,
            parseFeedDate(item.pubDate)
        );
    }
}

export function parseDurationToMs(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);

    if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];

        const multipliers: Record<string, number> = {
            ms: 1,
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
        };

        const ms = value * multipliers[unit];
        return ms
    }
    else {
        throw new Error("Invalid duration format. Use formats like '10s', '5m', '1h', or '500ms'.");
    }

}

export function handleError(error: unknown) {
    const timestamp = new Date().toISOString();
    if (error instanceof Error) {
        console.error(`[${timestamp}] Scraper Error: ${error.message}`);

        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
    } else {
        console.error(`[${timestamp}] An unknown error occurred:`, error);
    }
}

function parseFeedDate(dateStr: string | undefined): Date {
    if (!dateStr) return new Date();
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }

    // Fallback: If it's a Unix timestamp (common in some JSON feeds)
    if (/^\d+$/.test(dateStr)) {
        return new Date(parseInt(dateStr, 10));
    }

    console.warn(`Could not parse date: ${dateStr}. Using current time.`);
    return new Date();
}
