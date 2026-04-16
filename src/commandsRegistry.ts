import { register } from "node:module";
import { CommandHandler, handlerLogin, handlerRegister } from "./commandHandler";

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
    register: handlerRegister
};