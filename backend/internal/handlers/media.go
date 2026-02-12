package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"privo-club-backend/internal/api"
	"privo-club-backend/internal/auth"
	"privo-club-backend/internal/models"
	"privo-club-backend/internal/repository"
	"privo-club-backend/internal/utils"

	"github.com/go-chi/chi/v5"
)

type MediaHandler struct {
	Repo repository.MediaRepository
}

func NewMediaHandler(repo repository.MediaRepository) *MediaHandler {
	return &MediaHandler{Repo: repo}
}

func (h *MediaHandler) RegisterRoutes(r chi.Router) {
	r.Method("POST", "/", api.Handler(h.UploadMedia))
}

func (h *MediaHandler) UploadMedia(w http.ResponseWriter, r *http.Request) error {

	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {

		return api.ErrUnauthorized("Unauthorized")
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB max

		return api.ErrBadRequest("File too large or invalid multipart")
	}

	file, header, err := r.FormFile("file")
	if err != nil {

		return api.ErrBadRequest("File is required")
	}
	defer file.Close()

	inviteID := r.FormValue("inviteId")
	if inviteID == "" {

		return api.ErrBadRequest("Invite ID is required")
	}

	// Create uploads directory if not exists
	uploadDir := filepath.Join(".", "uploads", inviteID)
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {

		return api.ErrInternal(err)
	}

	// Generate filename
	ext := filepath.Ext(header.Filename)
	filename := utils.GenerateID("media") + ext
	filePath := filepath.Join(uploadDir, filename)

	// Save file
	dst, err := os.Create(filePath)
	if err != nil {

		return api.ErrInternal(err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {

		return api.ErrInternal(err)
	}

	// Public URL (assuming static file server at /uploads)
	publicURL := "/uploads/" + inviteID + "/" + filename

	// Save to DB
	media := &models.MediaItem{
		ID:        utils.GenerateID("media"),
		InviteID:  inviteID,
		UserID:    userID,
		URL:       publicURL,
		Type:      "IMAGE", // Default to IMAGE for now, can detect mimetype if needed
		CreatedAt: time.Now(),
	}

	if err := h.Repo.CreateMedia(r.Context(), media); err != nil {

		return api.ErrInternal(err)
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(media)
}
