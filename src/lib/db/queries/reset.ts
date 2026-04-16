import { db } from "..";
import { users } from "../schema";

export async function resetDb() {
    try {
        await db.delete(users);
    }
    catch (err) {
        console.error("Error resetting database:", err);
        process
    }
}