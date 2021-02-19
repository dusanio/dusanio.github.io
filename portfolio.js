function pkm (users_choice)
{
	var values = ["rock","paper","scissors"];
	var computers_choice = values[Math.floor(Math.random() * 3)];
	
	var result = "";

    if(users_choice==computers_choice)
	{ 
      result="It's tie";
	}
	else if(users_choice=="rock" && computers_choice=="paper")
	{
		result ="Computer won";
	}
	else if(users_choice=="rock" && computers_choice=="scissors")
	{
		result ="You won";
	}
	else if(users_choice=="paper" && computers_choice=="rock")
	{
		result ="You won";
	}
	else if(users_choice=="paper" && computers_choice=="scissors")
	{
		result ="Computer won";
	}
	else if(users_choice=="scissors" && computers_choice=="rock")
	{
		result = "Computer won";
	}
	else if(users_choice=="scissors" && computers_choice=="paper")
	{
		result ="You won";
	} else {
		alert ("Invalid input.");
	}
	alert ("You chose " + users_choice + ", while computer has chosen " + computers_choice + "." + "\n" +  result);

}

function pkm2() {
	var choice = prompt('Rock, paper, scissors?');

	pkm(choice.toLowerCase());
}