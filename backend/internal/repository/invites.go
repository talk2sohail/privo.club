package repository

import (
	"context"
	"log"

	"invito-backend/internal/models"

	"github.com/jmoiron/sqlx"
)

type inviteRepository struct {
	db *sqlx.DB
}

func NewInviteRepository(db *sqlx.DB) InviteRepository {
	return &inviteRepository{db: db}
}

func (r *inviteRepository) CreateInvite(ctx context.Context, invite *models.Invite) error {
	_, err := r.db.ExecContext(ctx, QueryCreateInvite, invite.ID, invite.Title, invite.Description, invite.Location, invite.EventDate, invite.SenderID, invite.CircleID, invite.CreatedAt, invite.UpdatedAt)
	return err
}

func (r *inviteRepository) ListInvites(ctx context.Context, userID string) ([]models.InviteListResponse, error) {
	type InviteRow struct {
		models.Invite
		SenderID    string  `db:"sender_id"`
		SenderName  string  `db:"sender_name"`
		SenderEmail string  `db:"sender_email"`
		SenderImage *string `db:"sender_image"`

		CircleID   *string `db:"circle_id"`
		CircleName *string `db:"circle_name"`

		RSVPCount int `db:"rsvp_count"`
	}

	rows, err := r.db.QueryxContext(ctx, QueryListInvites, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var response []models.InviteListResponse
	for rows.Next() {
		var row InviteRow
		if err := rows.StructScan(&row); err != nil {
			log.Printf("Scan error: %v", err)
			continue
		}

		item := models.InviteListResponse{
			Invite: row.Invite,
			Sender: models.User{
				ID:    row.SenderID,
				Name:  &row.SenderName,
				Email: &row.SenderEmail,
				Image: row.SenderImage,
			},
			Count: struct {
				RSVPs int `json:"rsvps"`
			}{RSVPs: row.RSVPCount},
		}
		if row.CircleID != nil {
			item.Circle = &models.Circle{
				ID:   *row.CircleID,
				Name: *row.CircleName,
			}
		}
		response = append(response, item)
	}
	if response == nil {
		response = []models.InviteListResponse{}
	}
	return response, nil
}

func (r *inviteRepository) GetInviteByID(ctx context.Context, id string) (*models.Invite, error) {
	var invite models.Invite
	err := r.db.GetContext(ctx, &invite, QueryGetInviteByID, id)
	return &invite, err
}

func (r *inviteRepository) GetSenderID(ctx context.Context, inviteID string) (string, error) {
	var senderID string
	err := r.db.GetContext(ctx, &senderID, QueryGetSenderID, inviteID)
	return senderID, err
}

func (r *inviteRepository) DeleteInvite(ctx context.Context, inviteID string) error {
	_, err := r.db.ExecContext(ctx, QueryDeleteInvite, inviteID)
	return err
}

func (r *inviteRepository) UpsertRSVP(ctx context.Context, rsvp *models.RSVP) error {
	_, err := r.db.ExecContext(ctx, QueryUpsertRSVP, rsvp.ID, rsvp.InviteID, rsvp.UserID, rsvp.Status, rsvp.GuestCount, rsvp.Dietary, rsvp.Note, rsvp.CreatedAt, rsvp.UpdatedAt)
	return err
}

func (r *inviteRepository) GetInviteDetails(ctx context.Context, inviteID string) (*models.InviteDetails, error) {
	var details models.InviteDetails

	// 1. Fetch Invite
	err := r.db.GetContext(ctx, &details.Invite, QueryGetInviteDetails_Invite, inviteID)
	if err != nil {
		return nil, err
	}

	// 2. Fetch Sender
	err = r.db.GetContext(ctx, &details.Sender, QueryGetInviteDetails_Sender, details.SenderID)
	if err != nil {
		return nil, err
	}

	// 3. Fetch Circle if exists
	if details.CircleID != nil {
		var circle models.CircleWithMembers
		err = r.db.GetContext(ctx, &circle.Circle, QueryGetInviteDetails_Circle, details.CircleID)
		if err == nil {
			// Fetch Members
			err = r.db.SelectContext(ctx, &circle.Members, QueryGetInviteDetails_CircleMembers, circle.ID)
			details.Circle = &circle
		}
	}

	// 4. Fetch RSVPs
	err = r.db.SelectContext(ctx, &details.RSVPs, QueryGetInviteDetails_RSVPs, inviteID)

	// 5. Fetch Feed Items
	err = r.db.SelectContext(ctx, &details.FeedItems, QueryGetInviteDetails_Feed, inviteID)

	// 6. Fetch Media Items
	err = r.db.SelectContext(ctx, &details.MediaItems, QueryGetInviteDetails_Media, inviteID)

	// Ensure non-nil slices
	if details.RSVPs == nil {
		details.RSVPs = []models.RSVPWithUser{}
	}
	if details.FeedItems == nil {
		details.FeedItems = []models.FeedWithUser{}
	}
	if details.MediaItems == nil {
		details.MediaItems = []models.MediaItem{}
	}

	return &details, nil
}
