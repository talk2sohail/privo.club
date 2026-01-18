package middleware

import (
	"io"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5/middleware"
)

// NewLogger returns a middleware that logs request details.
// It writes logs to stdout and, if provided, to the specified file.
func NewLogger(logFilePath string) func(next http.Handler) http.Handler {
	var w io.Writer = os.Stdout

	if logFilePath != "" {
		f, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			// If we can't open the log file, just warn and fall back to stdout
			slog.Error("failed to open log file", "path", logFilePath, "error", err)
		} else {
			w = io.MultiWriter(os.Stdout, f)
		}
	}

	logger := slog.New(slog.NewJSONHandler(w, nil))

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

			t1 := time.Now()
			defer func() {
				logger.Info("request completed",
					slog.String("request_id", middleware.GetReqID(r.Context())),
					slog.String("method", r.Method),
					slog.String("path", r.URL.Path),
					slog.Int("status", ww.Status()),
					slog.Int("bytes_written", ww.BytesWritten()),
					slog.Duration("duration", time.Since(t1)),
				)
			}()

			next.ServeHTTP(ww, r)
		})
	}
}
