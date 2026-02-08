package repository

import (
	"context"
	"database/sql"
	"fmt"
	"privo-club-backend/internal/models"

	"github.com/jmoiron/sqlx"
)

type userRepository struct {
	DB *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) UserRepository {
	return &userRepository{DB: db}
}

func (r *userRepository) GetUserByID(ctx context.Context, userID string) (*models.User, error) {
	var user models.User
	query := `SELECT id, name, email, "emailVerified", image, bio, "profileVisibility", "notificationPreferences", "createdAt"
			  FROM "User"
			  WHERE id = $1`
	
	err := r.DB.GetContext(ctx, &user, query, userID)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetUserStats(ctx context.Context, userID string) (*models.UserStats, error) {
	stats := &models.UserStats{}
	
	// Get circles owned count
	err := r.DB.GetContext(ctx, &stats.CirclesOwned, 
		`SELECT COUNT(*) FROM "Circle" WHERE "ownerId" = $1`, userID)
	if err != nil {
		return nil, err
	}
	
	// Get circles joined count (excluding owned)
	err = r.DB.GetContext(ctx, &stats.CirclesJoined,
		`SELECT COUNT(DISTINCT cm."circleId") 
		 FROM "CircleMember" cm
		 JOIN "Circle" c ON c.id = cm."circleId"
		 WHERE cm."userId" = $1 AND c."ownerId" != $1 AND cm.status = 'ACTIVE'`, userID)
	if err != nil {
		return nil, err
	}
	
	// Get events created count
	err = r.DB.GetContext(ctx, &stats.EventsCreated,
		`SELECT COUNT(*) FROM "Invite" WHERE "senderId" = $1`, userID)
	if err != nil {
		return nil, err
	}
	
	// Get RSVP statistics (both attended events and total responses) in one query
	var rsvpStats struct {
		EventsAttended int `db:"events_attended"`
		TotalResponses int `db:"total_responses"`
	}
	
	err = r.DB.GetContext(ctx, &rsvpStats,
		`SELECT 
			COUNT(CASE WHEN status = 'YES' THEN 1 END) as events_attended,
			COUNT(*) as total_responses
		 FROM "RSVP" WHERE "userId" = $1`, userID)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	stats.EventsAttended = rsvpStats.EventsAttended
	
	// Get total invites user has access to for response rate calculation
	var totalInvites int
	
	err = r.DB.GetContext(ctx, &totalInvites,
		`SELECT COUNT(DISTINCT i.id)
		 FROM "Invite" i
		 LEFT JOIN "CircleMember" cm ON cm."circleId" = i."circleId" AND cm."userId" = $1
		 WHERE i."senderId" != $1 AND (i."circleId" IS NULL OR cm.id IS NOT NULL)`, userID)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	
	if totalInvites > 0 {
		stats.RSVPResponseRate = float64(rsvpStats.TotalResponses) / float64(totalInvites) * 100
	} else {
		stats.RSVPResponseRate = 0
	}
	
	// Get posts shared count
	err = r.DB.GetContext(ctx, &stats.PostsShared,
		`SELECT COUNT(*) FROM "EventFeedItem" WHERE "userId" = $1`, userID)
	if err != nil {
		return nil, err
	}
	
	return stats, nil
}

func (r *userRepository) UpdateProfile(ctx context.Context, userID string, req *models.UpdateProfileRequest) error {
	query := `UPDATE "User" SET `
	args := []interface{}{}
	argNum := 1
	updates := []string{}
	
	if req.Name != nil {
		updates = append(updates, `name = $`+fmt.Sprintf("%d", argNum))
		args = append(args, req.Name)
		argNum++
	}
	
	if req.Bio != nil {
		updates = append(updates, `bio = $`+fmt.Sprintf("%d", argNum))
		args = append(args, req.Bio)
		argNum++
	}
	
	if req.ProfileVisibility != nil {
		updates = append(updates, `"profileVisibility" = $`+fmt.Sprintf("%d", argNum))
		args = append(args, req.ProfileVisibility)
		argNum++
	}
	
	if len(updates) == 0 {
		return nil // Nothing to update
	}
	
	query += updates[0]
	for i := 1; i < len(updates); i++ {
		query += ", " + updates[i]
	}
	
	query += ` WHERE id = $` + fmt.Sprintf("%d", argNum)
	args = append(args, userID)
	
	_, err := r.DB.ExecContext(ctx, query, args...)
	return err
}
