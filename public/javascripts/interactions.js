var gs;
var socket;
var player1points = 0;
var player2points = 0;
var games = 0;

/* Functions used in this module state */
function GameState(socket) {
  this.playerType = null;
  this.GameState = 0;
 
  this.getPlayerType = function() {
    return this.playerType;
  };

  this.setPlayerType = function(p) {
    this.playerType = p;
  };

  this.getGameStatus = function() {
    return this.GameState;
  };

  this.setGameStatus = function(p) {
    this.GameState = p;
  };
}

function addPoints() {
  if (games%2 != 0) {
    player1points += 1;
    document.getElementById("_label-score-2").innerHTML = "Player 1 points: " + player1points;
  } else {
    player2points += 1;
    document.getElementById("_label-score-3").innerHTML = "Player 2 points: " + player2points;
  }
}

/* Reset the color pallete */
function initializePallete(doc) {
  doc.getElementById("_c-1").style.background = "white";
  doc.getElementById("_c-2").style.background = "black";
  doc.getElementById("_c-3").style.background = "green";
  doc.getElementById("_c-4").style.background = "yellow";
  doc.getElementById("_c-5").style.background = "cyan";
  doc.getElementById("_c-6").style.background = "magenta";
  doc.getElementById("_c-7").style.background = "blue";
  doc.getElementById("_c-8").style.background = "red";
  doc.getElementById("_c-9").style.background = "Orange"; 
}

// Reset UI 
function resetScreen() {
  $(document.getElementsByClassName("small-cycle")).css("background-color", "rgba(0, 0, 0, 0)");
  $(document.getElementsByClassName("large-cycle")).css("background-color", "rgba(0, 0, 0, 0)");

  for (i = 0; i < 10; i++) {
    document.getElementsByClassName("vert-rectangle")[i].classList.remove("active-cell");
    document.getElementsByClassName("small-square")[i].classList.remove("active-cell-small");
    }
}

/* Deactivate elements already used*/
function removeActive(div_id, class_id) {
  document.getElementById(div_id).classList.remove(class_id);
}

function removeClickListener(class_id, listener) {
  const activeCells = document.querySelectorAll(class_id + " > *")
  for (const activeCell of activeCells) {
    activeCell.removeEventListener('click', listener);
  }
}

function addClickListener(class_id, listener) {
  const activeCells = document.querySelectorAll(class_id + " > *")
  for (const activeCell of activeCells) {
    activeCell.addEventListener('click', listener);
  }
}

/* CodeMaker sends feedback and set the status of the game*/
function guess(num) {
  let outgoingMsg = Messages.STATUS;
  outgoingMsg.data = "FEEDBACK_" + num;
  socket.send(JSON.stringify(outgoingMsg));
  document.getElementById("submit-button").style.display = "none"
  document.getElementsByTagName("h1")[0].innerHTML = "Wait the CodeBraker to make a guess...";
  removeClickListener(".active-cell-small", codeFeedback);
  removeActive("_square-" + num, "active-cell-small");
  colorsguessed = 0;
  addPoints();
}

/* CodeBraker sends a guess and set the status of the game*/
function feedback(num) {
  let outgoingMsg = Messages.STATUS;
  outgoingMsg.data = "GUESS_" + num;
  socket.send(JSON.stringify(outgoingMsg));
  document.getElementById("submit-button").style.display = "none"
  document.getElementsByTagName("h1")[0].innerHTML = "Wait the CodeMaker to send a feedback...";
  removeClickListener(".active-cell", codeSelect);
  removeActive("_rect-" + num, "active-cell");
  initializePallete(document);
  codeSelected = 0;
}

/* When CodeMaker receives a guess, arrange the UI to send next feedback*/
function guess_message(num) {
  document.getElementsByTagName("h1")[0].innerHTML = "Give your Feedback!!";
  document.getElementById("_square-" + num).classList.add("active-cell-small");
  addClickListener(".active-cell-small", codeFeedback);
  document.getElementById("submit-button").style.display = "initial";
  colorsguessed = 0;
}

/* When CodeBraker receives feedback, arrange the UI to send next guess */
function feedback_message(num) {
  document.getElementsByTagName("h1")[0].innerHTML = "Make your guess now !!";
  document.getElementById("_rect-" + num).classList.add("active-cell");
  addClickListener(".active-cell", codeSelect);
  addPoints();
}

