define(["sugar-web/activity/activity", "sugar-web/env","sugar-web/graphics/icon"], function (activity, env, icon) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		// Welcome user
		var currentenv;
		env.getEnvironment(function(err, environment) {
			currentenv=environment;
			document.getElementById("user").innerHTML = "<h1>"+"Hello"+" "+environment.user.name+" !</h1>";
		
		});
		// handle add on click
		// document.getElementById("add-button").addEventListener('click',function(event){
		// 	var pawn = document.createElement("div");
		// 	pawn.className="pawn";
		// 	document.getElementById("pawns").appendChild(pawn);
		// 	icon.colorize(pawn, currentenv.user.colorvalue);
		// 	document.getElementById("user").innerHTML="<h1>"+currentenv.user.name+"played "+"!</h1>";

		// });
		var pawns = [];
		var drawPawns = function() {
			document.getElementById("pawns").innerHTML='';
			for(var i=0;i<pawns.length ;i++){
				var pawn = document.createElement("div");
				pawn.className = "pawn";
				document.getElementById("pawns").appendChild(pawn);
				icon.colorize(pawn,pawns[i]);
			}
		}
		document.getElementById("add-button").addEventListener('click',function(event){
			pawns.push(currentenv.user.colorvalue)
			drawPawns();
			document.getElementById("user").innerHTML="<h1>"+currentenv.user.name+"played !</h1>";
		});

	});
});
