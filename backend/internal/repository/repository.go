package repository

import "github.com/jmoiron/sqlx"

type Repository struct {
	Circles CircleRepository
	Invites InviteRepository
	Feed    FeedRepository
	Auth    AuthRepository
	User    UserRepository
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Circles: NewCircleRepository(db),
		Invites: NewInviteRepository(db),
		Feed:    NewFeedRepository(db),
		Auth:    NewAuthRepository(db),
		User:    NewUserRepository(db),
	}
}
