package handlers

import (
	"encoding/json"
	"log/slog"
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
	// Circle settings
	r.Method("PATCH", "/{id}/settings", api.Handler(h.UpdateCircleSettings))
	// Invite links
	r.Method("POST", "/{id}/invites", api.Handler(h.CreateInviteLink))
	r.Method("GET", "/{id}/invites", api.Handler(h.GetInviteLinks))
	r.Method("DELETE", "/{id}/invites/{inviteId}", api.Handler(h.DeleteInviteLink))
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

	var circleID string
	var memberStatus string = "PENDING" // Default for general link

	// 1. Try to find a CircleInviteLink first (limited-use link)
	inviteLink, err := h.Repo.GetInviteLinkByCode(r.Context(), code)
	if err == nil && inviteLink != nil {
		// Found a limited-use link
		// Check if it's still valid
		if inviteLink.UsedCount >= inviteLink.MaxUses {
			return api.ErrBadRequest("This invite link has reached its usage limit")
		}
		circleID = inviteLink.CircleID
		memberStatus = "ACTIVE" // Auto-approve for limited links
	} else {
		// 2. Try to find by general Circle.inviteCode
		circle, err := h.Repo.GetCircleByInviteCode(r.Context(), code)
		if err != nil {
			return api.ErrNotFound("Invalid invite code")
		}

		// Check if general invite link is enabled
		circleDetails, err := h.Repo.GetCircleByID(r.Context(), circle.ID)
		if err != nil {
			return api.ErrNotFound("Circle not found")
		}

		if !circleDetails.IsInviteLinkEnabled {
			return api.ErrBadRequest("Invite link is disabled")
		}

		circleID = circle.ID
		memberStatus = "PENDING"
	}

	// 3. Check if already member
	isMember, err := h.Repo.IsMember(r.Context(), circleID, userID)
	if err != nil {
		return api.ErrInternal(err)
	}
	if isMember {
		// Idempotency: If already a member, return success
		w.Header().Set("Content-Type", "application/json")
		return json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "circleId": circleID})
	}

	// 4. Add Member
	memberID := utils.GenerateID("member")
	member := &models.CircleMember{
		ID:       memberID,
		CircleID: circleID,
		UserID:   userID,
		Role:     "MEMBER",
		Status:   memberStatus,
		JoinedAt: time.Now(),
	}

	if err := h.Repo.AddMember(r.Context(), member); err != nil {
		return api.ErrInternal(err)
	}

	// 5. If using limited link, increment usage count
	if inviteLink != nil {
		if err := h.Repo.IncrementInviteLinkUsage(r.Context(), inviteLink.ID); err != nil {
			// Log error but don't fail the join - the member was already added successfully
			slog.Error("Failed to increment invite link usage", "linkID", inviteLink.ID, "error", err)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "circleId": circleID})
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
		ID:                  circleID,
		Name:                req.Name,
		Description:         req.Description,
		InviteCode:          inviteCode,
		IsInviteLinkEnabled: true, // Default enabled
		OwnerID:             userID,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
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

func (h *CirclesHandler) UpdateCircleSettings(w http.ResponseWriter, r *http.Request) error {
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
		return api.ErrForbidden("Only the owner can update circle settings")
	}

	var req models.UpdateCircleSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return api.ErrBadRequest("Invalid request body")
	}

	if req.IsInviteLinkEnabled != nil {
		if err := h.Repo.UpdateCircleSettings(r.Context(), circleID, *req.IsInviteLinkEnabled); err != nil {
			return api.ErrInternal(err)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (h *CirclesHandler) CreateInviteLink(w http.ResponseWriter, r *http.Request) error {
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
		return api.ErrForbidden("Only the owner can create invite links")
	}

	var req models.CreateInviteLinkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return api.ErrBadRequest("Invalid request body")
	}

	if req.MaxUses < 1 {
		return api.ErrBadRequest("Max uses must be at least 1")
	}

	linkID := utils.GenerateID("invitelink")
	code := utils.GenerateRandomString(12)

	link := &models.CircleInviteLink{
		ID:        linkID,
		CircleID:  circleID,
		Code:      code,
		MaxUses:   req.MaxUses,
		UsedCount: 0,
		CreatedAt: time.Now(),
		CreatorID: userID,
	}

	if err := h.Repo.CreateInviteLink(r.Context(), link); err != nil {
		return api.ErrInternal(err)
	}

	w.WriteHeader(http.StatusCreated)
	return json.NewEncoder(w).Encode(link)
}

func (h *CirclesHandler) GetInviteLinks(w http.ResponseWriter, r *http.Request) error {
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
		return api.ErrForbidden("Only the owner can view invite links")
	}

	links, err := h.Repo.GetInviteLinks(r.Context(), circleID)
	if err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(links)
}

func (h *CirclesHandler) DeleteInviteLink(w http.ResponseWriter, r *http.Request) error {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		return api.ErrUnauthorized("Unauthorized")
	}

	circleID := chi.URLParam(r, "id")
	inviteID := chi.URLParam(r, "inviteId")
	if circleID == "" || inviteID == "" {
		return api.ErrBadRequest("Circle ID and Invite ID required")
	}

	// Verify Owner
	ownerID, err := h.Repo.GetCircleOwner(r.Context(), circleID)
	if err != nil {
		return api.ErrNotFound("Circle not found")
	}
	if ownerID != userID {
		return api.ErrForbidden("Only the owner can delete invite links")
	}

	if err := h.Repo.DeleteInviteLink(r.Context(), inviteID); err != nil {
		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

