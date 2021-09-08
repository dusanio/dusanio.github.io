function pkm(users_choice) {
  var values = ["rock", "paper", "scissors"];
  var computers_choice = values[Math.floor(Math.random() * 3)];

  var result = "";

  if (users_choice == computers_choice) {
    result = "It's tie";
  } else if (users_choice == "rock" && computers_choice == "paper") {
    result = "Computer won";
  } else if (users_choice == "rock" && computers_choice == "scissors") {
    result = "You won";
  } else if (users_choice == "paper" && computers_choice == "rock") {
    result = "You won";
  } else if (users_choice == "paper" && computers_choice == "scissors") {
    result = "Computer won";
  } else if (users_choice == "scissors" && computers_choice == "rock") {
    result = "Computer won";
  } else if (users_choice == "scissors" && computers_choice == "paper") {
    result = "You won";
  } else {
    alert("Uhm... ? Your input is invalid, try again with a different input.");
    return;
  }
  alert(
    "You chose " +
      users_choice +
      ", while computer has chosen " +
      computers_choice +
      "." +
      "\n" +
      result
  );
}

function pkm2() {
  var choice = prompt("Rock, paper, scissors?");

  pkm(choice.toLowerCase());
}

function rollTheDice() {
  var dice1 = Math.floor(Math.random() * 6) + 1;
  var dice2 = Math.floor(Math.random() * 6) + 1;
  var dice3 = Math.floor(Math.random() * 6) + 1;
  var dice4 = Math.floor(Math.random() * 6) + 1;
  var users_sum = dice1 + dice2;
  var computers_sum = dice3 + dice4;
  if (users_sum > computers_sum) {
    alert(
      `Your dices are ${dice1} and ${dice2}, while computers dices are ${dice3} and ${dice4}`
    );
    alert(`You won because ${users_sum} is more than ${computers_sum}`);
  } else if (computers_sum > users_sum) {
    alert(
      `Your dices are ${dice1} and ${dice2}, while computers dices are ${dice3} and ${dice4}`
    );
    alert(`You lost because ${users_sum} is less than ${computers_sum}`);
  } else {
    alert("No winner, it's tie. Try again!");
  }
}
