package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"invito-backend/internal/auth"
	"invito-backend/internal/models"
	"invito-backend/internal/repository"
	"invito-backend/internal/utils"

	"github.com/go-chi/chi/v5"
)

type FeedHandler struct {
	Repo repository.FeedRepository
}

func NewFeedHandler(repo repository.FeedRepository) *FeedHandler {
	return &FeedHandler{Repo: repo}
}

func (h *FeedHandler) RegisterRoutes(r chi.Router) {
	r.Post("/", h.CreatePost)
	r.Get("/{inviteId}", h.GetFeed)
}

func (h *FeedHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	id := utils.GenerateID("feed")
	item := &models.EventFeedItem{
		ID:        id,
		InviteID:  req.InviteID,
		UserID:    userID,
		Content:   req.Content,
		Type:      req.Type,
		CreatedAt: time.Now(),
	}

	if err := h.Repo.CreatePost(r.Context(), item); err != nil {
		http.Error(w, "Failed to post update: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"id": id})
}

func (h *FeedHandler) GetFeed(w http.ResponseWriter, r *http.Request) {
	inviteID := chi.URLParam(r, "inviteId")

	items, err := h.Repo.GetFeed(r.Context(), inviteID)
	if err != nil {
		http.Error(w, "Failed to fetch feed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}
