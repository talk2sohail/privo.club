// Backend-compatible types
export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  emailVerified?: Date;
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invite {
  id: string;
  title: string;
  description?: string;
  location?: string;
  eventDate: string; // ISO string
  senderId: string;
  circleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RSVP {
  id: string;
  inviteId: string;
  userId: string;
  status: "YES" | "NO" | "MAYBE";
  guestCount: number;
  note?: string;
}

export interface FeedItem {
  id: string;
  inviteId: string;
  userId: string;
  content: string;
  type: "MESSAGE" | "ANNOUNCEMENT";
  createdAt: string;
}

export interface MediaItem {
  id: string;
  inviteId: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  createdAt: string;
}

// Composite Types (matches Go structs)

export interface InviteWithRelations extends Invite {
  sender: User;
  circle?: Circle;
  _count?: {
    rsvps: number;
  };
}

export interface Member {
  id: string;
  userId: string;
  circleId: string;
  user: User;
  role: string;
  status: "PENDING" | "ACTIVE";
  joinedAt: string;
}

export interface CircleWithMembers extends Circle {
  members: Member[];
}

export interface CircleDetails extends Circle {
  owner: User;
  members: Member[];
  invites: Array<InviteWithRelations>;
  currentUserStatus?: string;
}

// Alias for backward compatibility or clarity
export type CircleWithRelations = CircleWithMembers;

export interface InviteDetails extends Invite {
  sender: User;
  circle?: CircleWithMembers;
  rsvps: Array<RSVP & { user: User }>;
  feedItems: Array<FeedItem & { user: User }>;
  mediaItems: MediaItem[];
}

export interface CirclePreview extends Circle {
  owner: User;
  _count: {
    members: number;
  };
}

// User Profile Types

export interface UserStats {
  circlesOwned: number;
  circlesJoined: number;
  eventsCreated: number;
  eventsAttended: number;
  rsvpResponseRate: number;
  postsShared: number;
}

export interface UserProfile extends User {
  bio?: string;
  profileVisibility?: "PUBLIC" | "PRIVATE" | "CIRCLES_ONLY";
  notificationPreferences?: string;
  createdAt?: string;
}

export interface UserProfileResponse {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  bio?: string;
  profileVisibility?: "PUBLIC" | "PRIVATE" | "CIRCLES_ONLY";
  notificationPreferences?: string;
  createdAt?: string;
  stats: UserStats;
}
