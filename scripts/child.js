var dom = {};
var prevX = 0;
var prevY = 0;
var startingColumn = null;
var error = false;
var flag = true;

Util.events(document, {
	// Final initalization entry point: the Javascript code inside this block
	// runs at the end of start-up when the DOM is ready
	"DOMContentLoaded": function() {
		dom.root = Util.one(":root");
		dom.rewards = Util.one("#rewardsBtn");
		dom.settings = Util.one("#gearBtn");
		dom.toDo = Util.one("#left")
		dom.completed = Util.one("#right")
		dom.chorePopup = Util.one("#chorePopup")
		dom.rewardsPopup = Util.one("#rewardsPopup")
		dom.settingsPopup = Util.one("#settingsPopup")
		dom.main = Util.one("#main")
		dom.childName = Util.one("#nameText");

		// set color and name defaults
		dom.childName.value = "Allie";
		fillChores();

		// settings popup
		dom.settings.addEventListener("click",
			function() {
				skipIntro()
				dom.chorePopup.style.display = "none";
				dom.rewardsPopup.style.display = "none";
				dom.settingsPopup.style.display = "flex";
				dom.main.style.opacity = "0.15";
			});

		//help sequence
		Util.one("#helpBtn").addEventListener("click",
			function() {
				skipIntro()
				if (!error) { //error = false when user does not type name
				dom.settingsPopup.style.display = "none";
				}
				dom.rewardsPopup.style.display = "none";
				dom.chorePopup.style.display = "none"
				helpSequence1()
			});

		Util.one("#next1").addEventListener("click",
			function() {
				helpSequence2()
			});

		Util.one("#next2").addEventListener("click",
			function() {
				helpSequence3()
			});

		Util.one("#next3").addEventListener("click",
			function() {
				helpSequence4()
			});

		Util.one("#next4").addEventListener("click",
			function() {
				helpSequence5()
			});

		Util.one("#skip").addEventListener("click",
			function() {
				skipIntro()
			});

		// close button for settings popup
		Util.one("#settingsPopupClose").addEventListener("click",
			function() {
				if (!error) { //error = false when user does not type name
					dom.settingsPopup.style.display = "none";
					dom.main.style.opacity = "1";
				}
			});

		// color picker within settings
		var colors = Util.all(".color")
		for (let color of colors) {
			color.addEventListener("click",
				function() {
					removeOtherBorders();
					color.classList.add("colorSelected")
					dom.root.style.setProperty('--main-background', color.style.backgroundColor);
				});
		}

		// chore popup
		var items = Util.all(".item")
		for (let item of items) {
			item.addEventListener("click",
				function() {
				skipIntro()	
				dom.rewardsPopup.style.display = "none";
				if (!error) { //error = false when user does not type name
					dom.settingsPopup.style.display = "none";
				}
				populateChorePopup(item.id);
				});
		}

		// chore popup close button
		Util.one("#chorePopupClose").addEventListener("click",
			function() {
				dom.chorePopup.style.display = "none"
				dom.main.style.opacity = "1";
			});

		// rewards popup
		dom.rewards.addEventListener("click",
			function() {
				if (!error) { //error = false when user does not type name
				dom.settingsPopup.style.display = "none";
				}
				skipIntro()
				dom.chorePopup.style.display = "none"
				dom.rewardsPopup.style.display = "flex";
				dom.main.style.opacity = "0.15";
			});

		// rewards popup close button
		Util.one("#rewardsPopupClose").addEventListener("click",
			function() {
				dom.rewardsPopup.style.display = "none";
				dom.main.style.opacity = "1";
			});

		// remind buttons within reward popup
		var reminds = Util.all(".remind")
		for (let remind of reminds) {
			remind.addEventListener("click",
				function() {
					remind.classList.remove("remind");
					remind.classList.add("reminded");
					remind.innerHTML = "Reminded!"
				});
		}


	},

	// drag and drop
	"mousedown": function(evt) {
		var elm = document.elementFromPoint(evt.clientX, evt.clientY);

		var parents = Util.all(".item");
		for (let item of parents) {
			if(item.contains(elm)) {
					item.className = "item-drag"
					prevX = evt.clientX
					prevY = evt.clientY
					document.documentElement.style.setProperty('--top', 0 + 'px')
					document.documentElement.style.setProperty('--left', 0 + 'px')
					startingColumn = item.parentElement.id;
					elm.ondragstart = function() {
						return false;
				}
			}
		}
	},

	// drag and drop
	"mousemove": function(evt) {
		var element = Util.one(".item-drag");
		if (element != null) {
			if (Math.abs(evt.clientY - prevY) > 1 || Math.abs(evt.clientX - prevX) > 1) {
				flag = false
			}
			document.documentElement.style.setProperty('--top', (evt.clientY - prevY) + 'px')
			document.documentElement.style.setProperty('--left', (evt.clientX - prevX) + 'px')
		}
	},

	// drag and drop
	"mouseup": function(evt) {
		var item = Util.one(".item-drag");
			if (item != null) {

				var box = item.children.item(item.children.length - 1);
				var column = document.elementFromPoint(evt.clientX, evt.clientY);
				if (flag) {	
					skipIntro()
					dom.rewardsPopup.style.display = "none";
					if (!error) { //error = false when user does not type name
						dom.settingsPopup.style.display = "none";
					}
					populateChorePopup(item.id)
				}
				else if (column.id == "left" && column.id != startingColumn) {
					dom.toDo.appendChild(item)
					document.documentElement.style.setProperty('--top', (0) + 'px')
					document.documentElement.style.setProperty('--left', (0) + 'px')
				}
				else if (column.id == "right" && column.id != startingColumn) {
					dom.completed.appendChild(item)
					document.documentElement.style.setProperty('--top', (0) + 'px')
					document.documentElement.style.setProperty('--left', (0) + 'px')
				}
				item.className = "item-move-back"
				var promise = Util.afterAnimation(item, "moveBack")
				promise.then(function() {
					item.className = "item";
					flag = true;
				})

			}
	},

	// dynamically change user's name when they change it in settings popup
	"keyup": function(evt) {
		Util.one("#welcome").innerHTML = "Hi, "+dom.childName.value+"!"
		// alert the user to an error if they delete entire name
		if (dom.childName.value.length == 0) {
			dom.childName.classList = "error";
		}
		error = dom.childName.value.length == 0;
		if (!error) {
			dom.childName.classList = "";
		}
	},
});