/* Main function for designed interactions */
(function setup() {
  socket = new WebSocket(location.origin.replace(/^http/, 'ws'));
  gs = new GameState(socket);
 
  // Every time a message arrives ...
  socket.onmessage = function(event) {
    let incomingMsg = JSON.parse(event.data);

    //set player type: "A" or "B"
    if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
      gs.setPlayerType(incomingMsg.data);
      // for every game's turn increases the label
      document.getElementById("_label-score-1").innerHTML = "Game: " + (games += 1) + " out of 6";

      // Update UI according to the current game's stage
    } else if (incomingMsg.type == Messages.GAME_STATUS) {
      
      gs.setGameStatus(incomingMsg.data);
      console.log(incomingMsg);
      let k = location.origin;
      var audio = new Audio( k + '/sounds/chimes.wav');
      audio.play();

          // If CodeBraker have found the code
        if (gs.getGameStatus() == "CODE FOUND") {
          window.alert("You have found the code ! A new game will setup for you now.");
          document.getElementsByTagName("h1")[0].innerHTML = "Set your code now !!";
          //switch players' roles according to the game's turn
          if (games%2 != 0) {
            document.getElementsByTagName("h2")[0].innerHTML = "You are Player 2 and your role is CodeMaker";
          } else {
            document.getElementsByTagName("h2")[0].innerHTML = "You are Player 1 and your role is CodeMaker";
          }
          resetScreen();
        } else if (gs.getGameStatus() === "NEW GAME" && gs.getPlayerType() === "A") {
          document.getElementById("_rect-11").classList.add("active-cell");
          addClickListener(".active-cell", codeSelect);
          // When CodeMaker (player A) login
        } else if (gs.getGameStatus() == "1 JOINT") {
          document.getElementsByTagName("h1")[0].innerHTML = "Wait for second Player...";
          document.getElementsByTagName("h2")[0].innerHTML = "You are Player 1 and your role is CodeMaker";
          // When CodeBraker (player B) login
        } else if (gs.getGameStatus() == "2 JOINT" && gs.getPlayerType() == "A") {
          document.getElementsByTagName("h1")[0].innerHTML = "Set your code now !!";
          document.getElementById("_rect-11").classList.add("active-cell");
          addClickListener(".active-cell", codeSelect);
        } else if (gs.getGameStatus() == "2 JOINT" && gs.getPlayerType() == "B") {
          document.getElementsByTagName("h1")[0].innerHTML = "Wait the CodeMaker to set the code...";
          document.getElementsByTagName("h2")[0].innerHTML = "You are Player 2 and your role is CodeBraker";
          //Incoming Messages for CodeMaker from the CodeBraker
        } else if (gs.getGameStatus() == "GUESS_1") {
          guess_message("1");
        } else if (gs.getGameStatus() == "GUESS_2") {
          guess_message("2");
        } else if (gs.getGameStatus() == "GUESS_3") {
          guess_message("3");
        } else if (gs.getGameStatus() == "GUESS_4") {
          guess_message("4");
        } else if (gs.getGameStatus() == "GUESS_5") {
          guess_message("5");
        } else if (gs.getGameStatus() == "GUESS_6") {
          guess_message("6");
        } else if (gs.getGameStatus() == "GUESS_7") {
          guess_message("7");
        } else if (gs.getGameStatus() == "GUESS_8") {
          guess_message("8");
        } else if (gs.getGameStatus() == "GUESS_9") {
          guess_message("9");
        } else if (gs.getGameStatus() == "GUESS_10") {
          guess_message("10");
          //Incoming Messages for CodeBraker from the CodeMaker
        } else if (gs.getGameStatus() == "CODE_READY") {
          document.getElementsByTagName("h1")[0].innerHTML = "Make your guess now !!";
          document.getElementById("_rect-1").classList.add("active-cell");
          addClickListener(".active-cell", codeSelect);
        } else if (gs.getGameStatus() == "FEEDBACK_1") {
          feedback_message("2");
        } else if (gs.getGameStatus() == "FEEDBACK_2") {
          feedback_message("3");
        } else if (gs.getGameStatus() == "FEEDBACK_3") {
          feedback_message("4");
        } else if (gs.getGameStatus() == "FEEDBACK_4") {
          feedback_message("5");
        } else if (gs.getGameStatus() == "FEEDBACK_5") {
          feedback_message("6");
        } else if (gs.getGameStatus() == "FEEDBACK_6") {
          feedback_message("7");
        } else if (gs.getGameStatus() == "FEEDBACK_7") {
          feedback_message("8");
        } else if (gs.getGameStatus() == "FEEDBACK_8") {
          feedback_message("9");
        } else if (gs.getGameStatus() == "FEEDBACK_9") {
          feedback_message("10");
        } else if (gs.getGameStatus() == "FEEDBACK_10") {
          addPoints();
          window.alert("You didn't find the code ! A new game will setup for you now.");
          document.getElementsByTagName("h1")[0].innerHTML = "End of the game...";
          document.getElementsByTagName("h1")[0].innerHTML = "Set your code now !!";
          //switch players' roles according to the game's turn
          if (games%2 != 0) {
            document.getElementsByTagName("h2")[0].innerHTML = "You are Player 2 and your role is CodeMaker";
          } else {
            document.getElementsByTagName("h2")[0].innerHTML = "You are Player 1 and your role is CodeMaker";
          }
          resetScreen();
          // End of the game - CodeMaker wins
        }

    // Receive the colors being selected by the other player
    } else if (incomingMsg.type == Messages.SELECTED_COLORS) {
      $(document.getElementById(incomingMsg.id)).css("background-color", incomingMsg.color);
    }
  };

  socket.onopen = function() {
    socket.send("{}");
  };

  //server sends a close event only if the game was aborted from some side
  socket.onclose = function() {
    window.alert("The other player has left the game! Please close your browser.");
    document.getElementsByTagName("h1")[0].innerHTML = "The game has been abandoned!";
    document.getElementsByTagName("h2")[0].innerHTML = "Please close the browser!";
  };
  socket.onerror = function() {};
})(); //execute immediately

