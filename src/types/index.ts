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

export interface CircleWithMembers extends Circle {
  members: Array<{ id: string; userId: string; circleId: string; user: User; role: string; joinedAt: string }>;
}

export interface CircleDetails extends Circle {
  owner: User;
  members: Array<{ id: string; userId: string; circleId: string; user: User; role: string; joinedAt: string }>;
  invites: Array<InviteWithRelations>;
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
