function pkm (users_choice)
{
	var values = ["rock","paper","scissors"];
	var computers_choice = values[Math.floor(Math.random() * 3)];
	
	alert("You chose " + users_choice + ", while computer chose " + computers_choice);

    if(users_choice==computers_choice)
	{ 
      alert("It's tie");
	}
	else if(users_choice=="rock" && computers_choice=="paper")
	{
		alert("Computer won")
	}
	else if(users_choice=="rock" && computers_choice=="scissors")
	{
		alert("You won")
	}
	else if(users_choice=="paper" && computers_choice=="rock")
	{
		alert("You won")
	}
	else if(users_choice=="paper" && computers_choice=="scissors")
	{
		alert("Computer won")
	}
	else if(users_choice=="scissors" && computers_choice=="rock")
	{
		alert("Computer won")
	}
	else if(users_choice=="scissors" && computers_choice=="paper")
	{
		alert("You won")
	} else {
		alert("Invalid input.")
	}

}

function pkm2() {
	var choice = prompt('Rock, paper, scissors?');

	pkm(choice);
}