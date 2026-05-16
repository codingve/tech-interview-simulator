import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertInterviewSession,
  InsertInterviewMessage,
  InsertQuestion,
  interviewMessages,
  interviewSessions,
  questions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Interview Sessions ───────────────────────────────────────────────────────

export async function createSession(data: InsertInterviewSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(interviewSessions).values(data);
  return result[0];
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(interviewSessions).where(eq(interviewSessions.id, id)).limit(1);
  return result[0];
}

export async function getSessionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.userId, userId))
    .orderBy(desc(interviewSessions.createdAt));
}

export async function updateSession(id: number, data: Partial<InsertInterviewSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(interviewSessions).set(data).where(eq(interviewSessions.id, id));
}

// ─── Interview Messages ───────────────────────────────────────────────────────

export async function createMessage(data: InsertInterviewMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(interviewMessages).values(data);
  return result[0];
}

export async function getMessagesBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(interviewMessages)
    .where(eq(interviewMessages.sessionId, sessionId))
    .orderBy(interviewMessages.createdAt);
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function getQuestions(filters?: {
  company?: string;
  interviewType?: string;
  seniority?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.company) conditions.push(eq(questions.company, filters.company));
  if (filters?.interviewType) conditions.push(eq(questions.interviewType, filters.interviewType as any));
  if (filters?.seniority && filters.seniority !== "all") {
    conditions.push(eq(questions.seniority, filters.seniority as any));
  }

  return db
    .select()
    .from(questions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(questions.company, questions.interviewType);
}

export async function seedQuestionsIfEmpty() {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(questions).limit(1);
  if (existing.length > 0) return;

  const seedData: InsertQuestion[] = [
    // Amazon - Behavioral
    { content: "Tell me about a time you had to make a difficult decision with incomplete information. What was the outcome?", company: "Amazon", interviewType: "behavioral", seniority: "all", theme: "Decision Making", tips: "Focus on your decision-making process and use of data." },
    { content: "Describe a situation where you had to deliver a project under a very tight deadline. How did you manage it?", company: "Amazon", interviewType: "behavioral", seniority: "all", theme: "Ownership", tips: "Show ownership and quantify the impact." },
    { content: "Tell me about a time you disagreed with your manager. How did you handle it?", company: "Amazon", interviewType: "behavioral", seniority: "mid", theme: "Conflict", tips: "Demonstrate respect while showing independent thinking." },
    { content: "Give me an example of when you took a calculated risk. What happened?", company: "Amazon", interviewType: "behavioral", seniority: "senior", theme: "Bias for Action", tips: "Show you can act decisively and learn from outcomes." },
    { content: "Tell me about a time you had to influence someone without having direct authority.", company: "Amazon", interviewType: "behavioral", seniority: "senior", theme: "Leadership", tips: "Demonstrate influence through data and persuasion." },
    // Amazon - System Design
    { content: "Design a URL shortener like bit.ly. Walk me through your architecture.", company: "Amazon", interviewType: "system_design", seniority: "mid", theme: "Distributed Systems", tips: "Cover scalability, hashing, and database design." },
    { content: "How would you design Amazon's product recommendation system?", company: "Amazon", interviewType: "system_design", seniority: "senior", theme: "ML Systems", tips: "Discuss data pipelines, model serving, and A/B testing." },
    // Google - Behavioral
    { content: "Tell me about a time you had to learn something new very quickly to complete a project.", company: "Google", interviewType: "behavioral", seniority: "all", theme: "Learning Agility", tips: "Show curiosity and fast learning with concrete results." },
    { content: "Describe a project where you had to collaborate across multiple teams. What challenges did you face?", company: "Google", interviewType: "behavioral", seniority: "mid", theme: "Collaboration", tips: "Highlight communication and alignment strategies." },
    { content: "Tell me about a time you identified and solved a problem before it became critical.", company: "Google", interviewType: "behavioral", seniority: "senior", theme: "Problem Solving", tips: "Show proactive thinking and impact prevention." },
    { content: "Give an example of when you had to prioritize between multiple important tasks. How did you decide?", company: "Google", interviewType: "behavioral", seniority: "all", theme: "Prioritization", tips: "Use a framework and show clear reasoning." },
    // Google - System Design
    { content: "Design Google Search's autocomplete feature.", company: "Google", interviewType: "system_design", seniority: "senior", theme: "Search Systems", tips: "Cover trie data structures, caching, and real-time updates." },
    { content: "How would you design a distributed cache system like Memcached?", company: "Google", interviewType: "system_design", seniority: "senior", theme: "Distributed Systems", tips: "Discuss consistent hashing, eviction policies, and replication." },
    // Meta - Behavioral
    { content: "Tell me about a time you had to make a significant impact with limited resources.", company: "Meta", interviewType: "behavioral", seniority: "all", theme: "Impact", tips: "Quantify the impact and show resourcefulness." },
    { content: "Describe a situation where you had to move fast and iterate. What did you learn?", company: "Meta", interviewType: "behavioral", seniority: "mid", theme: "Move Fast", tips: "Show bias for action and learning from iteration." },
    { content: "Tell me about a time you received critical feedback. How did you respond?", company: "Meta", interviewType: "behavioral", seniority: "all", theme: "Growth Mindset", tips: "Show openness to feedback and concrete improvement." },
    { content: "Give an example of a bold decision you made that paid off.", company: "Meta", interviewType: "behavioral", seniority: "senior", theme: "Bold Moves", tips: "Show courage and calculated risk-taking." },
    // Meta - System Design
    { content: "Design Facebook's News Feed system.", company: "Meta", interviewType: "system_design", seniority: "senior", theme: "Social Systems", tips: "Cover fan-out strategies, ranking, and real-time updates." },
    { content: "How would you design a real-time messaging system like WhatsApp?", company: "Meta", interviewType: "system_design", seniority: "senior", theme: "Messaging Systems", tips: "Discuss WebSockets, message queues, and delivery guarantees." },
    // Generic - Behavioral
    { content: "Tell me about yourself and why you're interested in this role.", company: null, interviewType: "behavioral", seniority: "all", theme: "Introduction", tips: "Structure: past experience, current role, why this company." },
    { content: "What is your greatest professional achievement and why?", company: null, interviewType: "behavioral", seniority: "all", theme: "Achievement", tips: "Use STAR and quantify the impact clearly." },
    { content: "Tell me about a time you failed. What did you learn from it?", company: null, interviewType: "behavioral", seniority: "all", theme: "Failure & Growth", tips: "Be honest, show accountability, and focus on learning." },
    { content: "Where do you see yourself in 5 years?", company: null, interviewType: "behavioral", seniority: "all", theme: "Career Goals", tips: "Align your goals with the company's mission." },
    { content: "Why do you want to leave your current company?", company: null, interviewType: "behavioral", seniority: "all", theme: "Motivation", tips: "Stay positive, focus on growth opportunities." },
    // Generic - Coding
    { content: "Implement a function to find the two numbers in an array that sum to a target value.", company: null, interviewType: "coding", seniority: "junior", theme: "Arrays & Hash Maps", tips: "Consider time and space complexity tradeoffs." },
    { content: "Given a binary tree, write a function to find the maximum depth.", company: null, interviewType: "coding", seniority: "junior", theme: "Trees & Recursion", tips: "Think about both recursive and iterative approaches." },
    { content: "Design and implement an LRU (Least Recently Used) cache.", company: null, interviewType: "coding", seniority: "mid", theme: "Data Structures", tips: "Use a doubly linked list + hash map for O(1) operations." },
    { content: "Implement a function to serialize and deserialize a binary tree.", company: null, interviewType: "coding", seniority: "senior", theme: "Trees", tips: "Consider BFS vs DFS approaches and edge cases." },
  ];

  await db.insert(questions).values(seedData);
}
