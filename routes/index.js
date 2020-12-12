var express = require("express");
var router = express.Router();
var app = express();
var gameStatus = require("../statTracker")
app.set('view engine', 'ejs');

/* Route to home page*/
router.get('/', (req, res) => {
 res.render("Splash.ejs", {
   gamesInitialized: gameStatus.gamesInitialized - 1, gamesAborted: gameStatus.gamesAborted,
   playersWaiting: gameStatus.playersWaiting
  }); 
});

/* Pressing the 'PLAY' button, returns this page */
router.get("/play", function(req, res) {
  res.sendFile("game.html", { root: "./public" });
});

module.exports = router;




