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

type InviteHandler struct {
	Repo repository.InviteRepository
}

func NewInviteHandler(repo repository.InviteRepository) *InviteHandler {
	return &InviteHandler{Repo: repo}
}

func (h *InviteHandler) RegisterRoutes(r chi.Router) {
	r.Post("/", h.CreateInvite)
	r.Get("/", h.ListInvites)
	r.Get("/{id}", h.GetInvite)
	r.Post("/{id}/rsvp", h.RSVP)
	r.Delete("/{id}", h.DeleteInvite)
}

func (h *InviteHandler) CreateInvite(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.CreateInviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	id := utils.GenerateID("invite")
	invite := &models.Invite{
		ID:          id,
		Title:       req.Title,
		Description: req.Description,
		Location:    req.Location,
		EventDate:   req.EventDate,
		SenderID:    userID,
		CircleID:    req.CircleID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.Repo.CreateInvite(r.Context(), invite); err != nil {
		http.Error(w, "Failed to create invite: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"id": id})
}

func (h *InviteHandler) ListInvites(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	response, err := h.Repo.ListInvites(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to fetch invites: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *InviteHandler) RSVP(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	inviteID := chi.URLParam(r, "id")
	var req models.RSVPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	id := utils.GenerateID("rsvp")
	rsvp := &models.RSVP{
		ID:         id,
		InviteID:   inviteID,
		UserID:     userID,
		Status:     req.Status,
		GuestCount: req.GuestCount,
		Dietary:    req.Dietary,
		Note:       req.Note,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := h.Repo.UpsertRSVP(r.Context(), rsvp); err != nil {
		http.Error(w, "Failed to RSVP: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"success":true}`))
}

func (h *InviteHandler) DeleteInvite(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	inviteID := chi.URLParam(r, "id")

	senderID, err := h.Repo.GetSenderID(r.Context(), inviteID)
	if err != nil {
		http.Error(w, "Invite not found", http.StatusNotFound)
		return
	}

	if senderID != userID {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	if err := h.Repo.DeleteInvite(r.Context(), inviteID); err != nil {
		http.Error(w, "Failed to delete invite", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (h *InviteHandler) GetInvite(w http.ResponseWriter, r *http.Request) {
	inviteID := chi.URLParam(r, "id")

	details, err := h.Repo.GetInviteDetails(r.Context(), inviteID)
	if err != nil {
		http.Error(w, "Invite not found: "+err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(details)
}
