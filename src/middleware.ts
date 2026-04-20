import { CommandHandler } from "./commandHandler";
import { readConfig } from "./config";
import { getUser } from "./lib/db/queries/users";
import { User } from "./utils";

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export const withUser: middlewareLoggedIn = (handler) => {
  return async (cmdName, ...args) => {
    const user = (await (getUser(readConfig().currentUserName ?? '')))[0];

    if (!user) {
      console.error("Unauthorized: User must be logged in.");
      return; 
    }

    return handler(cmdName, user, ...args);
  };
};