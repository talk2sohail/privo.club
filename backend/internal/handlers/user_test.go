package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"privo-club-backend/internal/api"
	"privo-club-backend/internal/auth"
	"privo-club-backend/internal/repository"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

func TestGetProfile(t *testing.T) {
	tests := []struct {
		name           string
		userID         string
		currentUserID  string
		mockBehavior   func(mock sqlmock.Sqlmock)
		expectedStatus int
		checkBody      func(t *testing.T, body string)
	}{
		{
			name:          "Success - Own Profile",
			userID:        "user-123",
			currentUserID: "user-123",
			mockBehavior: func(mock sqlmock.Sqlmock) {
				// Mock GetUserByID
				name := "Test User"
				email := "test@example.com"
				visibility := "PUBLIC"
				bio := "Test bio"
				createdAt := time.Now()
				rows := sqlmock.NewRows([]string{"id", "name", "email", "emailVerified", "image", "bio", "profileVisibility", "notificationPreferences", "createdAt"}).
					AddRow("user-123", name, email, nil, nil, bio, visibility, nil, createdAt)
				mock.ExpectQuery(`SELECT id, name, email`).WithArgs("user-123").WillReturnRows(rows)

				// Mock GetUserStats
				mock.ExpectQuery(`SELECT COUNT\(\*\) FROM "Circle"`).WithArgs("user-123").
					WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(2))
				mock.ExpectQuery(`SELECT COUNT\(DISTINCT cm."circleId"\)`).WithArgs("user-123").
					WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(3))
				mock.ExpectQuery(`SELECT COUNT\(\*\) FROM "Invite"`).WithArgs("user-123").
					WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(5))
				// Combined RSVP query returns both events_attended and total_responses
				mock.ExpectQuery(`SELECT COUNT\(CASE WHEN status = 'YES' THEN 1 END\)`).WithArgs("user-123").
					WillReturnRows(sqlmock.NewRows([]string{"events_attended", "total_responses"}).AddRow(4, 8))
				mock.ExpectQuery(`SELECT COUNT\(DISTINCT i.id\)`).WithArgs("user-123").
					WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(10))
				mock.ExpectQuery(`SELECT COUNT\(\*\) FROM "EventFeedItem"`).WithArgs("user-123").
					WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(12))
			},
			expectedStatus: http.StatusOK,
			checkBody: func(t *testing.T, body string) {
				assert.Contains(t, body, "user-123")
				assert.Contains(t, body, "Test User")
				assert.Contains(t, body, "stats")
			},
		},
		{
			name:          "User Not Found",
			userID:        "user-999",
			currentUserID: "user-123",
			mockBehavior: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery(`SELECT id, name, email`).WithArgs("user-999").
					WillReturnError(errors.New("not found"))
			},
			expectedStatus: http.StatusNotFound,
			checkBody: func(t *testing.T, body string) {
				assert.Contains(t, body, "User not found")
			},
		},
		{
			name:          "Private Profile - Unauthorized",
			userID:        "user-456",
			currentUserID: "user-123",
			mockBehavior: func(mock sqlmock.Sqlmock) {
				visibility := "PRIVATE"
				rows := sqlmock.NewRows([]string{"id", "name", "email", "emailVerified", "image", "bio", "profileVisibility", "notificationPreferences", "createdAt"}).
					AddRow("user-456", "Private User", "private@example.com", nil, nil, nil, visibility, nil, time.Now())
				mock.ExpectQuery(`SELECT id, name, email`).WithArgs("user-456").WillReturnRows(rows)
			},
			expectedStatus: http.StatusUnauthorized,
			checkBody: func(t *testing.T, body string) {
				assert.Contains(t, body, "This profile is private")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db, mock, err := sqlmock.New()
			assert.NoError(t, err)
			defer db.Close()

			sqlxDB := sqlx.NewDb(db, "sqlmock")
			userRepo := repository.NewUserRepository(sqlxDB)
			handler := NewUserHandler(userRepo)

			tt.mockBehavior(mock)

			req := httptest.NewRequest("GET", "/api/users/"+tt.userID+"/profile", nil)
			rr := httptest.NewRecorder()

			// Add userID to context
			ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.currentUserID)
			req = req.WithContext(ctx)

			// Add URL params
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", tt.userID)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			api.Handler(handler.GetProfile).ServeHTTP(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)
			if tt.checkBody != nil {
				tt.checkBody(t, rr.Body.String())
			}

			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

func TestUpdateProfile(t *testing.T) {
	tests := []struct {
		name           string
		userID         string
		currentUserID  string
		requestBody    map[string]interface{}
		mockBehavior   func(mock sqlmock.Sqlmock)
		expectedStatus int
		checkBody      func(t *testing.T, body string)
	}{
		{
			name:          "Success",
			userID:        "user-123",
			currentUserID: "user-123",
			requestBody: map[string]interface{}{
				"name": "Updated Name",
				"bio":  "Updated bio",
			},
			mockBehavior: func(mock sqlmock.Sqlmock) {
				mock.ExpectExec(`UPDATE "User" SET`).
					WithArgs("Updated Name", "Updated bio", "user-123").
					WillReturnResult(sqlmock.NewResult(0, 1))

				// Mock GetUserByID after update
				rows := sqlmock.NewRows([]string{"id", "name", "email", "emailVerified", "image", "bio", "profileVisibility", "notificationPreferences", "createdAt"}).
					AddRow("user-123", "Updated Name", "test@example.com", nil, nil, "Updated bio", "PUBLIC", nil, time.Now())
				mock.ExpectQuery(`SELECT id, name, email`).WithArgs("user-123").WillReturnRows(rows)
			},
			expectedStatus: http.StatusOK,
			checkBody: func(t *testing.T, body string) {
				assert.Contains(t, body, "Updated Name")
				assert.Contains(t, body, "Updated bio")
			},
		},
		{
			name:          "Unauthorized - Different User",
			userID:        "user-456",
			currentUserID: "user-123",
			requestBody: map[string]interface{}{
				"name": "Hacker Name",
			},
			mockBehavior:   func(mock sqlmock.Sqlmock) {},
			expectedStatus: http.StatusUnauthorized,
			checkBody: func(t *testing.T, body string) {
				assert.Contains(t, body, "You can only update your own profile")
			},
		},
		{
			name:          "Invalid Visibility Value",
			userID:        "user-123",
			currentUserID: "user-123",
			requestBody: map[string]interface{}{
				"profileVisibility": "INVALID",
			},
			mockBehavior:   func(mock sqlmock.Sqlmock) {},
			expectedStatus: http.StatusBadRequest,
			checkBody: func(t *testing.T, body string) {
				assert.Contains(t, body, "Invalid profile visibility value")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db, mock, err := sqlmock.New()
			assert.NoError(t, err)
			defer db.Close()

			sqlxDB := sqlx.NewDb(db, "sqlmock")
			userRepo := repository.NewUserRepository(sqlxDB)
			handler := NewUserHandler(userRepo)

			tt.mockBehavior(mock)

			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest("PUT", "/api/users/"+tt.userID+"/profile", bytes.NewReader(body))
			rr := httptest.NewRecorder()

			// Add userID to context
			ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.currentUserID)
			req = req.WithContext(ctx)

			// Add URL params
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", tt.userID)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			api.Handler(handler.UpdateProfile).ServeHTTP(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)
			if tt.checkBody != nil {
				tt.checkBody(t, rr.Body.String())
			}

			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}
