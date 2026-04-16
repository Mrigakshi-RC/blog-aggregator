import { create } from "node:domain";
import { setUser } from "./config";
import { createUser, getUser } from "./lib/db/queries/users";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        console.log("No username provided");
        process.exit(1)
    }
    const userRecs=await getUser(args[0])
    if (userRecs.length===0) {
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
    const userRecs=await getUser(args[0])
    if (userRecs.length>0) {
        throw new Error("User already exists");
    }
    await createUser(args[0]);
    console.log("User " + args[0] + " created");
    await handlerLogin("login", ...args);
}