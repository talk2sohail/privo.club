package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"privo-club-backend/internal/api"
	"privo-club-backend/internal/auth"
	"privo-club-backend/internal/models"
	"privo-club-backend/internal/repository"
	"privo-club-backend/internal/utils"

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
	r.Method("GET", "/", api.Handler(h.GetFeed))
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

func (h *FeedHandler) GetFeed(w http.ResponseWriter, r *http.Request) error {
	inviteID := chi.URLParam(r, "inviteId")

	items, err := h.Repo.GetFeed(r.Context(), inviteID)
	if err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(items)
}
