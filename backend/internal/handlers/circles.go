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

type CircleHandler struct {
	Repo repository.CircleRepository
}

func NewCircleHandler(repo repository.CircleRepository) *CircleHandler {
	return &CircleHandler{Repo: repo}
}

func (h *CircleHandler) RegisterRoutes(r chi.Router) {
	r.Post("/", h.CreateCircle)
	r.Get("/", h.ListCircles)
	r.Get("/{id}", h.GetCircle)
	r.Post("/{id}/regenerate", h.RegenerateInviteCode)
	r.Post("/join", h.JoinCircleByCode)
	r.Get("/invite/{code}", h.GetCircleByInviteCode)
	r.Delete("/{id}", h.DeleteCircle)
}

func (h *CircleHandler) GetCircleByInviteCode(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")

	circle, err := h.Repo.GetCircleByInviteCode(r.Context(), code)
	if err != nil {
		http.Error(w, "Invalid invite code", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(circle)
}

func (h *CircleHandler) JoinCircleByCode(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.JoinCircleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	circleResponse, err := h.Repo.GetCircleByInviteCode(r.Context(), req.Code)
	if err != nil {
		http.Error(w, "Invalid invite code", http.StatusBadRequest)
		return
	}

	isMember, _ := h.Repo.IsMember(r.Context(), circleResponse.Circle.ID, userID)
	if isMember {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "circleId": circleResponse.Circle.ID, "alreadyMember": true})
		return
	}

	memberID := utils.GenerateID("member")
	member := &models.CircleMember{
		ID:       memberID,
		CircleID: circleResponse.Circle.ID,
		UserID:   userID,
		Role:     "MEMBER",
		JoinedAt: time.Now(),
	}

	if err := h.Repo.AddMember(r.Context(), member); err != nil {
		http.Error(w, "Failed to join circle: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "circleId": circleResponse.Circle.ID})
}

func (h *CircleHandler) CreateCircle(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.CreateCircleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Generate 8-char random invite code (e.g. 'Ab3dE9zX')
	inviteCode := utils.GenerateRandomString(8)
	circleID := utils.GenerateID("circle")
	memberID := utils.GenerateID("member")

	circle := &models.Circle{
		ID:          circleID,
		Name:        req.Name,
		Description: req.Description,
		InviteCode:  inviteCode,
		OwnerID:     userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	member := &models.CircleMember{
		ID:       memberID,
		CircleID: circleID,
		UserID:   userID,
		Role:     "OWNER",
		JoinedAt: time.Now(),
	}

	// Use repository transaction method
	if err := h.Repo.CreateCircleWithMember(r.Context(), circle, member); err != nil {
		http.Error(w, "Failed to create circle: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"id": circleID})
}

func (h *CircleHandler) ListCircles(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	response, err := h.Repo.ListCircles(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to fetch circles: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *CircleHandler) GetCircle(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	id := chi.URLParam(r, "id")

	circle, err := h.Repo.GetCircleDetailsByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Circle not found", http.StatusNotFound)
		return
	}

	// Authorization check: User must be a member
	isMember := false
	for _, member := range circle.Members {
		if member.UserID == userID {
			isMember = true
			break
		}
	}

	if !isMember {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(circle)
}

func (h *CircleHandler) RegenerateInviteCode(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	circleID := chi.URLParam(r, "id")

	ownerID, err := h.Repo.GetCircleOwner(r.Context(), circleID)
	if err != nil {
		http.Error(w, "Circle not found", http.StatusNotFound)
		return
	}

	if ownerID != userID {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	newCode := utils.GenerateRandomString(8)
	if err := h.Repo.UpdateInviteCode(r.Context(), circleID, newCode); err != nil {
		http.Error(w, "Failed to update code", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"inviteCode": newCode})
}

func (h *CircleHandler) DeleteCircle(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	circleID := chi.URLParam(r, "id")

	ownerID, err := h.Repo.GetCircleOwner(r.Context(), circleID)
	if err != nil {
		http.Error(w, "Circle not found", http.StatusNotFound)
		return
	}

	if ownerID != userID {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	if err := h.Repo.DeleteCircle(r.Context(), circleID); err != nil {
		http.Error(w, "Failed to delete circle", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
