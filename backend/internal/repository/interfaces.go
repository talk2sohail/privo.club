package repository

import (
	"context"
	"privo-club-backend/internal/models"
)

type CircleRepository interface {
	CreateCircle(ctx context.Context, circle *models.Circle) error
	AddMember(ctx context.Context, member *models.CircleMember) error
	CreateCircleWithMember(ctx context.Context, circle *models.Circle, member *models.CircleMember) error
	ListCircles(ctx context.Context, userID string) ([]models.CircleListResponse, error)
	GetCircleByID(ctx context.Context, id string) (*models.Circle, error)
	GetCircleOwner(ctx context.Context, circleID string) (string, error)
	UpdateInviteCode(ctx context.Context, circleID, newCode string) error
	GetCircleByInviteCode(ctx context.Context, code string) (*models.CircleListResponse, error)
	GetCircleDetailsByID(ctx context.Context, id string) (*models.CircleDetailsResponse, error)
	IsMember(ctx context.Context, circleID, userID string) (bool, error)
	DeleteCircle(ctx context.Context, circleID string) error
	GetPendingMembers(ctx context.Context, circleID string) ([]models.MemberWithUser, error)
	UpdateMemberStatus(ctx context.Context, circleID, userID, status string) error
	RemoveMember(ctx context.Context, circleID, userID string) error
	GetMemberStatus(ctx context.Context, circleID, userID string) (string, error)
}

type InviteRepository interface {
	CreateInvite(ctx context.Context, invite *models.Invite) error
	ListInvites(ctx context.Context, userID string) ([]models.InviteListResponse, error)
	GetInviteByID(ctx context.Context, id string) (*models.Invite, error)
	GetSenderID(ctx context.Context, inviteID string) (string, error)
	DeleteInvite(ctx context.Context, inviteID string) error
	UpsertRSVP(ctx context.Context, rsvp *models.RSVP) error
	GetInviteDetails(ctx context.Context, inviteID string) (*models.InviteDetails, error)
}

type FeedRepository interface {
	CreatePost(ctx context.Context, item *models.EventFeedItem) error
	GetFeed(ctx context.Context, inviteID string) ([]models.EventFeedItem, error)
}

type AuthRepository interface {
	SyncUser(ctx context.Context, user *models.User) error
}

type UserRepository interface {
	GetUserByID(ctx context.Context, userID string) (*models.User, error)
	GetUserStats(ctx context.Context, userID string) (*models.UserStats, error)
	UpdateProfile(ctx context.Context, userID string, req *models.UpdateProfileRequest) error
}
