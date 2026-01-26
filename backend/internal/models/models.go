package models

import (
	"time"
)

// User mirrors the User model in Prisma
type User struct {
	ID                      string     `db:"id" json:"id"`
	Name                    *string    `db:"name" json:"name,omitempty"`
	Email                   *string    `db:"email" json:"email,omitempty"`
	EmailVerified           *time.Time `db:"emailVerified" json:"emailVerified,omitempty"`
	Image                   *string    `db:"image" json:"image,omitempty"`
	Bio                     *string    `db:"bio" json:"bio,omitempty"`
	ProfileVisibility       *string    `db:"profileVisibility" json:"profileVisibility,omitempty"`
	NotificationPreferences *string    `db:"notificationPreferences" json:"notificationPreferences,omitempty"`
	CreatedAt               *time.Time `db:"createdAt" json:"createdAt,omitempty"`
}

// Circle mirrors the Circle model in Prisma
type Circle struct {
	ID          string    `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Description *string   `db:"description" json:"description,omitempty"`
	InviteCode  string    `db:"inviteCode" json:"inviteCode"`
	OwnerID     string    `db:"ownerId" json:"ownerId"`
	CreatedAt   time.Time `db:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time `db:"updatedAt" json:"updatedAt"`
}

// CircleMember mirrors the CircleMember model in Prisma
type CircleMember struct {
	ID       string    `db:"id" json:"id"`
	CircleID string    `db:"circleId" json:"circleId"`
	UserID   string    `db:"userId" json:"userId"`
	Role     string    `db:"role" json:"role"`     // OWNER, ADMIN, MEMBER
	Status   string    `db:"status" json:"status"` // PENDING, ACTIVE
	JoinedAt time.Time `db:"joinedAt" json:"joinedAt"`
}

// Invite mirrors the Invite model in Prisma
type Invite struct {
	ID          string    `db:"id" json:"id"`
	Title       string    `db:"title" json:"title"`
	Description *string   `db:"description" json:"description,omitempty"`
	Location    *string   `db:"location" json:"location,omitempty"`
	EventDate   time.Time `db:"eventDate" json:"eventDate"`
	SenderID    string    `db:"senderId" json:"senderId"`
	CircleID    *string   `db:"circleId" json:"circleId,omitempty"`
	CreatedAt   time.Time `db:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time `db:"updatedAt" json:"updatedAt"`
}

// RSVP mirrors the RSVP model in Prisma
type RSVP struct {
	ID         string    `db:"id" json:"id"`
	InviteID   string    `db:"inviteId" json:"inviteId"`
	UserID     string    `db:"userId" json:"userId"`
	Status     string    `db:"status" json:"status"` // YES, NO, MAYBE
	GuestCount int       `db:"guestCount" json:"guestCount"`
	Dietary    *string   `db:"dietary" json:"dietary,omitempty"`
	Note       *string   `db:"note" json:"note,omitempty"`
	CreatedAt  time.Time `db:"createdAt" json:"createdAt"`
	UpdatedAt  time.Time `db:"updatedAt" json:"updatedAt"`
}

// EventFeedItem mirrors the EventFeedItem model in Prisma
type EventFeedItem struct {
	ID        string    `db:"id" json:"id"`
	InviteID  string    `db:"inviteId" json:"inviteId"`
	UserID    string    `db:"userId" json:"userId"`
	Content   string    `db:"content" json:"content"`
	Type      string    `db:"type" json:"type"` // UPDATE, CHAT
	CreatedAt time.Time `db:"createdAt" json:"createdAt"`
}

// MediaItem mirrors the MediaItem model in Prisma
type MediaItem struct {
	ID        string    `db:"id" json:"id"`
	InviteID  string    `db:"inviteId" json:"inviteId"`
	UserID    string    `db:"userId" json:"userId"`
	URL       string    `db:"url" json:"url"`
	Type      string    `db:"type" json:"type"` // IMAGE, VIDEO
	Caption   *string   `db:"caption" json:"caption,omitempty"`
	CreatedAt time.Time `db:"createdAt" json:"createdAt"`
}

// Composite Structs for API Responses

type InviteListResponse struct {
	Invite
	Sender User    `json:"sender" db:"sender"` // We will need to map this carefully or use StructScan
	Circle *Circle `json:"circle,omitempty" db:"circle"`
	Count  struct {
		RSVPs int `json:"rsvps"`
	} `json:"_count"`
}

type CircleListResponse struct {
	Circle
	Owner User `json:"owner"`
	Count struct {
		Members int `json:"members"`
	} `json:"_count"`
}

// Detail Views

type MemberWithUser struct {
	CircleMember
	User User `json:"user"`
}

type CircleWithMembers struct {
	Circle
	Members []MemberWithUser `json:"members"`
}

type RSVPWithUser struct {
	RSVP
	User User `json:"user"`
}

type FeedWithUser struct {
	EventFeedItem
	User User `json:"user"`
}

type InviteDetails struct {
	Invite
	Sender     User               `json:"sender"`
	Circle     *CircleWithMembers `json:"circle,omitempty"`
	RSVPs      []RSVPWithUser     `json:"rsvps"`
	FeedItems  []FeedWithUser     `json:"feedItems"`
	MediaItems []MediaItem        `json:"mediaItems"`
}

type InviteWithCount struct {
	Invite
	Count struct {
		RSVPs int `json:"rsvps"`
	} `json:"_count"`
}

type CircleDetailsResponse struct {
	Circle
	Owner             User              `json:"owner"`
	Members           []MemberWithUser  `json:"members"`
	Invites           []InviteWithCount `json:"invites"`
	CurrentUserStatus string            `json:"currentUserStatus,omitempty"`
}

// Request Structs

type CreateCircleRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type JoinCircleRequest struct {
	Code string `json:"code"`
}

type CreateInviteRequest struct {
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	Location    *string   `json:"location"`
	EventDate   time.Time `json:"eventDate"`
	CircleID    *string   `json:"circleId"`
}

type RSVPRequest struct {
	Status     string  `json:"status"` // YES, NO, MAYBE
	GuestCount int     `json:"guestCount"`
	Dietary    *string `json:"dietary"`
	Note       *string `json:"note"`
}

type CreatePostRequest struct {
	InviteID string `json:"inviteId"`
	Content  string `json:"content"`
	Type     string `json:"type"` // UPDATE, CHAT
}

type SyncUserRequest struct {
	ID            string     `json:"id"`
	Name          *string    `json:"name"`
	Email         string     `json:"email"`
	Image         *string    `json:"image"`
	EmailVerified *time.Time `json:"emailVerified"`
}

// User Profile Structs

type UserStats struct {
	CirclesOwned     int     `json:"circlesOwned"`
	CirclesJoined    int     `json:"circlesJoined"`
	EventsCreated    int     `json:"eventsCreated"`
	EventsAttended   int     `json:"eventsAttended"`
	RSVPResponseRate float64 `json:"rsvpResponseRate"`
	PostsShared      int     `json:"postsShared"`
}

type UserProfileResponse struct {
	User
	Stats UserStats `json:"stats"`
}

type UpdateProfileRequest struct {
	Name              *string `json:"name"`
	Bio               *string `json:"bio"`
	ProfileVisibility *string `json:"profileVisibility"`
}
