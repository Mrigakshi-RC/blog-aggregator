import { register } from "node:module";
import { addFeedHandler, aggHandler, CommandHandler, handleGetUsers, handlerLogin, handlerRegister } from "./commandHandler";
import { resetDb } from "./lib/db/queries/reset";

type CommandsRegistry=Record<string, CommandHandler>;

function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Command ${cmdName} not found`);
    }
    await handler(cmdName, ...args);
}

export const commandsRegistry: CommandsRegistry = {
    login: handlerLogin,
    register: handlerRegister,
    reset: resetDb,
    users: handleGetUsers,
    agg: aggHandler,
    addfeed: addFeedHandler
};