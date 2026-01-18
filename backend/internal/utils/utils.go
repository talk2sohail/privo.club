package utils

import (
	"crypto/rand"
	"math/big"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// GenerateRandomString returns a secure random string of the given length.
func GenerateRandomString(n int) string {
	b := make([]byte, n)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			// In the rare case of an error, fallback to a pseudo-random replacement or panic.
			// Since this is for ID generation, panic is better than collision.
			panic(err)
		}
		b[i] = charset[num.Int64()]
	}
	return string(b)
}

// GenerateID returns a secure random ID with a prefix.
func GenerateID(prefix string) string {
	return prefix + "-" + GenerateRandomString(12)
}
