
import {
    pgTable,
    uuid,
    varchar,
    timestamp
} from "drizzle-orm/pg-core";

import { userTable } from "./user.model.js";

export const otpTable = pgTable("otpTable", {

    id: uuid()
        .defaultRandom()
        .primaryKey(),

    userId: uuid()
        .references(() => userTable.id)
        .notNull(),

    email: varchar({ length: 255 })
        .notNull(),

    otpHash: varchar({ length: 255 })
        .notNull(),

    expiresAt: timestamp()
        .notNull()

});
