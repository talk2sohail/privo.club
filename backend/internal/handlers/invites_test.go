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

	"invito-backend/internal/auth"
	"invito-backend/internal/repository"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

func TestCreateInvite(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error stubbing db: %s", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewInviteRepository(sqlxDB)
	handler := NewInviteHandler(repo)

	// Fixed time for event date
	eventDate := time.Date(2025, 1, 1, 12, 0, 0, 0, time.UTC)

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
				"title":     "Party",
				"eventDate": eventDate,
			},
			mockBehavior: func() {
				mock.ExpectExec(`INSERT INTO "Invite"`).
					WithArgs(sqlmock.AnyArg(), "Party", sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), "user-123", sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
					WillReturnResult(sqlmock.NewResult(1, 1))
			},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.body)
			req, _ := http.NewRequest("POST", "/invites", bytes.NewBuffer(body))
			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}
			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.CreateInvite(rr, req)
			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestRSVP(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error stubbing db: %s", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewInviteRepository(sqlxDB)
	handler := NewInviteHandler(repo)

	tests := []struct {
		name           string
		userID         string
		inviteID       string
		body           map[string]interface{}
		mockBehavior   func()
		expectedStatus int
	}{
		{
			name:     "Success",
			userID:   "user-123",
			inviteID: "invite-1",
			body: map[string]interface{}{
				"status":     "YES",
				"guestCount": 1,
			},
			mockBehavior: func() {
				// The Insert statement is complex with ON CONFLICT, we just match prefix or regex
				mock.ExpectExec(`INSERT INTO "RSVP"`).
					WithArgs(
						sqlmock.AnyArg(), // id
						"invite-1",       // inviteId
						"user-123",       // userId
						"YES",            // status
						1,                // guestCount
						nil,              // dietary
						sqlmock.AnyArg(), // note
						sqlmock.AnyArg(), // createdAt
						sqlmock.AnyArg(), // updatedAt
					).
					WillReturnResult(sqlmock.NewResult(1, 1))
			},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.body)
			req, _ := http.NewRequest("POST", "/invites/"+tt.inviteID+"/rsvp", bytes.NewBuffer(body))
			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}

			// Setup Chi route param
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", tt.inviteID)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.RSVP(rr, req)
			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestListInvites(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error stubbing db: %s", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewInviteRepository(sqlxDB)
	handler := NewInviteHandler(repo)

	tests := []struct {
		name           string
		userID         string
		mockBehavior   func()
		expectedStatus int
	}{
		{
			name:   "Success",
			userID: "user-123",
			mockBehavior: func() {
				rows := sqlmock.NewRows([]string{
					"id", "title", "description", "location", "eventDate", "senderId", "circleId", "createdAt", "updatedAt",
					"sender_id", "sender_name", "sender_email", "sender_image",
					"circle_id", "circle_name", "rsvp_count",
				}).AddRow(
					"invite-1", "Party", "Desc", "Loc", time.Now(), "user-123", nil, time.Now(), time.Now(),
					"user-123", "User Name", "user@email.com", nil,
					nil, nil, 0,
				)
				mock.ExpectQuery(`SELECT DISTINCT .* FROM "Invite"`).
					WithArgs("user-123").
					WillReturnRows(rows)
			},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/invites", nil)
			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}
			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.ListInvites(rr, req)
			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestGetInvite(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error stubbing db: %s", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewInviteRepository(sqlxDB)
	handler := NewInviteHandler(repo)

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
				// 1. Invite
				rowsInvite := sqlmock.NewRows([]string{"id", "title", "senderId", "circleId"}).
					AddRow("invite-1", "Party", "user-123", nil)
				mock.ExpectQuery(`SELECT \* FROM "Invite" WHERE id = \$1`).
					WithArgs("invite-1").
					WillReturnRows(rowsInvite)
				// 2. Sender
				rowsSender := sqlmock.NewRows([]string{"id", "name"}).AddRow("user-123", "Sender")
				mock.ExpectQuery(`SELECT \* FROM "User" WHERE id = \$1`).
					WithArgs("user-123").
					WillReturnRows(rowsSender)
				// 3. RSVPs
				mock.ExpectQuery(`SELECT r\.\*, .* FROM "RSVP"`).
					WithArgs("invite-1").
					WillReturnRows(sqlmock.NewRows([]string{}))
				// 4. Feed
				mock.ExpectQuery(`SELECT f\.\*, .* FROM "EventFeedItem"`).
					WithArgs("invite-1").
					WillReturnRows(sqlmock.NewRows([]string{}))
				// 5. Media
				mock.ExpectQuery(`SELECT \* FROM "MediaItem"`).
					WithArgs("invite-1").
					WillReturnRows(sqlmock.NewRows([]string{}))
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:     "Not Found",
			inviteID: "invite-999",
			mockBehavior: func() {
				mock.ExpectQuery(`SELECT \* FROM "Invite" WHERE id = \$1`).
					WithArgs("invite-999").
					WillReturnError(errors.New("no rows"))
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/invites/"+tt.inviteID, nil)

			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", tt.inviteID)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.GetInvite(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestDeleteInvite(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error stubbing db: %s", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewInviteRepository(sqlxDB)
	handler := NewInviteHandler(repo)

	tests := []struct {
		name           string
		userID         string
		inviteID       string
		mockBehavior   func()
		expectedStatus int
	}{
		{
			name:     "Success",
			userID:   "user-123",
			inviteID: "invite-1",
			mockBehavior: func() {
				// Check Sender
				rows := sqlmock.NewRows([]string{"senderId"}).AddRow("user-123")
				mock.ExpectQuery(`SELECT "senderId" FROM "Invite" WHERE id = \$1`).
					WithArgs("invite-1").
					WillReturnRows(rows)
				// Delete

				mock.ExpectExec(`DELETE FROM "Invite" WHERE id = \$1`).
					WithArgs("invite-1").
					WillReturnResult(sqlmock.NewResult(1, 1))
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:     "Forbidden",
			userID:   "user-456",
			inviteID: "invite-1",
			mockBehavior: func() {
				rows := sqlmock.NewRows([]string{"senderId"}).AddRow("user-123")
				mock.ExpectQuery(`SELECT "senderId" FROM "Invite" WHERE id = \$1`).
					WithArgs("invite-1").
					WillReturnRows(rows)
			},
			expectedStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("DELETE", "/invites/"+tt.inviteID, nil)
			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}

			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", tt.inviteID)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.DeleteInvite(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("unfulfilled expectations: %s", err)
			}
		})
	}
}
