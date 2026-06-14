
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable,uuid,varchar } from "drizzle-orm/pg-core";


export const userTable =  pgTable("users",{
    name : varchar({length:255}).notNull(),
    email : varchar({length:255}).notNull().unique(),
    password: varchar({length : 255}).notNull(),
    id : uuid().defaultRandom().primaryKey()
})

export type insertUser = InferInsertModel<typeof userTable>
export type selectUser = InferSelectModel<typeof userTable>