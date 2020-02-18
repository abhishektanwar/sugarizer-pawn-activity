define(["sugar-web/activity/activity", "sugar-web/env","sugar-web/graphics/icon", "webL10n","sugar-web/graphics/presencepalette"], function (activity, env, icon, webL10n, presencepalette) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		ar isHost=false;
		// Welcome user
		var currentenv;
		env.getEnvironment(function(err, environment) {
			currentenv=environment;
			//set current language to sugarizer
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			webL10n.language.code = language;
			document.getElementById("user").innerHTML = "<h1>"+webL10n.get("Hello",{name:currentenv.user.name})+" !</h1>";
			// Load from datastore
			if(environment.objectId){
				console.log("existing interface.");
				activity.getDatastoreObject().loadAsText(function(error, meatadata, data){
					if(error == null && data != null){
						console.log("ok");
						pawns=JSON.parse(data);
						drawPawns();
					}
				});
			}else{
					console.log("new instance");
				
			}
			if (environment.sharedId){
				console.log("shared instance");
				presence = activity.getPresenceObject(function(error,network){
					network.onDataReceived(onNetworkDataReceived);
					network.onSharedActivityUserChanged(onNetworkUserChanged);
				});
			}
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
		// var jsonPawnData=JSON.stringify(pawns);
		// activity.getDataStoreObject().setDataAsText(jsonPawnData);
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
			document.getElementById("user").innerHTML="<h1>"+webL10n.get("Played",{name:currentenv.user.name})+"!</h1>";
			if(presence){
				presence.sendMessage(presence.getSharedInfo().id,{
					user : presence.getUserInfo(),
					content : {
						action:'update',
						data : currentenv.user.colorvalue
					}
				});
			}
		});

		document.getElementById("stop-button").addEventListener('click', function (event) {
			console.log("writing...");
			var jsonPawnData = JSON.stringify(pawns);
			activity.getDatastoreObject().setDataAsText(jsonPawnData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		});
		window.addEventListener("localized",function(){
			document.getElementById("user").innerHTML = "<h1>"+webL10n.get("Hello", {name:currentenv.user.name})+"</h1>";
			document.getElementById("add-button").title = webL10n.get("AddPawn");
		});
		
		var presence = null;
		var palette = new presencepalette.PresencePalette(document.getElementById("network-button"),undefined);
		palette.addEventListener('shared',function(){
			palette.popDown();
			console.log("want to share");
			presence = activity.getPresenceObject(function(error, network){
				if(error){
					console.log("Sharing error");
					return;
				}
				network.createSharedActivity('org.sugarlabs.Pawn',function(groupId){
					console.log("ACtivity shared");
					isHost = true;
				});
				network.onDataReceived(onNetworkDataReceived);
				network.onSharedActivityUserChanged(onNetworkUserChanged);
			});
		});
		
		var onNetworkDataReceived = function(msg){
			if(presence.getUserInfo.networkId === msg.user.networkId){
				return;
			}
			switch(msg.content.action){
				case 'init':
					pawns = msg.content.data;
					drawPawns();
					break;
				case 'update':
					pawns.push(msg.content.data);
					drawPawns();
					document.getElementById("user").innerHTML="<h1>"+webL10n.get("Played",{name:msg.user.name})+"</h1>"		
					break;
			}
		}
		
		var onNetworkUserChanged = function(msg){
			if(isHost) {
				presence.sendMessage(presence.getSharedInfo.id, {
					user:presence.getUserInfo(),
					content:{
						action:'init',
						data:pawn
					}
				});
			}
			console.log("User "+msg.user.name +" "+(msg.move==1 ?"join":"left"));
		};



	});
});