function fillChores() {
	dom.toDo.appendChild(makeItem("lawn"));
	dom.toDo.appendChild(makeItem("clothes"));
	dom.toDo.appendChild(makeItem("dishes"));
	dom.toDo.appendChild(makeItem("dinner"));

	dom.completed.appendChild(makeItem("dog"));
	dom.completed.appendChild(makeItem("grandma"));
}

function makeItem(choreName) {
	var div = document.createElement("div");
	div.classList = "item";
	div.id = choreName;

	// image
	var img = document.createElement("img");
	img.src = chores[choreName].picture;
	img.classList = "itemImg"

	// chore name
	var name = document.createElement("div");
	name.innerHTML = chores[choreName].chore;
	name.classList = "choreName"

	// due date
	var duedate = document.createElement("div");
	duedate.innerHTML = chores[choreName].duedate;

	// // drag and drop img
	// var dehaze = document.createElement("i");
	// dehaze.classList = "material-icons";
	// dehaze.innerHTML = "dehaze";

	div.appendChild(img);
	div.appendChild(name);
	div.appendChild(duedate);
	// div.appendChild(dehaze)

	return div;
}

function populateChorePopup(choreName) {
	dom.chorePopup.style.display = "flex";
	dom.main.style.opacity = "0.15";

	Util.one("#choreText").innerHTML = chores[choreName].chore;
	Util.one("#dateText").innerHTML = chores[choreName].duedate;
	Util.one("#rewardText").innerHTML = chores[choreName].reward;
	Util.one("#detailsText").innerHTML = chores[choreName].details;
}

function removeOtherBorders() {
	var colors = Util.all(".color")
	for (let color of colors) {
		color.classList.remove("colorSelected")
	}
}

//onboarding functions
function helpSequence1() {
	dom.main.style.opacity = "0.15";
	var welcomePopup = document.getElementById("welcomePopup");
	welcomePopup.style.display = "flex";

	var skip = document.getElementById("skip");
	skip.style.display = "flex";
}

function helpSequence2() {
	var welcomePopup = document.getElementById("welcomePopup");
	welcomePopup.style.display = "none";

	dom.main.style.opacity = "1";
	var completedList = document.getElementById("right");
	completedList.style.opacity = "0.15";
	Util.one("#left").style.border = "2px red solid";

	var todoPopup = document.getElementById("todoPopup")
	todoPopup.style.display = "flex"
}

function helpSequence3() {
	var todoPopup = document.getElementById("todoPopup")
	todoPopup.style.display = "none"

	var completedList = document.getElementById("right");
	completedList.style.opacity = "1";
	completedList.style.border = "2px red solid";

	var todoList = document.getElementById("left");
	todoList.style.opacity = "0.15"
	todoList.style.border = "";

	var completedPopup = document.getElementById("completedPopup")
	completedPopup.style.display = "flex"
}

function helpSequence4() {
	var completedPopup = document.getElementById("completedPopup");
	completedPopup.style.display = "none";

	var completedList = document.getElementById("right");
	completedList.style.opacity = "0.15";
	completedList.style.border = "";

	dom.rewards.style.border = "2px red solid"

	var rewardsPopup = document.getElementById("rewPopup");
	rewardsPopup.style.display = "flex"
}

function helpSequence5() {
	var rewardsPopup = document.getElementById("rewPopup");
	rewardsPopup.style.display = "none"
	var completedList = document.getElementById("right");
	completedList.style.opacity = "1";
	var todoList = document.getElementById("left");
	todoList.style.opacity = "1"

	dom.rewards.style.border = ""
	var skip = document.getElementById("skip");
	skip.style.display = "none";
}

function skipIntro() {
	var welcomePopup = document.getElementById("welcomePopup");
	welcomePopup.style.display = "none";

	var todoPopup = document.getElementById("todoPopup")
	todoPopup.style.display = "none"

	var completedPopup = document.getElementById("completedPopup");
	completedPopup.style.display = "none";

	var rewardsPopup = document.getElementById("rewPopup");
	rewardsPopup.style.display = "none";

	var skip = document.getElementById("skip");
	skip.style.display = "none";

	var todoList = document.getElementById("left");
	todoList.style.opacity = "1";

	var completedList = document.getElementById("right");
	completedList.style.opacity = "1";
	completedList.style.border = ""
	todoList.style.border = "";
	dom.rewards.style.border = "";
	dom.main.style.opacity = "1";
}
