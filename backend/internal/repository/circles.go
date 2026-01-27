package repository

import (
	"context"

	"privo-club-backend/internal/models"

	"github.com/jmoiron/sqlx"
)

type circleRepository struct {
	db *sqlx.DB
}

func NewCircleRepository(db *sqlx.DB) CircleRepository {
	return &circleRepository{db: db}
}

func (r *circleRepository) CreateCircle(ctx context.Context, circle *models.Circle) error {
	_, err := r.db.ExecContext(ctx, QueryCreateCircle, circle.ID, circle.Name, circle.Description, circle.InviteCode, circle.IsInviteLinkEnabled, circle.OwnerID, circle.CreatedAt, circle.UpdatedAt)
	return err
}

func (r *circleRepository) AddMember(ctx context.Context, member *models.CircleMember) error {
	_, err := r.db.ExecContext(ctx, QueryAddMember, member.ID, member.CircleID, member.UserID, member.Role, member.Status, member.JoinedAt)
	return err
}

func (r *circleRepository) CreateCircleWithMember(ctx context.Context, circle *models.Circle, member *models.CircleMember) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, QueryCreateCircle, circle.ID, circle.Name, circle.Description, circle.InviteCode, circle.IsInviteLinkEnabled, circle.OwnerID, circle.CreatedAt, circle.UpdatedAt)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.ExecContext(ctx, QueryAddMember, member.ID, member.CircleID, member.UserID, member.Role, member.Status, member.JoinedAt)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (r *circleRepository) ListCircles(ctx context.Context, userID string) ([]models.CircleListResponse, error) {
	type CircleRow struct {
		models.Circle
		OwnerID     string  `db:"owner_id"`
		OwnerName   string  `db:"owner_name"`
		OwnerEmail  string  `db:"owner_email"`
		OwnerImage  *string `db:"owner_image"`
		MemberCount int     `db:"member_count"`
	}

	rows, err := r.db.QueryxContext(ctx, QueryListCircles, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var response []models.CircleListResponse
	for rows.Next() {
		var row CircleRow
		if err := rows.StructScan(&row); err != nil {
			continue
		}

		response = append(response, models.CircleListResponse{
			Circle: row.Circle,
			Owner: models.User{
				ID:    row.OwnerID,
				Name:  &row.OwnerName,
				Email: &row.OwnerEmail,
				Image: row.OwnerImage,
			},
			Count: struct {
				Members int `json:"members"`
			}{Members: row.MemberCount},
		})
	}
	if response == nil {
		response = []models.CircleListResponse{}
	}
	return response, nil
}

func (r *circleRepository) GetCircleByID(ctx context.Context, id string) (*models.Circle, error) {
	var circle models.Circle
	err := r.db.GetContext(ctx, &circle, QueryGetCircleByID, id)
	return &circle, err
}

func (r *circleRepository) GetCircleOwner(ctx context.Context, circleID string) (string, error) {
	var ownerID string
	err := r.db.GetContext(ctx, &ownerID, QueryGetCircleOwner, circleID)
	return ownerID, err
}

func (r *circleRepository) UpdateInviteCode(ctx context.Context, circleID, newCode string) error {
	_, err := r.db.ExecContext(ctx, QueryUpdateInviteCode, newCode, circleID)
	return err
}

func (r *circleRepository) GetCircleByInviteCode(ctx context.Context, code string) (*models.CircleListResponse, error) {
	type CircleRow struct {
		models.Circle
		OwnerID     string  `db:"owner_id"`
		OwnerName   string  `db:"owner_name"`
		OwnerEmail  string  `db:"owner_email"`
		OwnerImage  *string `db:"owner_image"`
		MemberCount int     `db:"member_count"`
	}

	var row CircleRow
	if err := r.db.GetContext(ctx, &row, QueryGetCircleByInviteCode, code); err != nil {
		return nil, err
	}

	return &models.CircleListResponse{
		Circle: row.Circle,
		Owner: models.User{
			ID:    row.OwnerID,
			Name:  &row.OwnerName,
			Email: &row.OwnerEmail,
			Image: row.OwnerImage,
		},
		Count: struct {
			Members int `json:"members"`
		}{Members: row.MemberCount},
	}, nil
}

func (r *circleRepository) IsMember(ctx context.Context, circleID, userID string) (bool, error) {
	var count int
	err := r.db.GetContext(ctx, &count, QueryIsMember, circleID, userID)
	return count > 0, err
}

func (r *circleRepository) DeleteCircle(ctx context.Context, circleID string) error {
	_, err := r.db.ExecContext(ctx, QueryDeleteCircle, circleID)
	return err
}

func (r *circleRepository) GetCircleDetailsByID(ctx context.Context, id string) (*models.CircleDetailsResponse, error) {
	// 1. Get Circle
	var circle models.Circle
	if err := r.db.GetContext(ctx, &circle, QueryGetCircleByID, id); err != nil {
		return nil, err
	}

	// 2. Get Owner
	var owner models.User
	if err := r.db.GetContext(ctx, &owner, QueryGetCircleOwnerDetails, circle.OwnerID); err != nil {
		return nil, err
	}

	// 3. Get Members
	type MemberRow struct {
		models.CircleMember
		UserID    string  `db:"user.id"`
		UserName  *string `db:"user.name"`
		UserEmail *string `db:"user.email"`
		UserImage *string `db:"user.image"`
	}
	var memberRows []MemberRow
	if err := r.db.SelectContext(ctx, &memberRows, QueryGetCircleMembers, id); err != nil {
		return nil, err
	}

	members := make([]models.MemberWithUser, len(memberRows))
	for i, row := range memberRows {
		members[i] = models.MemberWithUser{
			CircleMember: row.CircleMember,
			User: models.User{
				ID:    row.UserID,
				Name:  row.UserName,
				Email: row.UserEmail,
				Image: row.UserImage,
			},
		}
	}

	// 4. Get Invites
	type InviteRow struct {
		models.Invite
		RSVPCount int `db:"rsvp_count"`
	}
	var inviteRows []InviteRow
	if err := r.db.SelectContext(ctx, &inviteRows, QueryGetCircleEvents, id); err != nil {
		return nil, err
	}

	invites := make([]models.InviteWithCount, len(inviteRows))
	for i, row := range inviteRows {
		invites[i] = models.InviteWithCount{
			Invite: row.Invite,
			Count: struct {
				RSVPs int `json:"rsvps"`
			}{RSVPs: row.RSVPCount},
		}
	}

	return &models.CircleDetailsResponse{
		Circle:  circle,
		Owner:   owner,
		Members: members,
		Invites: invites,
	}, nil
}

func (r *circleRepository) GetPendingMembers(ctx context.Context, circleID string) ([]models.MemberWithUser, error) {
	type MemberRow struct {
		models.CircleMember
		UserID    string  `db:"user.id"`
		UserName  *string `db:"user.name"`
		UserEmail *string `db:"user.email"`
		UserImage *string `db:"user.image"`
	}
	var memberRows []MemberRow
	if err := r.db.SelectContext(ctx, &memberRows, QueryGetPendingMembers, circleID); err != nil {
		return nil, err
	}

	members := make([]models.MemberWithUser, len(memberRows))
	for i, row := range memberRows {
		members[i] = models.MemberWithUser{
			CircleMember: row.CircleMember,
			User: models.User{
				ID:    row.UserID,
				Name:  row.UserName,
				Email: row.UserEmail,
				Image: row.UserImage,
			},
		}
	}
	return members, nil
}

func (r *circleRepository) UpdateMemberStatus(ctx context.Context, circleID, userID, status string) error {
	_, err := r.db.ExecContext(ctx, QueryUpdateMemberStatus, status, circleID, userID)
	return err
}

func (r *circleRepository) RemoveMember(ctx context.Context, circleID, userID string) error {
	_, err := r.db.ExecContext(ctx, QueryRemoveMember, circleID, userID)
	return err
}

func (r *circleRepository) GetMemberStatus(ctx context.Context, circleID, userID string) (string, error) {
	var status string
	err := r.db.GetContext(ctx, &status, QueryGetMemberStatus, circleID, userID)
	return status, err
}

func (r *circleRepository) UpdateCircleSettings(ctx context.Context, circleID string, isInviteLinkEnabled bool) error {
	_, err := r.db.ExecContext(ctx, QueryUpdateCircleSettings, isInviteLinkEnabled, circleID)
	return err
}

func (r *circleRepository) CreateInviteLink(ctx context.Context, link *models.CircleInviteLink) error {
	_, err := r.db.ExecContext(ctx, QueryCreateInviteLink, link.ID, link.CircleID, link.Code, link.MaxUses, link.UsedCount, link.ExpiresAt, link.CreatedAt, link.CreatorID)
	return err
}

func (r *circleRepository) GetInviteLinkByCode(ctx context.Context, code string) (*models.CircleInviteLink, error) {
	var link models.CircleInviteLink
	err := r.db.GetContext(ctx, &link, QueryGetInviteLinkByCode, code)
	if err != nil {
		return nil, err
	}
	return &link, nil
}

func (r *circleRepository) GetInviteLinks(ctx context.Context, circleID string) ([]models.CircleInviteLink, error) {
	var links []models.CircleInviteLink
	err := r.db.SelectContext(ctx, &links, QueryGetInviteLinks, circleID)
	if err != nil {
		return nil, err
	}
	if links == nil {
		links = []models.CircleInviteLink{}
	}
	return links, nil
}

func (r *circleRepository) DeleteInviteLink(ctx context.Context, linkID string) error {
	_, err := r.db.ExecContext(ctx, QueryDeleteInviteLink, linkID)
	return err
}

func (r *circleRepository) IncrementInviteLinkUsage(ctx context.Context, linkID string) error {
	_, err := r.db.ExecContext(ctx, QueryIncrementInviteLinkUsage, linkID)
	return err
}


