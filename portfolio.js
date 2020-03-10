function pkm (users_choice)
{
	var values = ["rock","paper","scissors"];
	var computers_choice = values [Math.floor(Math.random() * 3)];
	

    if(users_choice=computers_choice)
	{ 
      console.log("It's tie");
	}
	else if(users_choice="rock" and computers_choice="paper")
	{
		console.log("Computer won")
	}
	else(users_choice="rock" and computers_choice="scissors")
	{
		console.log("You won")
	}
	else(users_choice="paper" and computers_choice="rock")
	{
		console.log("You won")
	}
	else(users_choice="paper" and computers_choice="scissors")
	{
		console.log("Computer won")
	}
	else(users_choice="scissors" and computers_choice="rock")
	{
		console.log("Computer won")
	}
	else(users_choice="scissors" and computers_choice="paper")
	{
		console.log("You won")
	}

}