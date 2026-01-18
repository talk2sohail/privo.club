package handlers

import (
	"encoding/json"
	"net/http"

	"invito-backend/internal/models"
	"invito-backend/internal/repository"

	"github.com/go-chi/chi/v5"
)

type AuthHandler struct {
	Repo repository.AuthRepository
}

func NewAuthHandler(repo repository.AuthRepository) *AuthHandler {
	return &AuthHandler{Repo: repo}
}

func (h *AuthHandler) RegisterRoutes(r chi.Router) {
	r.Post("/sync", h.SyncUser)
}

func (h *AuthHandler) SyncUser(w http.ResponseWriter, r *http.Request) {
	var req models.SyncUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.ID == "" || req.Email == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	user := &models.User{
		ID:            req.ID,
		Name:          req.Name,
		Email:         &req.Email,
		Image:         req.Image,
		EmailVerified: req.EmailVerified,
	}

	if err := h.Repo.SyncUser(r.Context(), user); err != nil {
		http.Error(w, "Failed to sync user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
