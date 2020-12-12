(function(exports) {

  /* Server to client: abort game (e.g. if second player exited the game) */
  exports.O_GAME_ABORTED = {
    type: "GAME-ABORTED"
  };
  exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);

  /* Server to client: set as player A */
  exports.T_PLAYER_TYPE = "PLAYER-TYPE";
  exports.O_PLAYER_A = {
    type: exports.T_PLAYER_TYPE,
    data: "A"
  };
  exports.S_PLAYER_A = JSON.stringify(exports.O_PLAYER_A);

  /*Server to client: set as player B*/
  exports.O_PLAYER_B = {
    type: exports.T_PLAYER_TYPE,
    data: "B"
  };
  exports.S_PLAYER_B = JSON.stringify(exports.O_PLAYER_B);

   //Set the game status
   exports.GAME_STATUS = "Game status";
   exports.STATUS = {
     type: exports.GAME_STATUS,
     data: null
   };

   //Set the game status
   exports.SELECTED_COLORS = "Selected colors";
   exports.COLORS = {
     type: exports.SELECTED_COLORS,
     id: null,
     color: null
   };

})(typeof exports === "undefined" ? (this.Messages = {}) : exports);
//if exports is undefined, we are on the client; else the server
