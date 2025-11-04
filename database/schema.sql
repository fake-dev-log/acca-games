-- DDL for acca-games practice program

-- -----------------------------------------------------
-- Table `game_sessions`
-- Stores metadata for each time a user plays a game.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `game_sessions` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `game_code` TEXT NOT NULL, -- 'RPS', 'SHAPE_ROTATE', 'NUMBER_PRESS', 'NBACK'
  `play_datetime` TEXT NOT NULL DEFAULT (datetime('now','localtime')), -- ISO8601 format
  `settings` TEXT -- Storing game settings as a JSON string
);

-- -----------------------------------------------------
-- Table `rps_results` (Rock, Paper, Scissors)
-- Stores results for each question in the RPS game.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `rps_results` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `session_id` INTEGER NOT NULL,
  `round` INTEGER NOT NULL,
  `question_num` INTEGER NOT NULL,
  `problem_card_holder` TEXT NOT NULL, -- 'me' or 'opponent'
  `given_card` TEXT NOT NULL, -- 'ROCK', 'PAPER', 'SCISSORS'
  `is_correct` INTEGER NOT NULL, -- 0 for false, 1 for true
  `response_time_ms` INTEGER NOT NULL,
  `player_choice` TEXT, -- 'ROCK', 'PAPER', 'SCISSORS'
  `correct_choice` TEXT NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `game_sessions` (`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `shape_rotation_results` (Shape Rotation)
-- Stores results for each question in the Shape Rotation game.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `shape_rotation_results` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `session_id` INTEGER NOT NULL,
  `round` INTEGER NOT NULL,
  `question_num` INTEGER NOT NULL,
  `is_correct` INTEGER NOT NULL, -- 0 for false, 1 for true
  `solve_time_ms` INTEGER NOT NULL,
  `click_count` INTEGER NOT NULL,
  `min_required_steps` INTEGER NOT NULL,
  `player_submission` TEXT, -- Storing player's answer sequence as a JSON string
  `correct_submission` TEXT NOT NULL, -- Storing correct answer sequence as a JSON string
  FOREIGN KEY (`session_id`) REFERENCES `game_sessions` (`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `number_pressing_results_r1`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `number_pressing_results_r1` (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    target_number INTEGER NOT NULL,
    time_taken REAL NOT NULL,
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id)
);

-- -----------------------------------------------------
-- Table `number_pressing_results_r2`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `number_pressing_results_r2` (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    double_click_numbers TEXT NOT NULL, -- Store as JSON array string
    skip_numbers TEXT NOT NULL,         -- Store as JSON array string
    player_clicks TEXT NOT NULL,        -- Store as JSON array string
    correct_clicks TEXT NOT NULL,       -- Store as JSON array string
    time_taken REAL NOT NULL,
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id)
);

-- -----------------------------------------------------
-- Table `nback_results` (Shape Sequence Memory)
-- Stores results for each question in the Shape Memory (N-Back) game.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nback_results` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `session_id` INTEGER NOT NULL,
  `round` INTEGER NOT NULL,
  `question_num` INTEGER NOT NULL,
  `is_correct` INTEGER NOT NULL, -- 0 for false, 1 for true
  `response_time_ms` INTEGER NOT NULL,
  `player_choice` TEXT, -- 'LEFT', 'RIGHT', 'SPACE'
  `correct_choice` TEXT NOT NULL, -- 'LEFT', 'RIGHT', 'SPACE'
  FOREIGN KEY (`session_id`) REFERENCES `game_sessions` (`id`) ON DELETE CASCADE
);
