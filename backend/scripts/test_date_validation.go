package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

func main() {
	url := "http://localhost:8080/api/invites"

	// Create a request with a past date
	pastDate := time.Now().Add(-24 * time.Hour)
	reqBody := map[string]interface{}{
		"title":     "Past Event Test",
		"eventDate": pastDate.Format(time.RFC3339),
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	// Note: This might fail if auth is strictly enforced and no bypass is active,
	// but the handler should check title/date BEFORE auth in some cases,
	// or we'll get a 401 which is also fine for checking if it reached the handler logic.
	// Actually, the middleware runs first in cmd/api/main.go.

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error sending request: %v\n", err)
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	fmt.Printf("Status: %d\n", resp.StatusCode)
	fmt.Printf("Response: %s\n", string(respBody))
}
