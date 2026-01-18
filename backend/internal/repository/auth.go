package repository

import (
	"context"

	"invito-backend/internal/models"

	"github.com/jmoiron/sqlx"
)

type authRepository struct {
	db *sqlx.DB
}

func NewAuthRepository(db *sqlx.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) SyncUser(ctx context.Context, user *models.User) error {
	_, err := r.db.ExecContext(ctx, QuerySyncUser, user.ID, user.Name, user.Email, user.Image, user.EmailVerified)
	return err
}
