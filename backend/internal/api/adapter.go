package api

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

// Handler is a function that returns an error
type Handler func(w http.ResponseWriter, r *http.Request) error

// ServeHTTP implements the http.Handler interface for Handler
func (fn Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Set Content-Type to application/json for all API responses
	w.Header().Set("Content-Type", "application/json")

	if err := fn(w, r); err != nil {
		// Default to 500
		code := http.StatusInternalServerError
		message := "Internal Server Error"

		// Check if it's an AppError

		if appErr, ok := err.(*AppError); ok {
			code = appErr.Code
			message = appErr.Message

			// Log the internal error details if present
			if appErr.Cause != nil {
				slog.Error("Request failed",
					"path", r.URL.Path,
					"status", code,
					"message", message,
					"error", appErr.Cause,
				)
			} else {
				// Log just the message if no internal error
				slog.Warn("Request failed",
					"path", r.URL.Path,
					"status", code,
					"message", message,
				)
			}
		} else {
			// Unknown error type, log it fully
			slog.Error("Request failed with unknown error",
				"path", r.URL.Path,
				"error", err,
			)
		}

		// Send JSON response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(code)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error": message,
		})
	}
}
