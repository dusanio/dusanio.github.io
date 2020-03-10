function pkm (users_choice)
{
	var values = ["rock","paper","scissors"];
	var computers_choice = values[Math.floor(Math.random() * 3)];
	
	console.log("You chose " + users_choice + ", while computer chose " + computers_choice);

    if(users_choice==computers_choice)
	{ 
      console.log("It's tie");
	}
	else if(users_choice=="rock" && computers_choice=="paper")
	{
		console.log("Computer won")
	}
	else if(users_choice=="rock" && computers_choice=="scissors")
	{
		console.log("You won")
	}
	else if(users_choice=="paper" && computers_choice=="rock")
	{
		console.log("You won")
	}
	else if(users_choice=="paper" && computers_choice=="scissors")
	{
		console.log("Computer won")
	}
	else if(users_choice=="scissors" && computers_choice=="rock")
	{
		console.log("Computer won")
	}
	else if(users_choice=="scissors" && computers_choice=="paper")
	{
		console.log("You won")
	}

}