package auth

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"privo-club-backend/internal/config"

	"github.com/go-jose/go-jose/v3/jwt"
)

type contextKey string

const UserIDKey contextKey = "userID"

// Middleware verifies the NextAuth session token (JWS)
func Middleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 1. Get Token from Header or Cookie
			authHeader := r.Header.Get("Authorization")
			tokenString := ""

			if authHeader != "" {
				parts := strings.Split(authHeader, " ")
				if len(parts) == 2 && parts[0] == "Bearer" {
					tokenString = parts[1]
				}
			} else {
				// Try reading cookie from a list of possible names
				possibleCookieNames := []string{
					"__Secure-authjs.session-token",
					"authjs.session-token",
					"__Secure-next-auth.session-token",
					"next-auth.session-token",
				}

				for _, name := range possibleCookieNames {
					c, err := r.Cookie(name)
					if err == nil && c.Value != "" {
						tokenString = c.Value
						break
					}
				}
			}

			if tokenString == "" {
				http.Error(w, "Unauthorized: No token provided", http.StatusUnauthorized)
				return
			}

			// 2. Dev Token Bypass
			if cfg.Environment == "development" && tokenString == "dev-token" {
				log.Println("Auth: Using Dev Token Bypass")
				// Set a fixed dev user ID
				ctx := context.WithValue(r.Context(), UserIDKey, "dev-user-id")
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

			// 3. Parse Signed Token (JWS)
			tok, err := jwt.ParseSigned(tokenString)
			if err != nil {
				log.Printf("Auth Error: Invalid token format: %v", err)
				http.Error(w, "Unauthorized: Invalid token format", http.StatusUnauthorized)
				return
			}

			// 4. Verify Signature & Extract Claims
			var claims map[string]interface{}
			// We use the NextAuth Secret as the HMAC key
			if err := tok.Claims([]byte(cfg.NextAuthSecret), &claims); err != nil {
				log.Printf("Auth Error: Invalid signature: %v", err)
				http.Error(w, "Unauthorized: Invalid token signature", http.StatusUnauthorized)
				return
			}

			// 5. Extract User ID
			// Standard JWT 'sub' claim
			sub, ok := claims["sub"].(string)
			if !ok || sub == "" {
				log.Printf("Auth Error: No 'sub' claim in token")
				http.Error(w, "Unauthorized: Invalid token content", http.StatusUnauthorized)
				return
			}

			// 6. Check Expiration
			if exp, ok := claims["exp"].(float64); ok {
				if int64(exp) < time.Now().Unix() {
					log.Printf("Auth Error: Token expired")
					http.Error(w, "Unauthorized: Token expired", http.StatusUnauthorized)
					return
				}
			}

			// Success
			ctx := context.WithValue(r.Context(), UserIDKey, sub)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// UserIDFromContext helper
func UserIDFromContext(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(UserIDKey).(string)
	return id, ok
}
