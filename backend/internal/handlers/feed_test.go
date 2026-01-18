package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"invito-backend/internal/auth"
	"invito-backend/internal/repository"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

func TestCreatePost(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error stubbing db: %s", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewFeedRepository(sqlxDB)
	handler := NewFeedHandler(repo)

	tests := []struct {
		name           string
		userID         string
		body           map[string]interface{}
		mockBehavior   func()
		expectedStatus int
	}{
		{
			name:   "Success",
			userID: "user-123",
			body: map[string]interface{}{
				"inviteId": "invite-1",
				"content":  "Hello",
				"type":     "CHAT",
			},
			mockBehavior: func() {
				mock.ExpectExec(`INSERT INTO "EventFeedItem"`).
					WithArgs(sqlmock.AnyArg(), "invite-1", "user-123", "Hello", "CHAT", sqlmock.AnyArg()).
					WillReturnResult(sqlmock.NewResult(1, 1))
			},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.body)
			req, _ := http.NewRequest("POST", "/feed", bytes.NewBuffer(body))
			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}
			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.CreatePost(rr, req)
			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestGetFeed(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error stubbing db: %s", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewFeedRepository(sqlxDB)
	handler := NewFeedHandler(repo)

	tests := []struct {
		name           string
		inviteID       string
		mockBehavior   func()
		expectedStatus int
	}{
		{
			name:     "Success",
			inviteID: "invite-1",
			mockBehavior: func() {
				rows := sqlmock.NewRows([]string{"id", "inviteId", "userId", "content", "type", "createdAt"}).
					AddRow("feed-1", "invite-1", "user-1", "Hi", "CHAT", time.Now())
				mock.ExpectQuery(`SELECT \* FROM "EventFeedItem"`).
					WithArgs("invite-1").
					WillReturnRows(rows)
			},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/feed/"+tt.inviteID, nil)

			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("inviteId", tt.inviteID)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.GetFeed(rr, req)
			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("unfulfilled expectations: %s", err)
			}
		})
	}
}
