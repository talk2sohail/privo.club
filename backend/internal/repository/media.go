package repository

import (
	"context"
	"privo-club-backend/internal/models"

	"github.com/jmoiron/sqlx"
)

type mediaRepository struct {
	db *sqlx.DB
}

func NewMediaRepository(db *sqlx.DB) MediaRepository {
	return &mediaRepository{db: db}
}

func (r *mediaRepository) CreateMedia(ctx context.Context, media *models.MediaItem) error {
	_, err := r.db.ExecContext(ctx, QueryCreateMedia, media.ID, media.InviteID, media.UserID, media.URL, media.Type, media.Caption, media.CreatedAt)
	return err
}
