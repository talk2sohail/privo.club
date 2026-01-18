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

func TestCreateCircle(t *testing.T) {
	// 1. Setup Mock DB
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewCircleRepository(sqlxDB)
	handler := NewCircleHandler(repo)

	// 2. Define Test Cases (Table-Driven)
	tests := []struct {
		name           string
		userID         string
		requestBody    map[string]interface{}
		mockBehavior   func()
		expectedStatus int
		expectedBody   string
	}{
		{
			name:   "Success",
			userID: "user-123",
			requestBody: map[string]interface{}{
				"name":        "Test Circle",
				"description": "A description",
			},
			mockBehavior: func() {
				mock.ExpectBegin()
				// Circle Insert
				mock.ExpectExec(`INSERT INTO "Circle"`).
					WithArgs(sqlmock.AnyArg(), "Test Circle", "A description", sqlmock.AnyArg(), "user-123", sqlmock.AnyArg(), sqlmock.AnyArg()).
					WillReturnResult(sqlmock.NewResult(1, 1))
				// Member Insert
				mock.ExpectExec(`INSERT INTO "CircleMember"`).
					WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), "user-123", "OWNER", sqlmock.AnyArg()).
					WillReturnResult(sqlmock.NewResult(1, 1))
				mock.ExpectCommit()
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `{"id":`, // Simple substring check
		},
		{
			name:   "Unauthorized - No User",
			userID: "",
			requestBody: map[string]interface{}{
				"name": "Test Circle",
			},
			mockBehavior:   func() {},
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   "Unauthorized",
		},
		{
			name:   "DB Error - Rollback",
			userID: "user-123",
			requestBody: map[string]interface{}{
				"name": "Fail Circle",
			},
			mockBehavior: func() {
				mock.ExpectBegin()
				mock.ExpectExec(`INSERT INTO "Circle"`).
					WillReturnError(errors.New("db error"))
				mock.ExpectRollback()
			},
			expectedStatus: http.StatusInternalServerError,
			expectedBody:   "Failed to create circle",
		},
		{
			name:   "Invalid JSON",
			userID: "user-123",
			requestBody: map[string]interface{}{
				"name": 123, // Invalid type
			},
			mockBehavior:   func() {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   "Invalid request body",
		},
	}

	// 3. Run Tests
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("POST", "/circles", bytes.NewBuffer(body))

			// Inject context
			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}

			// Setup expectations
			tt.mockBehavior()

			rr := httptest.NewRecorder()
			handler.CreateCircle(rr, req)

			// Assertions
			if status := rr.Code; status != tt.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v", status, tt.expectedStatus)
			}

			if tt.expectedBody != "" {
				assert.Contains(t, rr.Body.String(), tt.expectedBody)
			}

			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("there were unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestRegenerateInviteCode(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewCircleRepository(sqlxDB)
	handler := NewCircleHandler(repo)

	tests := []struct {
		name           string
		userID         string
		circleID       string
		mockBehavior   func()
		expectedStatus int
	}{
		{
			name:     "Success",
			userID:   "user-123",
			circleID: "circle-1",
			mockBehavior: func() {
				// Get Owner
				rows := sqlmock.NewRows([]string{"ownerId"}).AddRow("user-123")
				mock.ExpectQuery(`SELECT "ownerId" FROM "Circle" WHERE id = \$1`).
					WithArgs("circle-1").
					WillReturnRows(rows)
				// Update Code
				mock.ExpectExec(`UPDATE "Circle" SET "inviteCode" = \$1 WHERE id = \$2`).
					WithArgs(sqlmock.AnyArg(), "circle-1").
					WillReturnResult(sqlmock.NewResult(1, 1))
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:     "Forbidden - Not Owner",
			userID:   "user-456",
			circleID: "circle-1",
			mockBehavior: func() {
				rows := sqlmock.NewRows([]string{"ownerId"}).AddRow("user-123")
				mock.ExpectQuery(`SELECT "ownerId" FROM "Circle" WHERE id = \$1`).
					WithArgs("circle-1").
					WillReturnRows(rows)
			},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:     "Not Found",
			userID:   "user-123",
			circleID: "circle-999",
			mockBehavior: func() {
				mock.ExpectQuery(`SELECT "ownerId" FROM "Circle" WHERE id = \$1`).
					WithArgs("circle-999").
					WillReturnError(errors.New("no rows"))
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("POST", "/circles/"+tt.circleID+"/regenerate", nil)

			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}

			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", tt.circleID)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.RegenerateInviteCode(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestJoinCircleByCode(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewCircleRepository(sqlxDB)
	handler := NewCircleHandler(repo)

	tests := []struct {
		name           string
		userID         string
		body           map[string]interface{}
		mockBehavior   func()
		expectedStatus int
		expectedBody   string
	}{
		{
			name:   "Success",
			userID: "user-new",
			body:   map[string]interface{}{"code": "valid-code"},
			mockBehavior: func() {
				// Get Circle Detailed
				rows := sqlmock.NewRows([]string{"id", "inviteCode", "ownerId", "owner_id", "owner_name", "owner_email", "owner_image", "member_count"}).
					AddRow("circle-1", "valid-code", "owner-1", "owner-1", "Owner Name", "owner@example.com", nil, 5)

				// Using regex to match the complex query
				mock.ExpectQuery(`SELECT c\.\*, owner\.id as owner_id`).
					WithArgs("valid-code").
					WillReturnRows(rows)

				// Check Member (Not member)
				countRows := sqlmock.NewRows([]string{"count"}).AddRow(0)
				mock.ExpectQuery(`SELECT count\(\*\) FROM "CircleMember"`).
					WithArgs("circle-1", "user-new").
					WillReturnRows(countRows)

				// Add Member
				mock.ExpectExec(`INSERT INTO "CircleMember"`).
					WithArgs(sqlmock.AnyArg(), "circle-1", "user-new", "MEMBER", sqlmock.AnyArg()).
					WillReturnResult(sqlmock.NewResult(1, 1))
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `"success":true`,
		},
		{
			name:   "Already Member",
			userID: "user-member",
			body:   map[string]interface{}{"code": "valid-code"},
			mockBehavior: func() {
				rows := sqlmock.NewRows([]string{"id", "inviteCode", "ownerId", "owner_id", "owner_name", "owner_email", "owner_image", "member_count"}).
					AddRow("circle-1", "valid-code", "owner-1", "owner-1", "Owner Name", "owner@example.com", nil, 5)

				mock.ExpectQuery(`SELECT c\.\*, owner\.id as owner_id`).
					WithArgs("valid-code").
					WillReturnRows(rows)

				countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
				mock.ExpectQuery(`SELECT count\(\*\) FROM "CircleMember"`).
					WithArgs("circle-1", "user-member").
					WillReturnRows(countRows)
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `"alreadyMember":true`,
		},
		{
			name:   "Invalid Code",
			userID: "user-new",
			body:   map[string]interface{}{"code": "bad-code"},
			mockBehavior: func() {
				mock.ExpectQuery(`SELECT c\.\*, owner\.id as owner_id`).
					WithArgs("bad-code").
					WillReturnError(errors.New("no rows"))
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.body)
			req, _ := http.NewRequest("POST", "/circles/join", bytes.NewBuffer(body))

			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}

			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.JoinCircleByCode(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)
			if tt.expectedBody != "" {
				assert.Contains(t, rr.Body.String(), tt.expectedBody)
			}
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestDeleteCircle(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewCircleRepository(sqlxDB)
	handler := NewCircleHandler(repo)

	tests := []struct {
		name           string
		userID         string
		circleID       string
		mockBehavior   func()
		expectedStatus int
	}{
		{
			name:     "Success",
			userID:   "user-123",
			circleID: "circle-1",
			mockBehavior: func() {
				rows := sqlmock.NewRows([]string{"ownerId"}).AddRow("user-123")
				mock.ExpectQuery(`SELECT "ownerId" FROM "Circle" WHERE id = \$1`).
					WithArgs("circle-1").
					WillReturnRows(rows)
				mock.ExpectExec(`DELETE FROM "Circle" WHERE id = \$1`).
					WithArgs("circle-1").
					WillReturnResult(sqlmock.NewResult(1, 1))
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:     "Forbidden - Not Owner",
			userID:   "user-456",
			circleID: "circle-1",
			mockBehavior: func() {
				rows := sqlmock.NewRows([]string{"ownerId"}).AddRow("user-123")
				mock.ExpectQuery(`SELECT "ownerId" FROM "Circle" WHERE id = \$1`).
					WithArgs("circle-1").
					WillReturnRows(rows)
			},
			expectedStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("DELETE", "/circles/"+tt.circleID, nil)

			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}

			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", tt.circleID)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.DeleteCircle(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestListCircles(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewCircleRepository(sqlxDB)
	handler := NewCircleHandler(repo)

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
				rows := sqlmock.NewRows([]string{"id", "name", "inviteCode", "ownerId", "createdAt", "updatedAt"}).
					AddRow("circle-1", "My Circle", "code-1", "user-123", time.Now(), time.Now())
				mock.ExpectQuery(`SELECT .* FROM "Circle"`).
					WithArgs("user-123").
					WillReturnRows(rows)
			},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/circles", nil)
			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}
			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.ListCircles(rr, req)
			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("there were unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestGetCircle(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer mockDB.Close()
	sqlxDB := sqlx.NewDb(mockDB, "sqlmock")
	repo := repository.NewCircleRepository(sqlxDB)
	handler := NewCircleHandler(repo)

	tests := []struct {
		name           string
		id             string
		userID         string // Requesting user
		mockBehavior   func()
		expectedStatus int
	}{
		{
			name:   "Success",
			id:     "circle-1",
			userID: "user-member",
			mockBehavior: func() {
				// 1. Get Circle
				rowsCircle := sqlmock.NewRows([]string{"id", "name", "inviteCode", "ownerId", "createdAt", "updatedAt"}).
					AddRow("circle-1", "My Circle", "code-1", "owner-1", time.Now(), time.Now())
				mock.ExpectQuery(`SELECT \* FROM "Circle" WHERE id = \$1`).
					WithArgs("circle-1").
					WillReturnRows(rowsCircle)

				// 2. Get Owner
				rowsOwner := sqlmock.NewRows([]string{"id", "name"}).AddRow("owner-1", "Owner Name")
				mock.ExpectQuery(`SELECT \* FROM "User" WHERE id = \$1`).
					WithArgs("owner-1").
					WillReturnRows(rowsOwner)

				// 3. Get Members - MUST include requesting user (user-member) to pass auth check
				rowsMembers := sqlmock.NewRows([]string{"id", "circleId", "userId", "role", "joinedAt", "user.id", "user.name", "user.email", "user.image"}).
					AddRow("mem-1", "circle-1", "user-member", "MEMBER", time.Now(), "user-member", "Me", "me@x.com", nil)
				mock.ExpectQuery(`SELECT cm\.\*, u\.id "user\.id"`).
					WithArgs("circle-1").
					WillReturnRows(rowsMembers)

				// 4. Get Invites
				// Actually SelectContext uses struct tags. The query is simple.
				// Returning empty for simplicity
				mock.ExpectQuery(`SELECT i\.\*, .* FROM "Invite"`).
					WithArgs("circle-1").
					WillReturnRows(sqlmock.NewRows([]string{}))
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:   "Not Found",
			id:     "circle-999",
			userID: "user-123",
			mockBehavior: func() {
				mock.ExpectQuery(`SELECT \* FROM "Circle" WHERE id = \$1`).
					WithArgs("circle-999").
					WillReturnError(errors.New("no rows"))
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/circles/"+tt.id, nil)

			// Inject userID
			if tt.userID != "" {
				ctx := context.WithValue(req.Context(), auth.UserIDKey, tt.userID)
				req = req.WithContext(ctx)
			}

			// Mock Chi context URL Param using context
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", tt.id)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			tt.mockBehavior()
			rr := httptest.NewRecorder()
			handler.GetCircle(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("there were unfulfilled expectations: %s", err)
			}
		})
	}
}
