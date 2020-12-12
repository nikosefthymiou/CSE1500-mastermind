/* In-memory game statistics "tracker". */

var gameStatus = {
  since: Date.now(),
  gamesInitialized: 0,
  gamesAborted: 0,
  gamesCompleted: 0,
  playersWaiting: 0
};

module.exports = gameStatus;