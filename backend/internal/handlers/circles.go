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

type CirclesHandler struct {
	Repo repository.CircleRepository
}

func NewCirclesHandler(repo repository.CircleRepository) *CirclesHandler {
	return &CirclesHandler{Repo: repo}
}

func (h *CirclesHandler) RegisterProtectedRoutes(r chi.Router) {
	r.Method("POST", "/", api.Handler(h.CreateCircle))
	r.Method("GET", "/", api.Handler(h.ListCircles))
	r.Method("GET", "/{id}", api.Handler(h.GetCircle))
	r.Method("POST", "/{id}/regenerate", api.Handler(h.RegenerateInviteCode))
	r.Method("POST", "/join/{code}", api.Handler(h.JoinCircleByCode))
	r.Method("DELETE", "/{id}", api.Handler(h.DeleteCircle))
	r.Method("GET", "/{id}/pending", api.Handler(h.GetPendingMembers))
	r.Method("POST", "/{id}/members/{userId}/approve", api.Handler(h.ApproveMember))
	r.Method("DELETE", "/{id}/members/{userId}", api.Handler(h.RemoveMember))
}

func (h *CirclesHandler) RegisterPublicRoutes(r chi.Router) {
	r.Method("GET", "/invite/{code}", api.Handler(h.GetCircleByInviteCode))
}

func (h *CirclesHandler) GetCircleByInviteCode(w http.ResponseWriter, r *http.Request) error {
	code := chi.URLParam(r, "code")
	if code == "" {
		return api.ErrBadRequest("Invite code required")
	}

	circle, err := h.Repo.GetCircleByInviteCode(r.Context(), code)
	if err != nil {
		return api.ErrNotFound("Circle not found")
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(circle)
}

func (h *CirclesHandler) JoinCircleByCode(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	code := chi.URLParam(r, "code")
	if code == "" {
		return api.ErrBadRequest("Invite code required")
	}

	// 1. Find Circle by Code
	// Reusing GetCircleByInviteCode logic essentially, but we need ID to add member
	circle, err := h.Repo.GetCircleByInviteCode(r.Context(), code)
	if err != nil {
		return api.ErrNotFound("Invalid invite code")
	}

	// 2. Add Member
	// Check if already member? Repo usually handles unique constraint error
	// but we can query IsMember if we want cleaner error.
	isMember, err := h.Repo.IsMember(r.Context(), circle.ID, userID)
	if err != nil {
		return api.ErrInternal(err)
	}
	if isMember {
		// Idempotency: If already a member, return success and circleID so frontend redirects
		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "circleId": circle.ID})
	}

	memberID := utils.GenerateID("member")

	member := &models.CircleMember{
		ID:       memberID,
		CircleID: circle.ID,
		UserID:   userID,
		Role:     "MEMBER",
		Status:   "PENDING",
		JoinedAt: time.Now(),
	}

	if err := h.Repo.AddMember(r.Context(), member); err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "circleId": circle.ID})
}

func (h *CirclesHandler) CreateCircle(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	var req models.CreateCircleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return api.ErrBadRequest("Invalid request body")
	}

	if req.Name == "" {
		return api.ErrBadRequest("Circle name is required")
	}

	// Use utils.GenerateID
	circleID := utils.GenerateID("circle")
	// Use utils.GenerateRandomString
	inviteCode := utils.GenerateRandomString(12)

	circle := &models.Circle{
		ID:          circleID,
		Name:        req.Name,
		Description: req.Description,
		InviteCode:  inviteCode,
		OwnerID:     userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	memberID := utils.GenerateID("member")

	member := &models.CircleMember{
		ID:       memberID,
		CircleID: circleID,
		UserID:   userID,
		Role:     "OWNER",
		Status:   "ACTIVE",
		JoinedAt: time.Now(),
	}

	// Use repository transaction method
	if err := h.Repo.CreateCircleWithMember(r.Context(), circle, member); err != nil {
		return api.ErrInternal(err)
	}

	w.WriteHeader(http.StatusCreated)
	return json.NewEncoder(w).Encode(map[string]string{"id": circleID})
}

func (h *CirclesHandler) ListCircles(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	circles, err := h.Repo.ListCircles(r.Context(), userID)
	if err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(circles)
}

