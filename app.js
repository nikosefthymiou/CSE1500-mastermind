var express = require("express");
var http = require("http");
var websocket = require("ws");
var indexRouter = require("./routes/index");
var messages = require("./public/javascripts/messages");
var gameStatus = require("./statTracker");
var Game = require("./game");
//var port = process.argv[2];
var port = process.env.PORT || 5000;
var app = express();

//http.createServer(app).listen(3000);

app.use(express.static(__dirname + "/public"));
app.get("/play", indexRouter);
app.get("/", indexRouter);

var server = http.createServer(app);
const wss = new websocket.Server({ server });
var websockets = {}; //property: websocket, value: game

/* regularly clean up the websockets object */
setInterval(function() {
  for (let i in websockets) {
    if (Object.prototype.hasOwnProperty.call(websockets,i)) {
      let gameObj = websockets[i];
      //if the gameObj has a final status, the game is complete/aborted
      if (gameObj.finalStatus != null) {
        delete websockets[i];
      }
    }
  }
}, 50000);

var currentGame = new Game(gameStatus.gamesInitialized++);
var connectionID = 0; //each websocket receives a unique ID
wss.on("connection", function connection(ws) {
  /* two-player game: every two players are added to the same game */
  let con = ws;
  con.id = connectionID++;
  let playerType = currentGame.addPlayer(con);
  websockets[con.id] = currentGame;

  console.log(
    "Player %s placed in game %s as %s",
    con.id,
    currentGame.id,
    playerType
  );

  /* inform the client about its assigned player type */
  con.send(playerType == "A" ? messages.S_PLAYER_A : messages.S_PLAYER_B);
  
  // once we have two players a new game object is created;
  if (playerType == "B") {
    currentGame = new Game(gameStatus.gamesInitialized++);
    currentGame.setStatus("2 JOINT");
    gameStatus.playersWaiting -=1;
    } else {
    currentGame.setStatus("1 JOINT");
    gameStatus.playersWaiting +=1;
  }

  // inform the player about the status of the game
  let outgoingMsg = messages.STATUS;
  outgoingMsg.data = currentGame.gameState;
  con.send(JSON.stringify(outgoingMsg));

  //inform player A for the login of player B
  if (playerType == "B") {
    websockets[con.id].playerA.send(JSON.stringify(outgoingMsg));
  }
  
  /* message coming in from a player*/
  con.on("message", function incoming(message) {
    let oMsg = JSON.parse(message);
    let gameObj = websockets[con.id];
    let isPlayerA = gameObj.playerA == con ? true : false;

    if (oMsg.type == messages.GAME_STATUS) {
      console.log(oMsg);
      currentGame.setStatus(oMsg.data);
      // inform client about the status of the game
      let outgoingMsg = messages.STATUS;
      outgoingMsg.data = currentGame.gameState;
      if (isPlayerA) {
        gameObj.playerB.send(JSON.stringify(outgoingMsg));
      } else {
        gameObj.playerA.send(JSON.stringify(outgoingMsg));
      }
     
      //Switch roles after a game has ended
      if (currentGame.gameState == "CODE FOUND" || currentGame.gameState == "FEEDBACK_10") {
        var gs = currentGame.getSet();
        let outgoingMsgA = {type: "PLAYER-TYPE", data: "A"}
        let outgoingMsgB = {type: "PLAYER-TYPE", data: "B"}
        currentGame.setStatus("NEW GAME");
        let outgoingMsg = messages.STATUS;
        outgoingMsg.data = currentGame.gameState;
        
        // In case player 1 has sent the "code found" message (was the codeMaker)
        if (gs%2 != 0) {
          gameObj.playerB.send(JSON.stringify(outgoingMsgA));
          con.send(JSON.stringify(outgoingMsgB));
          gameObj.playerB.send(JSON.stringify(outgoingMsg));
        // In case player 2 has sent the "code found" message (was the codeMaker)
        } else {
          gameObj.playerA.send(JSON.stringify(outgoingMsgA));
          con.send(JSON.stringify(outgoingMsgB));
          gameObj.playerA.send(JSON.stringify(outgoingMsg));
        }
        currentGame.setSet(gs += 1);
      }

      // Passes the color codes selected by players
    } else if (oMsg.type == messages.SELECTED_COLORS) {
      let outgoingMsg = messages.COLORS;
      outgoingMsg.id = oMsg.id;
      outgoingMsg.color = oMsg.color;
      if (isPlayerA) {
        gameObj.playerB.send(JSON.stringify(outgoingMsg));
      }  else  { 
        gameObj.playerA.send(JSON.stringify(outgoingMsg));
      }
    }
  });

  con.on("close", function(code) {
    console.log(con.id + " disconnected ...");

    if (code == "1001") {
      let gameObj = websockets[con.id];
      console.log(code);
      if (gameObj.gameState = "ABORTED") {
        gameObj.setStatus("ABORTED");
        gameStatus.gamesAborted++;
        /* determine whose connection remains open; close it */
        try {
          gameObj.playerA.close();
          gameObj.playerA = null;
        } catch (e) {
          console.log("Player A closing: "); //+ e);
        }
        try {
          gameObj.playerB.close();
          gameObj.playerB = null;
        } catch (e) {
          console.log("Player B closing: "); //+ e);
        }
      }
    }
  });
});
server.listen(port);