/* Variables used at the following functions */
var cellid;
var initialcolor;
var codeSelected = 0;
var colorsguessed = 0;

/* CodeMaker selects a 'code peg' to update */
function codeSelect() {
  var x = event.clientX;
  var y = event.clientY;
  document.getElementById("_color-palette").style.display = "initial";
  document.getElementById("_color-palette").style.top = y-50 + "px";
  document.getElementById("_color-palette").style.left = x-110 + "px";
  cellid = this.id;
  initialcolor = $(this).css("background-color");
}

/* CodeMaker selects a color from the palette for the above code peg */
$("#_color-palette div:nth-child(n)").on("click", function () {
  var selectcolor = $(this).css("background-color");

  if (initialcolor != "rgba(0, 0, 0, 0)") {
    $(this).css("background-color", initialcolor);
  }
  else {
    $(this).css("background-color", "rgba(0, 0, 0, 0)");
  }

  $(document.getElementById(cellid)).css("background-color", selectcolor);
  document.getElementById("_color-palette").style.display = "none";

  /* Exempt from the code-making stage, player sends colors selected */
  if (gs.getGameStatus() != "2 JOINT") {
    let outgoingMsg = Messages.COLORS;
    outgoingMsg.id = cellid;
    outgoingMsg.color = selectcolor;
    socket.send(JSON.stringify(outgoingMsg));
  }

  /* A counter for showing/hiding the submit button */
  if (initialcolor == "rgba(0, 0, 0, 0)" && selectcolor != "rgba(0, 0, 0, 0)") {
    codeSelected += 1;
  } else if (initialcolor != "rgba(0, 0, 0, 0)" && selectcolor == "rgba(0, 0, 0, 0)") {
    codeSelected -= 1;
  }
  if (codeSelected == 4) {
    document.getElementById("submit-button").style.display = "initial";
  } else {
    document.getElementById("submit-button").style.display = "none";
  }
});

/* Hide the palette on mouseleave */
$("#_color-palette").on("mouseleave", function () {
  document.getElementById("_color-palette").style.display = "none";
});

