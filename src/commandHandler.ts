import { readConfig, setUser } from "./config";
import { createUser, getUser, getUsers } from "./lib/db/queries/users";
import { resetDb } from "./lib/db/queries/reset";
import { fetchFeed, printFeed } from "./utils";
import { addFeed } from "./lib/db/queries/feeds";

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

export async function addFeedHandler(cmdName: string, ...args: string[]) {
    if (args.length < 2) {
        console.log("Usage: add-feed <name> <url>");
        process.exit(1);
    }
    const name = args[0];
    const url = args[1];
    const feed = await addFeed(name, url);
    const user = await (getUser(readConfig().currentUserName ?? ''));
    printFeed(feed, user[0]);
}