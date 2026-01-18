package repository

import (
	"context"

	"invito-backend/internal/models"

	"github.com/jmoiron/sqlx"
)

type feedRepository struct {
	db *sqlx.DB
}

func NewFeedRepository(db *sqlx.DB) FeedRepository {
	return &feedRepository{db: db}
}

func (r *feedRepository) CreatePost(ctx context.Context, item *models.EventFeedItem) error {
	_, err := r.db.ExecContext(ctx, QueryCreatePost, item.ID, item.InviteID, item.UserID, item.Content, item.Type, item.CreatedAt)
	return err
}

func (r *feedRepository) GetFeed(ctx context.Context, inviteID string) ([]models.EventFeedItem, error) {
	var items []models.EventFeedItem
	err := r.db.SelectContext(ctx, &items, QueryGetFeed, inviteID)

	if items == nil {
		items = []models.EventFeedItem{}
	}
	return items, err
}
