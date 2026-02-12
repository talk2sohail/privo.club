package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL    string
	NextAuthSecret string
	Port           string
	Environment    string
	LogFilePath    string
	AllowedOrigin  string
}

func Load() *Config {
	// Load .env file if it exists (for local development)
	// We look for .env in the project root, which is one level up from backend/ usually,
	// but for simplicity we can assume it's in the current running directory or just rely on env vars.
	// Let's try to load from backend root or parent root.
	_ = godotenv.Load()          // Try loading from current dir
	_ = godotenv.Load("../.env") // Try loading from parent dir (project root)

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	secret := os.Getenv("NEXTAUTH_SECRET")
	if secret == "" {
		log.Fatal("NEXTAUTH_SECRET is not set")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	env := os.Getenv("NODE_ENV")
	if env == "" {
		env = "development"
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}

	return &Config{
		DatabaseURL:    dbURL,
		NextAuthSecret: secret,
		Port:           port,
		Environment:    env,
		LogFilePath:    os.Getenv("LOG_FILE_PATH"),
		AllowedOrigin:  allowedOrigin,
	}
}