/* Send to the server appropriate messages according to the game status */
$("#submit-button").on("click", function () {
  
  // In case the code found
  if (colorsguessed === 4) {
    gs.setGameStatus("CODE FOUND");
  } 

  if (gs.getGameStatus() == "CODE FOUND") {
    let outgoingMsg = Messages.STATUS;
    outgoingMsg.data = "CODE FOUND";
    socket.send(JSON.stringify(outgoingMsg));
    this.style.display = "none";
    colorsguessed = 0;
    window.alert("The code has been found! A new game will setup for you now.");
    
     //switch players' roles according to the game's turn
    if (games%2 != 0) {
      document.getElementsByTagName("h2")[0].innerHTML = "You are Player 1 and your role is CodeBraker";
    } else {
      document.getElementsByTagName("h2")[0].innerHTML = "You are Player 2 and your role is CodeBraker";
    }
    removeClickListener(".active-cell-small", codeFeedback)
    resetScreen();
    document.getElementsByTagName("h1")[0].innerHTML = "Wait the CodeMaker to set the code...";

    // When the codemaker sets the code
  } else if (gs.getGameStatus() == "2 JOINT" || gs.getGameStatus() == "NEW GAME") {
    let outgoingMsg = Messages.STATUS;
    outgoingMsg.data = "CODE_READY";
    socket.send(JSON.stringify(outgoingMsg));
    this.style.display = "none";
    document.getElementsByTagName("h1")[0].innerHTML = "Wait the CodeBraker to make a guess...";
    codeSelected = 0;
    initializePallete(document);
    //Deactivate the codemaker's code pad
    removeClickListener(".active-cell", codeSelect);
    removeActive("_rect-11", "active-cell");
    // When the codebraker sends 1st guess
  } else if (gs.getGameStatus() == "CODE_READY") {
    feedback("1");
    // When the codemaker sends 1st feedback
  } else if (gs.getGameStatus() == "GUESS_1") {
    guess("1");
  } else if (gs.getGameStatus() == "FEEDBACK_1") {
    feedback("2");
  } else if (gs.getGameStatus() == "GUESS_2") {
    guess("2");
  } else if (gs.getGameStatus() == "FEEDBACK_2") {
    feedback("3");
  } else if (gs.getGameStatus() == "GUESS_3") {
    guess("3");
  } else if (gs.getGameStatus() == "FEEDBACK_3") {
    feedback("4");
  } else if (gs.getGameStatus() == "GUESS_4") {
    guess("4");
  } else if (gs.getGameStatus() == "FEEDBACK_4") {
    feedback("5");
  } else if (gs.getGameStatus() == "GUESS_5") {
    guess("5");
  } else if (gs.getGameStatus() == "FEEDBACK_5") {
    feedback("6");
  } else if (gs.getGameStatus() == "GUESS_6") {
    guess("6");
  } else if (gs.getGameStatus() == "FEEDBACK_6") {
    feedback("7");
  } else if (gs.getGameStatus() == "GUESS_7") {
    guess("7");
  } else if (gs.getGameStatus() == "FEEDBACK_7") {
    feedback("8");
  } else if (gs.getGameStatus() == "GUESS_8") {
    guess("8");
  } else if (gs.getGameStatus() == "FEEDBACK_8") {
    feedback("9");
  } else if (gs.getGameStatus() == "GUESS_9") {
    guess("9");
  } else if (gs.getGameStatus() == "FEEDBACK_9") {
    feedback("10");
  } else if (gs.getGameStatus() == "GUESS_10") {
    guess("10");
    window.alert("A new game will be setup for you.");
    document.getElementsByTagName("h1")[0].innerHTML = "End of the game...";
    
    //switch players' roles according to the game's turn
    if (games%2 != 0) {
      document.getElementsByTagName("h2")[0].innerHTML = "You are Player 1 and your role is CodeBraker";
    } else {
      document.getElementsByTagName("h2")[0].innerHTML = "You are Player 2 and your role is CodeBraker";
    }
    resetScreen();
    document.getElementsByTagName("h1")[0].innerHTML = "Wait the CodeMaker to set the code...";
    // End of the game - CodeMaker wins
  }
});

/* CodeMaker sends feedback */
function codeFeedback() { 
  //$(".active-cell-small div:nth-child(n)").on("click", function () {
    var initialcolor = $(this).css("background-color");
    if (initialcolor === "rgba(0, 0, 0, 0)") {
      $(this).css("background-color", "rgb(255, 255, 255)"); 
    } else if (initialcolor === "rgb(255, 255, 255)") {
      $(this).css("background-color", "rgb(0, 0, 0)");
      colorsguessed += 1;
    } else {
      $(this).css("background-color", "rgba(0, 0, 0, 0)");
      colorsguessed -= 1;
    }
    let outgoingMsg = Messages.COLORS;
    outgoingMsg.id = this.id;
    outgoingMsg.color = $(this).css("background-color");
    socket.send(JSON.stringify(outgoingMsg));
}