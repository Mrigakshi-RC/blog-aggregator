import { readConfig, setUser } from "./config";
import { createUser, getUser, getUsernameById, getUsers } from "./lib/db/queries/users";
import { resetDb } from "./lib/db/queries/reset";
import { fetchFeed, printFeed, User } from "./utils";
import { addFeed, getFeedByUrl, getFeeds } from "./lib/db/queries/feeds";
import { createFeedFollow, deleteFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feed_follow";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        console.log("No username provided");
        process.exit(1)
    }
    const userRecs = await getUser(args[0])
    if (userRecs.length === 0) {
        throw new Error("User doesn't exists");
    }
    setUser(args[0]);
    console.log("User set to " + args[0]);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        console.log("No username provided");
        process.exit(1)
    }
    const userRecs = await getUser(args[0])
    if (userRecs.length > 0) {
        throw new Error("User already exists");
    }
    await createUser(args[0]);
    console.log("User " + args[0] + " created");
    await handlerLogin("login", ...args);
}

export async function handleReset(cmdName: string, ...args: string[]) {
    await resetDb();
}

export async function handleGetUsers(cmdName: string, ...args: string[]) {
    const users = await getUsers();
    const config = readConfig();
    users.forEach(user => console.log(`* ${user}${user === config.currentUserName ? " (current)" : ""}`));
}

export async function aggHandler(cmdName: string, ...args: string[]) {
    const result = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(result);
}

export async function addFeedHandler(cmdName: string, user: User, ...args: string[]) {
    if (args.length < 2) {
        console.log("Usage: add-feed <name> <url>");
        process.exit(1);
    }
    const name = args[0];
    const url = args[1];
    const feed = await addFeed(name, url);

    await createFeedFollow(url);
    printFeed(feed, user);
}

export async function getFeedsHandler(cmdName: string, ...args: string[]) {
    const feeds = await getFeeds();
    const enrichedFeeds = await Promise.all(feeds.map(async (feed) => {
        const user = await getUsernameById(feed.userId);
        return { name: feed.name, url: feed.url, createdBy: user };
    }));

    console.log(enrichedFeeds);
};

export async function followHandler(cmdName: string, user: User, ...args: string[]) {
    if (args.length < 1) {
        console.log("Usage: follow <feed-name>");
        process.exit(1);
    }
    await createFeedFollow(args[0]);
    const feedName = await getFeedByUrl(args[0]).then(feed => feed.name);
    console.log(`${user.name} is now following ${feedName}`);
}

export async function getFollowingHandler(cmdName: string, user: User, ...args: string[]) {
    const followingFeeds = await getFeedFollowsForUser(user.id);
    followingFeeds.forEach(feed => console.log(`* ${feed.feedName}`));
}

export async function unfollowHandler(cmdName: string, user: User, ...args: string[]) {
    await deleteFeedFollow(user.id, args[0]);
}
