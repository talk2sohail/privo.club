package main

import (
	"crypto/sha256"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"privo-club-backend/internal/config"
	"privo-club-backend/internal/db"

	_ "github.com/lib/pq"
)

func main() {
	// Silence default log flags for cleaner output
	log.SetFlags(0)

	cfg := config.Load()
	database := db.Connect(cfg.DatabaseURL)
	defer database.Close()

	cmd := "up"
	if len(os.Args) > 1 {
		cmd = os.Args[1]
	}

	if err := ensureSchemaMigrationsTable(database.DB); err != nil {
		log.Fatalf("Failed to initialize migration system: %v", err)
	}

	switch cmd {
	case "status":
		if err := checkStatus(database.DB); err != nil {
			log.Fatalf("Status check failed: %v", err)
		}
	case "up":
		if err := runMigrations(database.DB); err != nil {
			log.Fatalf("Migration failed: %v", err)
		}
		log.Println("Migration completed successfully")
	case "down":
		if err := rollbackMigration(database.DB); err != nil {
			log.Fatalf("Rollback failed: %v", err)
		}
		log.Println("Rollback completed successfully")
	default:
		log.Fatalf("Unknown command: %s. Use 'up', 'down', or 'status'", cmd)
	}
}

func ensureSchemaMigrationsTable(db *sql.DB) error {
	// Verify if table exists and has correct schema by trying to select 'id'
	_, err := db.Exec("SELECT id FROM schema_migrations LIMIT 1")
	if err != nil {
		// Assume schema mismatch or table missing
		log.Println("Schema mismatch or missing table, resetting schema_migrations...")
		_, _ = db.Exec("DROP TABLE IF EXISTS schema_migrations")

		query := `
			CREATE TABLE IF NOT EXISTS schema_migrations (
				id SERIAL PRIMARY KEY,
				migration_name TEXT UNIQUE NOT NULL,
				checksum TEXT NOT NULL,
				started_at TIMESTAMP NOT NULL,
				finished_at TIMESTAMP,
				logs TEXT,
				rolled_back_at TIMESTAMP,
				applied_steps_count INTEGER DEFAULT 0
			);
		`
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("failed to create schema_migrations: %w", err)
		}
	}
	return nil
}

func checkStatus(db *sql.DB) error {
	rows, err := db.Query("SELECT migration_name, finished_at, rolled_back_at FROM schema_migrations ORDER BY id DESC LIMIT 5")
	if err != nil {
		return fmt.Errorf("failed to query migrations: %w", err)
	}
	defer rows.Close()

	fmt.Println("Latest migrations (most recent first):")
	fmt.Println("----------------------------------------")

	count := 0
	for rows.Next() {
		var name string
		var finishedAt *time.Time
		var rolledBackAt *time.Time
		if err := rows.Scan(&name, &finishedAt, &rolledBackAt); err != nil {
			return err
		}
		status := "Applied"
		if rolledBackAt != nil {
			status = fmt.Sprintf("Rolled back at %s", rolledBackAt.Format(time.RFC3339))
		} else if finishedAt != nil {
			status = fmt.Sprintf("Applied at %s", finishedAt.Format(time.RFC3339))
		} else {
			status = "Pending/Failed"
		}
		fmt.Printf("%s (%s)\n", name, status)
		count++
	}

	if count == 0 {
		fmt.Println("No migrations applied yet.")
	}
	return nil
}

// runMigrations applies all unapplied migrations in the "migrations" directory.
// It checks the schema_migrations table to see which migrations have already been applied.
// If a migration hasn't been applied, it runs it and records the result in the database.
func runMigrations(db *sql.DB) error {
	files, err := filepath.Glob("migrations/*.up.sql")
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	// Sort migrations alphabetically to ensure they're applied in order
	sort.Strings(files)

	for _, file := range files {
		filename := filepath.Base(file)
		name := strings.TrimSuffix(filename, ".up.sql")

		// Check if the migration has already been applied (and not rolled back)
		var id int
		var rolledBackAt *time.Time
		err := db.QueryRow("SELECT id, rolled_back_at FROM schema_migrations WHERE migration_name = $1", name).Scan(&id, &rolledBackAt)
		if err != nil && err != sql.ErrNoRows {
			return fmt.Errorf("failed to check status for %s: %w", name, err)
		}

		isApplied := err == nil && rolledBackAt == nil

		if !isApplied {
			log.Printf("Applying migration: %s", name)
			if err := applyMigration(db, file, name); err != nil {
				return err
			}
		}
	}

	return nil
}

func applyMigration(db *sql.DB, file, name string) error {
	content, err := os.ReadFile(file)
	if err != nil {
		return fmt.Errorf("failed to read file: %w", err)
	}

	checksum := fmt.Sprintf("%x", sha256.Sum256(content))
	startedAt := time.Now()

	// Insert record starting state
	var id int
	// Handle re-application if row exists (e.g. previously rolled back)
	// Upsert logic:
	query := `
		INSERT INTO schema_migrations (migration_name, checksum, started_at, logs, applied_steps_count, rolled_back_at, finished_at)
		VALUES ($1, $2, $3, $4, 0, NULL, NULL)
		ON CONFLICT (migration_name) DO UPDATE SET
		checksum = EXCLUDED.checksum,
		started_at = EXCLUDED.started_at,
		logs = EXCLUDED.logs,
		applied_steps_count = 0,
		rolled_back_at = NULL,
		finished_at = NULL
		RETURNING id
	`
	err = db.QueryRow(query, name, checksum, startedAt, "Starting...").Scan(&id)
	if err != nil {
		return fmt.Errorf("failed to init migration record: %w", err)
	}

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
			// Log failure
			db.Exec("UPDATE schema_migrations SET logs = $1 WHERE id = $2", fmt.Sprintf("Error: %v", err), id)
		} else {
			if commitErr := tx.Commit(); commitErr != nil {
				err = commitErr
				db.Exec("UPDATE schema_migrations SET logs = $1 WHERE id = $2", fmt.Sprintf("Commit Error: %v", err), id)
			} else {
				// Log success
				db.Exec("UPDATE schema_migrations SET finished_at = $1, logs = 'Success', applied_steps_count = 1 WHERE id = $2", time.Now(), id)
			}
		}
	}()

	if _, err = tx.Exec(string(content)); err != nil {
		return fmt.Errorf("execution failed: %w", err)
	}

	return nil
}

func rollbackMigration(db *sql.DB) error {
	var name string
	// Find last finished, not-rolled-back migration
	err := db.QueryRow("SELECT migration_name FROM schema_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY finished_at DESC LIMIT 1").Scan(&name)
	if err == sql.ErrNoRows {
		log.Println("No migrations to rollback")
		return nil
	} else if err != nil {
		return fmt.Errorf("failed to find last migration: %w", err)
	}

	log.Printf("Rolling back migration: %s", name)
	downFile := fmt.Sprintf("migrations/%s.down.sql", name)

	content, err := os.ReadFile(downFile)
	if err != nil {
		return fmt.Errorf("failed to read down file: %w", err)
	}

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		} else {
			if commitErr := tx.Commit(); commitErr != nil {
				err = commitErr
			} else {
				// Update record
				db.Exec("UPDATE schema_migrations SET rolled_back_at = $1, logs = 'Rolled back' WHERE migration_name = $2", time.Now(), name)
			}
		}
	}()

	if _, err = tx.Exec(string(content)); err != nil {
		return fmt.Errorf("execution failed: %w", err)
	}

	return nil
}
