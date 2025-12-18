import { pgTable, uuid, text, timestamp, integer, jsonb, varchar, boolean, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  specialty: varchar('specialty', { length: 255 }),
  practiceName: varchar('practice_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Patients table
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  age: integer('age'),
  gender: varchar('gender', { length: 10 }),
  dateOfBirth: date('date_of_birth'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  diagnoses: text('diagnoses').array().default([]),
  medications: text('medications').array().default([]),
  allergies: text('allergies').array().default([]),
  emergencyContact: varchar('emergency_contact', { length: 255 }),
  emergencyPhone: varchar('emergency_phone', { length: 50 }),
  insuranceProvider: varchar('insurance_provider', { length: 255 }),
  insuranceId: varchar('insurance_id', { length: 100 }),
  medicalRecordNumber: varchar('medical_record_number', { length: 100 }),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  // Risk assessment fields
  riskLevel: varchar('risk_level', { length: 20 }).default('low'),
  riskScore: integer('risk_score').default(0),
  riskFactors: jsonb('risk_factors').$type<string[]>().default([]),
  riskAssessedAt: timestamp('risk_assessed_at'),
  riskNotes: text('risk_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Visits table
export const visits = pgTable('visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  noteId: uuid('note_id').references(() => notes.id, { onDelete: 'set null' }),
  visitDate: timestamp('visit_date').defaultNow().notNull(),
  visitType: varchar('visit_type', { length: 50 }).default('routine'),
  chiefComplaint: text('chief_complaint'),
  vitals: jsonb('vitals').$type<{
    bp?: string;
    weight?: number;
    height?: number;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  }>().default({}),
  summary: text('summary'),
  diagnosis: text('diagnosis'),
  treatmentPlan: text('treatment_plan'),
  followUpDate: date('follow_up_date'),
  duration: integer('duration').default(0),
  status: varchar('status', { length: 50 }).default('completed'),
  // Risk assessment fields for this visit
  riskLevel: varchar('risk_level', { length: 20 }),
  riskScore: integer('risk_score'),
  riskFactors: jsonb('risk_factors').$type<string[]>().default([]),
  aiRiskAssessment: jsonb('ai_risk_assessment').$type<{
    summary: string;
    concerns: string[];
    recommendations: string[];
    followUpUrgency: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notes table
export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  patientName: varchar('patient_name', { length: 255 }).notNull(),
  patientAge: varchar('patient_age', { length: 50 }),
  chiefComplaint: text('chief_complaint'),
  noteType: varchar('note_type', { length: 50 }).notNull().default('SOAP'),
  duration: integer('duration').default(0),
  content: jsonb('content').$type<{
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    icd10?: string;
    cpt?: string;
  }>().notNull(),
  transcription: text('transcription'),
  audioUrl: text('audio_url'),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User settings table
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  defaultNoteType: varchar('default_note_type', { length: 50 }).default('SOAP'),
  audioQuality: varchar('audio_quality', { length: 50 }).default('high'),
  autoSave: boolean('auto_save').default(true),
  darkMode: boolean('dark_mode').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Chat sessions table
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).default('New Chat'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Patient chat sessions table
export const patientChatSessions = pgTable('patient_chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).default('Patient Chat'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Patient chat messages table
export const patientChatMessages = pgTable('patient_chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => patientChatSessions.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Patient risk history table for tracking risk over time
export const patientRiskHistory = pgTable('patient_risk_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  visitId: uuid('visit_id').references(() => visits.id, { onDelete: 'set null' }),
  riskLevel: varchar('risk_level', { length: 20 }).notNull(),
  riskScore: integer('risk_score').notNull().default(0),
  riskFactors: jsonb('risk_factors').$type<string[]>().default([]),
  assessedBy: varchar('assessed_by', { length: 50 }).default('ai'), // 'ai' or 'manual'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Patient emails table for tracking sent emails
export const patientEmails = pgTable('patient_emails', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  visitId: uuid('visit_id').references(() => visits.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  recipientName: varchar('recipient_name', { length: 255 }),
  emailType: varchar('email_type', { length: 50 }).default('visit_summary'), // visit_summary, follow_up, reminder, custom
  status: varchar('status', { length: 20 }).default('draft'), // draft, sent, failed, delivered
  sentAt: timestamp('sent_at'),
  aiGenerated: boolean('ai_generated').default(true),
  aiPrompt: text('ai_prompt'),
  generationContext: jsonb('generation_context').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  notes: many(notes),
  patients: many(patients),
  visits: many(visits),
  settings: one(userSettings),
  chatMessages: many(chatMessages),
  chatSessions: many(chatSessions),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  visits: many(visits),
  notes: many(notes),
  chatSessions: many(patientChatSessions),
  chatMessages: many(patientChatMessages),
  riskHistory: many(patientRiskHistory),
  emails: many(patientEmails),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  patient: one(patients, {
    fields: [visits.patientId],
    references: [patients.id],
  }),
  user: one(users, {
    fields: [visits.userId],
    references: [users.id],
  }),
  note: one(notes, {
    fields: [visits.noteId],
    references: [notes.id],
  }),
}));

export const patientRiskHistoryRelations = relations(patientRiskHistory, ({ one }) => ({
  patient: one(patients, {
    fields: [patientRiskHistory.patientId],
    references: [patients.id],
  }),
  visit: one(visits, {
    fields: [patientRiskHistory.visitId],
    references: [visits.id],
  }),
}));

export const patientEmailsRelations = relations(patientEmails, ({ one }) => ({
  user: one(users, {
    fields: [patientEmails.userId],
    references: [users.id],
  }),
  patient: one(patients, {
    fields: [patientEmails.patientId],
    references: [patients.id],
  }),
  visit: one(visits, {
    fields: [patientEmails.visitId],
    references: [visits.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  patient: one(patients, {
    fields: [notes.patientId],
    references: [patients.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const patientChatSessionsRelations = relations(patientChatSessions, ({ one, many }) => ({
  patient: one(patients, {
    fields: [patientChatSessions.patientId],
    references: [patients.id],
  }),
  user: one(users, {
    fields: [patientChatSessions.userId],
    references: [users.id],
  }),
  messages: many(patientChatMessages),
}));

export const patientChatMessagesRelations = relations(patientChatMessages, ({ one }) => ({
  session: one(patientChatSessions, {
    fields: [patientChatMessages.sessionId],
    references: [patientChatSessions.id],
  }),
  patient: one(patients, {
    fields: [patientChatMessages.patientId],
    references: [patients.id],
  }),
  user: one(users, {
    fields: [patientChatMessages.userId],
    references: [users.id],
  }),
}));

// Type exports for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;

export type PatientChatSession = typeof patientChatSessions.$inferSelect;
export type NewPatientChatSession = typeof patientChatSessions.$inferInsert;

export type PatientChatMessage = typeof patientChatMessages.$inferSelect;
export type NewPatientChatMessage = typeof patientChatMessages.$inferInsert;

export type PatientRiskHistory = typeof patientRiskHistory.$inferSelect;
export type NewPatientRiskHistory = typeof patientRiskHistory.$inferInsert;

export type PatientEmail = typeof patientEmails.$inferSelect;
export type NewPatientEmail = typeof patientEmails.$inferInsert;
