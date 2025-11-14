package types

// GameSession represents a single session of any game.
type GameSession struct {
	ID           int64     `json:"id"`
	GameCode     string    `json:"gameCode"`
	PlayDatetime CustomTime `json:"playDatetime"`
	Settings     string    `json:"settings"` // Reverted to string
}