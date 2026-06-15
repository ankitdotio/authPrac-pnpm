import { boolean, pgTable , timestamp, uuid ,varchar} from "drizzle-orm/pg-core";
import { userTable } from "./user.model.js";


export const sessionTable = pgTable("sessionTable",{
    id : uuid().defaultRandom().primaryKey(),
    userId: uuid().references(()=>userTable.id),
    ip : varchar({length:255}).notNull(),
    refreshTokenHash : varchar({length:255}).notNull(),
    
    
    userAgent : varchar({length:255}).notNull(),
    revoked : boolean().notNull().default(false),
    createdAt : timestamp().defaultNow().notNull()
})