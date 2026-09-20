export type User = {
  id: string;
  firstName: string;
  lastName: string;
  nombre?: string | null;
  apellido?: string | null;
  edad?: number | null;
  fechaTaller?: Date | string | null;
  role: "madre" | "hija" | string;
  email: string;
  password?: string;
  connectionCode?: string | null;
  partnerId?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | string | null;
};

export type InsertUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "madre" | "hija";
  edad: number;
  nombre?: string;
  apellido?: string;
};

export type MoodEntry = {
  id: string;
  userId: string;
  rating: number;
  date: Date | string;
  improvementNote?: string | null;
  createdAt?: Date | string | null;
};

export type InsertMoodEntry = {
  userId: string;
  rating: number;
  date: Date | string;
  improvementNote?: string;
};

export type Activity = {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number;
  type: string;
  unlockConditions?: unknown;
  isActive?: boolean | null;
};

export type InsertActivity = Omit<Activity, "id">;

export type UserActivity = {
  id: string;
  userId: string;
  activityId: string;
  status: string;
  completedAt?: Date | string | null;
  createdAt?: Date | string | null;
};

export type InsertUserActivity = Omit<UserActivity, "id" | "createdAt">;

export type Achievement = {
  id: string;
  nombre: string;
  descripcion: string;
  iconType: string;
  color: string;
  unlockConditions?: unknown;
};

export type InsertAchievement = Omit<Achievement, "id">;

export type UserAchievement = {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt?: Date | string | null;
};

export type InsertUserAchievement = Omit<UserAchievement, "id">;

export type LegoPiece = {
  id: string;
  userId: string;
  partnerId: string;
  color: string;
  description: string;
  earnedAt?: Date | string | null;
};

export type InsertLegoPiece = Omit<LegoPiece, "id" | "earnedAt">;

export type Charm = {
  id: string;
  name: string;
  description: string;
  type: string;
  color: string;
  rarity: string;
  isSpecial?: boolean | null;
  unlockConditions?: unknown;
  iconEmoji?: string | null;
  isActive?: boolean | null;
};

export type InsertCharm = Omit<Charm, "id">;

export type UserCharm = {
  id: string;
  userId: string;
  charmId: string;
  unlockedAt?: Date | string | null;
  isSelected?: boolean | null;
};

export type InsertUserCharm = Omit<UserCharm, "id">;

export type BotInteraction = {
  id: string;
  userId: string;
  question: string;
  response?: string | null;
  context?: unknown;
  type: string;
  suggestedActivityId?: string | null;
  createdAt?: Date | string | null;
};

export type InsertBotInteraction = Omit<BotInteraction, "id" | "createdAt">;

export type SuggestedActivity = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  scientificBacking?: string | null;
  duration?: number | null;
  targetRole: string;
  isNew?: boolean | null;
  isCompleted?: boolean | null;
  suggestedAt?: Date | string | null;
};

export type InsertSuggestedActivity = Omit<SuggestedActivity, "id">;

export type ScheduledActivity = {
  id: string;
  userId: string;
  partnerId?: string | null;
  title: string;
  description: string;
  scheduledDate: Date | string;
  duration: number;
  type: string;
  status: string;
  emoji?: string | null;
  reminderSent?: boolean | null;
  createdAt?: Date | string | null;
  completedAt?: Date | string | null;
};

export type InsertScheduledActivity = {
  userId: string;
  type: string;
  status?: string;
  description: string;
  title: string;
  scheduledDate: Date | string;
  duration: number;
  partnerId?: string;
  reminderSent?: boolean;
  emoji?: string;
};

export type WeeklyProgram = {
  id: string;
  userId: string;
  week: number;
  year: number;
  theme: string;
  activities: unknown;
  isActive?: boolean | null;
  createdAt?: Date | string | null;
};

export type InsertWeeklyProgram = Omit<WeeklyProgram, "id" | "createdAt">;

export type ConversationHistory = {
  id: string;
  userId: string;
  message: string;
  sender: string;
  sessionId: string;
  mood?: number | null;
  createdAt?: Date | string | null;
};

export type InsertConversationHistory = Omit<ConversationHistory, "id" | "createdAt">;

export type ActivityTemplate = {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  defaultDuration: number;
  isActive?: boolean | null;
  createdAt?: Date | string | null;
};

export type InsertActivityTemplate = Omit<ActivityTemplate, "id" | "createdAt">;

