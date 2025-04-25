// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string;
}

// Dashboard types
// Types corresponding to frontend component expectations
export interface UserStats {
  total: number;
  active?: number;
  sellers?: number;
  new_this_month?: number;
}

export interface PropertyStats {
  total: number;
  active?: number;
  pending?: number;
  featured?: number;
  for_sale?: number;
  rental?: number;
  per_night?: number;
  sold?: number;
  new_this_week?: number;
}

export interface BookingStats {
  total: number;
  pending?: number;
  confirmed?: number;
  completed?: number;
  cancelled?: number;
  new_this_month?: number;
}

export interface ModerationSubStats {
  total: number;
  pending: number;
  resolved: number;
}

export interface ReviewStats {
  total: number;
  flagged: number;
  removed: number;
}

export interface ContentModerationStats {
  message_reports: ModerationSubStats;
  flagged_messages: ModerationSubStats;
  owner_reports: ModerationSubStats;
  reviews: ReviewStats;
}

// User Management types
export interface UserFilters {
  is_active?: boolean;
  is_staff?: boolean;
  search?: string;
}

// Content Moderation types
export interface MessageReport {
  id: number;
  reporter: User;
  reported_user: User;
  message_id: number;
  message_content: string;
  reason: string;
  status: "pending" | "reviewed" | "action_taken";
  created_at: string;
  updated_at: string;
}

export interface FlaggedMessage {
  id: number;
  user: User;
  message_id: number;
  message_content: string;
  flags: number;
  status: "pending" | "reviewed" | "action_taken";
  created_at: string;
  updated_at: string;
}

export interface OwnerReport {
  id: number;
  reporter: User;
  owner: User;
  reason: string;
  description: string;
  status: "pending" | "investigating" | "resolved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  property_id: number;
  property_name: string;
  reviewer: User;
  owner: User;
  rating: number;
  content: string;
  is_flagged: boolean;
  flags_count: number;
  created_at: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

