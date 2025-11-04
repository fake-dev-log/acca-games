package types

// GameSession stores metadata for each time a user plays a game.
type GameSession struct {
	ID           int64  `json:"id"`
	GameCode     string `json:"gameCode"`
	PlayDatetime string `json:"playDatetime"`
	Settings     string `json:"settings"`
}
