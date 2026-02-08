package handlers

import (
	"encoding/json"
	"net/http"

	"privo-club-backend/internal/api"
	"privo-club-backend/internal/auth"
	"privo-club-backend/internal/models"
	"privo-club-backend/internal/repository"

	"github.com/go-chi/chi/v5"
)

type UserHandler struct {
	Repo repository.UserRepository
}

func NewUserHandler(repo repository.UserRepository) *UserHandler {
	return &UserHandler{Repo: repo}
}

func (h *UserHandler) RegisterRoutes(r chi.Router) {
	r.Method("GET", "/{id}/profile", api.Handler(h.GetProfile))
	r.Method("GET", "/{id}/stats", api.Handler(h.GetStats))
	r.Method("PUT", "/{id}/profile", api.Handler(h.UpdateProfile))
}

func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) error {
	userID := chi.URLParam(r, "id")
	if userID == "" {
		return api.ErrBadRequest("User ID is required")
	}

	// Get the current authenticated user
	currentUserID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	// Get the user profile
	user, err := h.Repo.GetUserByID(r.Context(), userID)
	if err != nil {
		return api.ErrNotFound("User not found")
	}

	// Check profile visibility
	if user.ProfileVisibility != nil && *user.ProfileVisibility == "PRIVATE" && userID != currentUserID {
		return api.ErrUnauthorized("This profile is private")
	}

	// Get user stats
	stats, err := h.Repo.GetUserStats(r.Context(), userID)
	if err != nil {
		return api.ErrInternal(err)
	}

	response := models.UserProfileResponse{
		User:  *user,
		Stats: *stats,
	}

	return json.NewEncoder(w).Encode(response)
}

func (h *UserHandler) GetStats(w http.ResponseWriter, r *http.Request) error {
	userID := chi.URLParam(r, "id")
	if userID == "" {
		return api.ErrBadRequest("User ID is required")
	}

	// Get the current authenticated user
	currentUserID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	// Get the user to check visibility
	user, err := h.Repo.GetUserByID(r.Context(), userID)
	if err != nil {
		return api.ErrNotFound("User not found")
	}

	// Check profile visibility
	if user.ProfileVisibility != nil && *user.ProfileVisibility == "PRIVATE" && userID != currentUserID {
		return api.ErrUnauthorized("This profile is private")
	}

	// Get user stats
	stats, err := h.Repo.GetUserStats(r.Context(), userID)
	if err != nil {
		return api.ErrInternal(err)
	}

	return json.NewEncoder(w).Encode(stats)
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) error {
	userID := chi.URLParam(r, "id")
	if userID == "" {
		return api.ErrBadRequest("User ID is required")
	}

	// Get the current authenticated user
	currentUserID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	// Users can only update their own profile
	if userID != currentUserID {
		return api.ErrUnauthorized("You can only update your own profile")
	}

	var req models.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return api.ErrBadRequest("Invalid request body")
	}

	// Validate profile visibility if provided
	if req.ProfileVisibility != nil {
		visibility := *req.ProfileVisibility
		if visibility != "PUBLIC" && visibility != "PRIVATE" && visibility != "CIRCLES_ONLY" {
			return api.ErrBadRequest("Invalid profile visibility value")
		}
	}

	// Update the profile
	if err := h.Repo.UpdateProfile(r.Context(), userID, &req); err != nil {
		return api.ErrInternal(err)
	}

	// Get the updated user profile
	user, err := h.Repo.GetUserByID(r.Context(), userID)
	if err != nil {
		return api.ErrInternal(err)
	}

	return json.NewEncoder(w).Encode(user)
}