func (h *CirclesHandler) GetCircle(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	circleID := chi.URLParam(r, "id")
	if circleID == "" {
		return api.ErrBadRequest("Circle ID required")
	}

	// 1. Check Membership Status efficiently
	status, err := h.Repo.GetMemberStatus(r.Context(), circleID, userID)
	if err != nil {
		// If error is not found, it means they are not a member
		return api.ErrUnauthorized("You are not a member of this circle")
	}

	// 2. Fetch Details
	circleDetails, err := h.Repo.GetCircleDetailsByID(r.Context(), circleID)
	if err != nil {
		return api.ErrNotFound("Circle not found")
	}

	// 3. Handle Views based on Status
	circleDetails.CurrentUserStatus = status

	if status == "PENDING" {
		// Filter out sensitive data for pending members
		circleDetails.Members = []models.MemberWithUser{}
		circleDetails.Invites = []models.InviteWithCount{}
		// We still return the circle info and owner info so they can see what they are waiting for
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(circleDetails)
}

func (h *CirclesHandler) RegenerateInviteCode(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	circleID := chi.URLParam(r, "id")
	if circleID == "" {
		return api.ErrBadRequest("Circle ID required")
	}

	// 1. Verify Ownership
	ownerID, err := h.Repo.GetCircleOwner(r.Context(), circleID)
	if err != nil {
		return api.ErrNotFound("Circle not found") // Assuming GetCircleOwner returns error if not found
	}

	if ownerID != userID {
		return api.ErrForbidden("Only the owner can regenerate invite code")
	}

	// 2. Generate New Code
	newCode := utils.GenerateRandomString(12)

	// 3. Update DB
	if err := h.Repo.UpdateInviteCode(r.Context(), circleID, newCode); err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]string{"inviteCode": newCode})
}

func (h *CirclesHandler) DeleteCircle(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}
	circleID := chi.URLParam(r, "id")
	if circleID == "" {
		return api.ErrBadRequest("Circle ID required")
	}

	ownerID, err := h.Repo.GetCircleOwner(r.Context(), circleID)
	if err != nil {
		return api.ErrNotFound("Circle not found") // Assuming GetCircleOwner returns error if not found
	}

	if ownerID != userID {
		return api.ErrForbidden("Only the owner can delete a circle")
	}

	if err := h.Repo.DeleteCircle(r.Context(), circleID); err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (h *CirclesHandler) GetPendingMembers(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	circleID := chi.URLParam(r, "id")
	if circleID == "" {
		return api.ErrBadRequest("Circle ID required")
	}

	// Verify Owner
	ownerID, err := h.Repo.GetCircleOwner(r.Context(), circleID)
	if err != nil {
		return api.ErrNotFound("Circle not found")
	}
	if ownerID != userID {
		return api.ErrForbidden("Only the owner can view pending members")
	}

	members, err := h.Repo.GetPendingMembers(r.Context(), circleID)
	if err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(members)
}

func (h *CirclesHandler) ApproveMember(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	circleID := chi.URLParam(r, "id")
	targetUserID := chi.URLParam(r, "userId")
	if circleID == "" || targetUserID == "" {
		return api.ErrBadRequest("Circle ID and User ID required")
	}

	// Verify Owner
	ownerID, err := h.Repo.GetCircleOwner(r.Context(), circleID)
	if err != nil {
		return api.ErrNotFound("Circle not found")
	}
	if ownerID != userID {
		return api.ErrForbidden("Only the owner can approve members")
	}

	if err := h.Repo.UpdateMemberStatus(r.Context(), circleID, targetUserID, "ACTIVE"); err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (h *CirclesHandler) RemoveMember(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	circleID := chi.URLParam(r, "id")
	targetUserID := chi.URLParam(r, "userId")
	if circleID == "" || targetUserID == "" {
		return api.ErrBadRequest("Circle ID and User ID required")
	}

	// Verify Owner
	ownerID, err := h.Repo.GetCircleOwner(r.Context(), circleID)
	if err != nil {
		return api.ErrNotFound("Circle not found")
	}

	// Allow owner to remove anyone, OR user to remove themselves (leave)
	if ownerID != userID && targetUserID != userID {
		return api.ErrForbidden("You are not authorized to remove this member")
	}

	if err := h.Repo.RemoveMember(r.Context(), circleID, targetUserID); err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
