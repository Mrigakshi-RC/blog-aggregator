import { XMLParser } from "fast-xml-parser";
import { feeds, users } from "src/lib/db/schema";

export type Feed = typeof feeds.$inferSelect; 
export type User = typeof users.$inferSelect; 

export async function fetchFeed(feedURL: string) {
    try {
        const response = await fetch(feedURL, {
            headers: {
                'User-Agent': 'gator',
            },
        });
        const xmlContent = await response.text();
        const parser = new XMLParser();
        const content=parser.parse(xmlContent);
        if (!content.rss || !content.rss.channel) {
            throw new Error("Invalid RSS feed");
        }
        const metadata={
            title: content.rss.channel.title,
            description: content.rss.channel.description,
            link: content.rss.channel.link,
        }
        let items = Array.isArray(content.rss.channel.item)?content.rss.channel.item : []
        items=items.filter((item: any) => item.title && item.link && item.pubDate && item.description).map((item: any) => ({
            title: item.title,
            link: item.link,
            pubDate: new Date(item.pubDate),
            description: item.description,
        }));
        return {metadata, items};
    } catch (error) {
        console.error("Error fetching or parsing feed:", error);
        throw error;
        }
}

export function printFeed(feed: Feed, user: User){
    console.log(`Feed: ${feed.name} (${feed.url})`);
    console.log(`Added by: ${user.name}`);
    console.log(`Created at: ${feed.createdAt}`);
}