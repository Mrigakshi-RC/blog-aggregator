import { sql } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

export async function createUser(name: string) {
    const [result] = await db.insert(users).values({ name: name }).returning();
    return result;
}

export async function getUser(name: string) {
    const result = await db.select().from(users).where((sql`${users.name} = ${name}`));
    return result;
}

export async function getUsers() {
    const result = (await db.select({ name: users.name }).from(users)).map(row => row.name);
    return result;
}

export async function getUsernameById(id: string) {
    const result = await db.select().from(users).where((sql`${users.id} = ${id}`));
    return result[0]?.name;
}