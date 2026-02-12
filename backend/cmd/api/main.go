package main

import (
	"log/slog"
	"net/http"
	"os"

	"privo-club-backend/internal/auth"
	"privo-club-backend/internal/config"
	"privo-club-backend/internal/db"
	"privo-club-backend/internal/handlers"
	customMiddleware "privo-club-backend/internal/middleware"
	"privo-club-backend/internal/repository"

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
	r.Use(customMiddleware.Cors(cfg.AllowedOrigin))

	authMiddleware := auth.Middleware(cfg)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Privo.club Backend API Running"))
	})

	// Protected Routes

	authHandler := handlers.NewAuthHandler(repo.Auth)
	circlesHandler := handlers.NewCirclesHandler(repo.Circles)
	invitesHandler := handlers.NewInvitesHandler(repo.Invites)
	feedHandler := handlers.NewFeedHandler(repo.Feed)
	userHandler := handlers.NewUserHandler(repo.User)
	mediaHandler := handlers.NewMediaHandler(repo.Media)

	// Circles Routes (Mixed Public/Protected)
	r.Route("/api/circles", func(r chi.Router) {
		// Public: GET /invite/{code}
		circlesHandler.RegisterPublicRoutes(r)

		// Protected: Everything else
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware)
			circlesHandler.RegisterProtectedRoutes(r)
		})
	})

	// Protected Routes Group (Other resources)
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware)

		r.Route("/api/auth", authHandler.RegisterRoutes)
		r.Route("/api/invites", invitesHandler.RegisterRoutes)
		r.Route("/api/feed", feedHandler.RegisterRoutes)
		r.Route("/api/users", userHandler.RegisterRoutes)
		r.Route("/api/media", mediaHandler.RegisterRoutes)
	})

	// Static File Server
	fileServer(r, "/uploads", "./uploads")

	slog.Info("Starting server", "port", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		slog.Error("Server failed", "error", err)
		os.Exit(1)
	}
}

func fileServer(r chi.Router, path string, root string) {
	if _, err := os.Stat(root); os.IsNotExist(err) {
		os.Mkdir(root, 0755)
	}
	fs := http.StripPrefix(path, http.FileServer(http.Dir(root)))
	r.Get(path+"/*", func(w http.ResponseWriter, r *http.Request) {
		fs.ServeHTTP(w, r)
	})
}
