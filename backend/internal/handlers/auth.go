package handlers

import (
	"encoding/json"
	"net/http"

	"privo-club-backend/internal/api"
	"privo-club-backend/internal/models"
	"privo-club-backend/internal/repository"

	"github.com/go-chi/chi/v5"
)

type AuthHandler struct {
	Repo repository.AuthRepository
}

func NewAuthHandler(repo repository.AuthRepository) *AuthHandler {
	return &AuthHandler{Repo: repo}
}

func (h *AuthHandler) RegisterRoutes(r chi.Router) {
	r.Method("POST", "/sync", api.Handler(h.SyncUser))
}

func (h *AuthHandler) SyncUser(w http.ResponseWriter, r *http.Request) error {
	var req models.SyncUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return api.ErrBadRequest("Invalid request body")
	}

	if req.ID == "" || req.Email == "" {
		return api.ErrBadRequest("Missing required fields")
	}

	user := &models.User{
		ID:            req.ID,
		Name:          req.Name,
		Email:         &req.Email,
		Image:         req.Image,
		EmailVerified: req.EmailVerified,
	}

	if err := h.Repo.SyncUser(r.Context(), user); err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
