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

type InvitesHandler struct {
	Repo repository.InviteRepository
}

func NewInvitesHandler(repo repository.InviteRepository) *InvitesHandler {
	return &InvitesHandler{Repo: repo}
}

func (h *InvitesHandler) RegisterRoutes(r chi.Router) {
	r.Method("POST", "/", api.Handler(h.CreateInvite))
	r.Method("GET", "/", api.Handler(h.ListInvites))
	r.Method("GET", "/{id}", api.Handler(h.GetInvite))
	r.Method("POST", "/{id}/rsvp", api.Handler(h.RespondToRSVP))
	r.Method("DELETE", "/{id}", api.Handler(h.DeleteInvite))
}

func (h *InvitesHandler) CreateInvite(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	var req models.CreateInviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return api.ErrBadRequest("Invalid request body")
	}

	if req.Title == "" || req.EventDate.IsZero() {
		return api.ErrBadRequest("Title, event date are required")
	}

	inviteID := utils.GenerateID("invite")
	invite := &models.Invite{
		ID:          inviteID,
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
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(invite)
}

func (h *InvitesHandler) ListInvites(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	response, err := h.Repo.ListInvites(r.Context(), userID)
	if err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(response)
}

func (h *InvitesHandler) RespondToRSVP(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	inviteID := chi.URLParam(r, "id")
	if inviteID == "" {
		return api.ErrBadRequest("Invite ID required")
	}

	var req models.RSVPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return api.ErrBadRequest("Invalid request body")
	}

	if req.Status == "" {
		return api.ErrBadRequest("Status is required")
	}

	if req.GuestCount < 1 {
		req.GuestCount = 1
	}

	// Upsert RSVP
	rsvpID := utils.GenerateID("rsvp") // Might not be used if updating, but fine to generate
	rsvp := &models.RSVP{
		ID:         rsvpID,
		InviteID:   inviteID,
		UserID:     userID,
		Status:     req.Status,
		GuestCount: req.GuestCount,
		Dietary:    req.Dietary,
		Note:       req.Note,
		UpdatedAt:  time.Now(),
	}

	if err := h.Repo.UpsertRSVP(r.Context(), rsvp); err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (h *InvitesHandler) DeleteInvite(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}
	inviteID := chi.URLParam(r, "id")

	senderID, err := h.Repo.GetSenderID(r.Context(), inviteID)
	if err != nil {
		return api.ErrNotFound("Invite not found")
	}

	if senderID != userID {
		return api.ErrForbidden("Only sender can delete invite")
	}

	if err := h.Repo.DeleteInvite(r.Context(), inviteID); err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (h *InvitesHandler) GetInvite(w http.ResponseWriter, r *http.Request) error {
	inviteID := chi.URLParam(r, "id")

	details, err := h.Repo.GetInviteDetails(r.Context(), inviteID)
	if err != nil {
		return api.ErrNotFound("Invite not found")
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(details)
}
