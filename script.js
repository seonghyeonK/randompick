particlesJS(
	"particles-js", 
	{
		"particles":{
			"number":{
				"value":400,
				"density":{
					"enable":true,
					"value_area":800
				}
			},
			"color":{"value":"#ffffff"},
			"shape":{
				"type":"circle",
				"stroke":{
					"width":0,
					"color":"#000000"
				},
				"polygon":{
						"nb_sides":5
				},
				"image":{
					"src":"img/github.svg",
					"width":100,
					"height":100
				}
			},
			"opacity":{
				"value":0.5,
				"random":true,
				"anim":{
					"enable":false,
					"speed":1,
					"opacity_min":0.1,
					"sync":false
				}
			},
			"size":{
				"value":3,
				"random":true,
				"anim":{
					"enable":false,
					"speed":40,
					"size_min":0.1,
					"sync":false
				}
			},
			"line_linked":{
				"enable":false,
				"distance":150,
				"color":"#ffffff",
				"opacity":0.4,
				"width":1
			},
			"move":{
				"enable":true,
				"speed":6,
				"direction":"none",
				"random":false,
				"straight":false,
				"out_mode":"out",
				"bounce":false,
				"attract":{
					"enable":false,
					"rotateX":600,
					"rotateY":1200
				}
			}
		},
		"interactivity":{
			"detect_on":"window",
			"events":{
				"onhover":{
					"enable":false,
					"mode":"grab"
				},
				"onclick":{
					"enable":true,
					"mode":"repulse"
				},
				"resize":true
			},
			"modes":{
				"grab":{
					"distance":400,
					"line_linked":{"opacity":1}
				},
				"bubble":{
					"distance":400,
					"size":40,
					"duration":2,
					"opacity":8,
					"speed":3
				},
				"repulse":{
					"distance":200,
					"duration":0.4
				},
				"push":{"particles_nb":4},
				"remove":{"particles_nb":2}
			}
		},
		"retina_detect":true
	}
);

Storage.prototype.setObject = function(key, value) {
	this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
		return JSON.parse(this.getItem(key));
}

$(function () {
	'use strict'

	var offcanvas = $('[data-toggle="offcanvas"]'),
	offcanvas_collapse = $('.offcanvas-collapse');
	offcanvas.on('click', function () {
		offcanvas_collapse.toggleClass('open')
	});
	$("#preset_ox").click(function(){
		pick.text("O・X");
		options = ["O", "X"];
		offcanvas_collapse.removeClass("open");
		pick.addClass("blinking");
		selectedset = "#preset_ox";
		localStorage.setObject("selectedset", selectedset);
	});

	var pick = $("#pick"),
	optionInput = $("#optionInput"),
	inputList = $("#inputList"),
	setNameInput = $("#setNameInput"),
	createUserset = $("#createUserset"),
	usersetMenuList = $("#usersetMenuList"),
	createModal = $("#createModal"),
	retry = $("#retry"),
	numberRangeRegExp = new RegExp("^(\\d+)(:::)(\\d+)$"),
	usersetTmp = {},
	options = [];

	var userset = localStorage.getObject("userset"),
	selectedset = localStorage.getObject("selectedset");
	if (!userset) {
		userset = [];
		localStorage.setObject("userset", userset);
	} else {
		userset.forEach(appendUsersetMenuList);
	}
	if (!selectedset) {
		selectedset = "#preset_ox";
		localStorage.setObject("selectedset", selectedset);
	}
	$(selectedset).trigger("click");

	pick.mousedown(function () {
		$(this).addClass('shake-vertical')
		.animate({fontSize: "2.5rem"}, 100);
	}).mouseup(function () {
		$(this).animate({fontSize: ".1rem"}, 150, function () {
			if (options.length <= 2) {
				retry.css('visibility','visible').hide().fadeIn("slow");
			} else {
				retry.css('visibility','hidden');
			}
			$(this).css({fontSize: "3rem"})
			.removeClass('shake-vertical blinking')
			.text(function () {
				//options[Math.floor((Math.random() * options.length))]
				options = shuffle(options);
				return options.pop();
			});
		});
	});

	retry.click(function () {
		retry.css('visibility','hidden');
		$(selectedset).trigger("click");
	});

	optionInput.keydown(function (key) {
		if (key.keyCode == 13) {
			var badgeTxt = $.trim($(this).val());
			var match = numberRangeRegExp.exec(badgeTxt);
			if (match != null) {
				var largerNum, smallerNum;
				if (match[1] < match[3]) {
					largerNum = match[3];
					smallerNum = match[1];
				} else {
					largerNum = match[1];
					smallerNum = match[3];
				}
				for (let i = smallerNum; i <= largerNum; i++) {
					insertBadge(i);
				}
			} else {
				insertBadge(badgeTxt);
			}
			$(this).val("");
			validCreateUserset();
		}
	});

	setNameInput.on("change paste keyup", function() {
		validCreateUserset();
	});

	function insertBadge(badgeTxt) {
		inputList.append($('<a />', {
			href: "#",
			class: "optionBadge badge badge-light",
			text: badgeTxt
		}).on({
			"click" : function () { $(this).remove(); validCreateUserset(); },
			"mouseenter" : function () { $(this).css({"text-decoration-line": "line-through"}); },
			"mouseleave" : function () { $(this).css({"text-decoration-line": "none"}); }
		})).append(" ");
	}

	function validCreateUserset() {
		var nameInputVal = $.trim(setNameInput.val());
		var optionBadges = [];
		inputList.find(".optionBadge").each(function () {
			optionBadges.push($(this).text());
		});
		if (nameInputVal.length > 0 && optionBadges.length >= 2) {
			createUserset.prop("disabled" , false);
			usersetTmp = {
				name: nameInputVal,
				options: optionBadges
			};
		} else {
			createUserset.prop("disabled" , true);
		}
	}

	createUserset.click(function () {
		userset = localStorage.getObject("userset");
		userset.push(usersetTmp);
		localStorage.setObject("userset", userset);

		usersetMenuList.empty();
		userset.forEach(appendUsersetMenuList);
		$("#userset_" + (userset.length-1)).trigger("click");
		pick.addClass("blinking");

		createModal.modal("hide");
		setNameInput.val("");
		optionInput.val("");
		inputList.empty();
		offcanvas_collapse.removeClass("open");
	});

	function appendUsersetMenuList(element, index, array) {
		usersetMenuList
		.append($('<a />', {
			id: "userset_" + index,
			href: "#",
			class: "dropdown-item",
			text: element.name,
			"data-options": element.options
		})
		.click(function(){
			pick.text(element.name);
			localStorage.setObject("selectedset", "#userset_" + index);
			selectedset = localStorage.getObject("selectedset"),
			options = $(this).data("options").split(",");
			pick.addClass("blinking");
			offcanvas_collapse.removeClass("open");
		}));
	}

	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

})
