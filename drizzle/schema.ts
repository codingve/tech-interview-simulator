import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Interview sessions
export const interviewSessions = mysqlTable("interview_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  targetRole: varchar("targetRole", { length: 128 }).notNull(),
  seniority: mysqlEnum("seniority", ["junior", "mid", "senior", "staff", "principal"]).notNull(),
  company: varchar("company", { length: 128 }),
  interviewType: mysqlEnum("interviewType", ["behavioral", "system_design", "coding", "mixed"]).notNull(),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active").notNull(),
  score: float("score"),
  feedback: text("feedback"),
  questionCount: int("questionCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type InterviewSession = typeof interviewSessions.$inferSelect;
export type InsertInterviewSession = typeof interviewSessions.$inferInsert;

// Chat messages within a session
export const interviewMessages = mysqlTable("interview_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["assistant", "user"]).notNull(),
  content: text("content").notNull(),
  messageType: mysqlEnum("messageType", ["question", "answer", "feedback", "intro", "closing"]).default("question").notNull(),
  starScore: float("starScore"),
  starBreakdown: json("starBreakdown"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InterviewMessage = typeof interviewMessages.$inferSelect;
export type InsertInterviewMessage = typeof interviewMessages.$inferInsert;

// Question bank
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  content: text("content").notNull(),
  company: varchar("company", { length: 64 }),
  interviewType: mysqlEnum("interviewType", ["behavioral", "system_design", "coding", "mixed"]).notNull(),
  seniority: mysqlEnum("seniority", ["junior", "mid", "senior", "staff", "principal", "all"]).default("all").notNull(),
  theme: varchar("theme", { length: 128 }),
  tips: text("tips"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;
