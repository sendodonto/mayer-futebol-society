import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const bookings = sqliteTable('bookings', {
 id: text('id').primaryKey(), code: text('code').notNull().unique(), owner: text('owner').notNull(), court: text('court').notNull(), date: text('date').notNull(), start: integer('start').notNull(), duration: integer('duration').notNull(), name: text('name').notNull(), phone: text('phone').notNull(), email: text('email').notNull(), total: integer('total').notNull(), status: text('status').notNull(), payment: text('payment').notNull(), kind: text('kind').notNull(), note: text('note').notNull(), created: text('created').notNull(),
});
export const occupancy = sqliteTable('occupancy', { court: text('court').notNull(), date: text('date').notNull(), slot: integer('slot').notNull(), booking: text('booking').notNull() }, t => [primaryKey({ columns: [t.court,t.date,t.slot] })]);
export const settings = sqliteTable('settings', { key: text('key').primaryKey(), value: text('value').notNull() });
export const staff = sqliteTable('staff', { key: text('key').primaryKey(), user: text('user').notNull().unique(), role: text('role').notNull() });
export const invitations = sqliteTable('invitations', { email: text('email').primaryKey(), role: text('role').notNull() });
export const audit = sqliteTable('audit', { id: text('id').primaryKey(), actor: text('actor').notNull(), action: text('action').notNull(), subject: text('subject').notNull(), created: text('created').notNull() });