export type AdminUser = {
  id: string;
  nombre: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type InsertAdminUser = Omit<AdminUser, "id" | "createdAt" | "updatedAt">;

export type AdminSession = {
  id: string;
  adminId: string;
  token: string;
  expiresAt: Date | string;
  createdAt?: Date | string | null;
};

export type InsertAdminSession = Omit<AdminSession, "id" | "createdAt">;

export type WorkshopResult = {
  id: string;
  connectionCode: string;
  madreId: string;
  hijaId: string;
  facilitador: string;
  fechaTaller: Date | string;
  ubicacion: string;
  [key: string]: unknown;
};

export type InsertWorkshopResult = Record<string, unknown>;

export type MotivationalNotification = {
  id: string;
  userId: string;
  message: string;
  messageType: string;
  scheduledTime: Date | string;
  sentAt?: Date | string | null;
  status: string;
  whatsappMessageId?: string | null;
  createdAt?: Date | string | null;
};

export type InsertMotivationalNotification = Omit<MotivationalNotification, "id" | "createdAt">;

export type NotificationSettings = {
  id: string;
  userId: string;
  whatsappNumber: string;
  frequency: string;
  preferredTime: string;
  isActive?: boolean | null;
  lastSent?: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type InsertNotificationSettings = Omit<NotificationSettings, "id" | "createdAt" | "updatedAt">;

export type WorkshopPersonalInfo = {
  id: string;
  userId: string;
  accessCodeHash: string;
  currentSituations: string;
  workshopReasons: string;
  expectedAchievements: string;
  relationshipIn2Years: string;
  relationshipIn5Years: string;
  relationshipIn10Years: string;
  additionalComments?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type InsertWorkshopPersonalInfo = Omit<WorkshopPersonalInfo, "id" | "createdAt" | "updatedAt">;

export type WorkshopFile = {
  id: string;
  userId: string;
  partnerId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  category: string;
  description?: string | null;
  isShared?: boolean | null;
  uploadedBy: string;
  createdAt?: Date | string | null;
};

export type InsertWorkshopFile = Omit<WorkshopFile, "id" | "createdAt">;

export type WorkshopForm = {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  category: string;
  formStructure: unknown;
  isActive?: boolean | null;
  order?: number | null;
  createdAt?: Date | string | null;
};

export type InsertWorkshopForm = Omit<WorkshopForm, "id" | "createdAt">;

export type WorkshopFormResponse = {
  id: string;
  userId: string;
  formId: string;
  responses: unknown;
  isCompleted?: boolean | null;
  completedAt?: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type InsertWorkshopFormResponse = Omit<WorkshopFormResponse, "id" | "createdAt" | "updatedAt">;

export type PairActivity = {
  id: string;
  motherUserId: string;
  daughterUserId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  motherFiles?: unknown;
  daughterFiles?: unknown;
  sharedContent?: unknown;
  dueDate?: Date | string | null;
  completedAt?: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type InsertPairActivity = Omit<PairActivity, "id" | "createdAt" | "updatedAt">;

export type UserFile = {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  contentType?: string | null;
  fileSize?: number | null;
  isShared?: boolean | null;
  uploadDate?: Date | string | null;
  lastAccessedByAI?: Date | string | null;
  aiProcessingStatus?: string | null;
  aiExtractedContent?: string | null;
  tags?: unknown;
  activityId?: string | null;
  metadata?: unknown;
  createdAt?: Date | string | null;
};

export type InsertUserFile = Omit<UserFile, "id" | "createdAt" | "uploadDate">;

export type AiTrainingData = {
  id: string;
  category: string;
  subcategory?: string | null;
  title: string;
  content: string;
  metadata?: unknown;
  source?: string | null;
  priority?: number | null;
  isActive?: boolean | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type InsertAiTrainingData = Omit<AiTrainingData, "id" | "createdAt" | "updatedAt">;

export type AiConversationTemplate = {
  id: string;
  scenario: string;
  userRole: string;
  ageGroup?: string | null;
  triggerKeywords?: string[] | null;
  responseTemplate: string;
  alternativeResponses?: string[] | null;
  emotionalTone?: string | null;
  scientificBacking?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | string | null;
};

export type InsertAiConversationTemplate = Omit<AiConversationTemplate, "id" | "createdAt">;

export type AiConversationState = {
  id: string;
  userId: string;
  sessionId: string;
  state: unknown;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type InsertAiConversationState = Omit<AiConversationState, "id" | "createdAt" | "updatedAt">;
