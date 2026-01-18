package main

import (
	"log"
	"net/http"

	"invito-backend/internal/auth"
	"invito-backend/internal/config"
	"invito-backend/internal/db"
	"invito-backend/internal/handlers"
	customMiddleware "invito-backend/internal/middleware"
	"invito-backend/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	cfg := config.Load()
	database := db.Connect(cfg.DatabaseURL)
	defer database.Close()

	// Initialize Repository
	repo := repository.NewRepository(database)

	r := chi.NewRouter()
	r.Use(customMiddleware.NewLogger(cfg.LogFilePath))
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/ping"))

	authMiddleware := auth.Middleware(cfg)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Invito Backend API Running"))
	})

	// Protected Routes
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware)

		circleHandler := handlers.NewCircleHandler(repo.Circles)
		r.Route("/api/circles", circleHandler.RegisterRoutes)

		inviteHandler := handlers.NewInviteHandler(repo.Invites)
		r.Route("/api/invites", inviteHandler.RegisterRoutes)

		feedHandler := handlers.NewFeedHandler(repo.Feed)
		r.Route("/api/feed", feedHandler.RegisterRoutes)

		authHandler := handlers.NewAuthHandler(repo.Auth)
		r.Route("/api/auth", authHandler.RegisterRoutes)
	})

	log.Printf("Starting server on port %s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
