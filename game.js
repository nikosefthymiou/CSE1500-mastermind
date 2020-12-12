/* every game has two players, identified by their WebSocket */
var game = function(gameID) {
  this.playerA = null;
  this.playerB = null;
  this.id = gameID;
  this.gameState = "0 JOINT";
  this.gameSet = 1;
};

/* Set the status of the Game */
game.prototype.setStatus = function(w) {
    this.gameState = w;
    console.log("[STATUS] %s", this.gameState);
};

/* Get the status of the Game */
game.prototype.getStatus = function() {
  this.gameState;
};

/* Set the set of the Game */
game.prototype.setSet = function(z) {
  this.gameSet = z;
  console.log("[SET] %s", this.gameSet);
};

/* Get the set of the Game */
game.prototype.getSet = function() {
 return this.gameSet;
};

// Adds the players A and B in a new game with specific WebSocket //
game.prototype.addPlayer = function(p) {
if (this.playerA == null) {
  this.playerA = p;
  return "A";
  } else {
  this.playerB = p;
  return "B";
  }
};

// Adds the players A and B in a new game with specific WebSocket //
game.prototype.switchPlayer = function() {
  temp = this.playerA;
  this.PlayerA = this.PlayerB
  this.playerB = temp;
  };

module.exports = game;