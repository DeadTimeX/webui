/*
 *
 *     Copyright 2007 BitTorrent, Inc. All rights reserved.
 *     Copyright 2008 Carsten Niebuhr
 *
*/

var perSec = "/s";

function setupUI() {
	loadLangStrings();

	var col = function(text, type, disabled, align) {
		return {
			"text": text,
			"type": type || TYPE_STRING,
			"align": align || ALIGN_AUTO,
			"disabled": !!disabled
		};
	};

	var colMask = utWebUI.config.trtCols;
	var useProgress = (isGuest || utWebUI.settings["gui.graphic_progress"]);
	utWebUI.trtTable.create("List", [
			col(lang[CONST.OV_COL_NAME], TYPE_STRING, colMask & 0x0001),
			col(lang[CONST.OV_COL_STATUS], TYPE_STRING, colMask & 0x0002),
			col(lang[CONST.OV_COL_SIZE], TYPE_NUMBER, colMask & 0x0004),
			col(lang[CONST.OV_COL_DONE], (useProgress ? TYPE_NUM_PROGRESS : TYPE_NUMBER), colMask & 0x0008),
			col(lang[CONST.OV_COL_DOWNLOADED], TYPE_NUMBER, colMask & 0x0010),
			col(lang[CONST.OV_COL_UPPED], TYPE_NUMBER, colMask & 0x0020),
			col(lang[CONST.OV_COL_SHARED], TYPE_NUMBER, colMask & 0x0040),
			col(lang[CONST.OV_COL_DOWNSPD], TYPE_NUMBER, colMask & 0x0080),
			col(lang[CONST.OV_COL_UPSPD], TYPE_NUMBER, colMask & 0x0100),
			col(lang[CONST.OV_COL_ETA], TYPE_NUM_ORDER, colMask & 0x0200),
			col(lang[CONST.OV_COL_LABEL], TYPE_STRING, colMask & 0x0400),
			col(lang[CONST.OV_COL_PEERS], TYPE_NUMBER, colMask & 0x0800),
			col(lang[CONST.OV_COL_SEEDS], TYPE_NUMBER, colMask & 0x1000),
			col(lang[CONST.OV_COL_AVAIL].split("||")[1], TYPE_NUMBER, colMask & 0x2000),
			col(lang[CONST.OV_COL_ORDER], TYPE_NUM_ORDER, colMask & 0x4000),
			col(lang[CONST.OV_COL_REMAINING], TYPE_NUMBER, colMask & 0x8000)
		], $extend({
		"format": function(values, index) {
			var len = values.length;
			if (isNaN(index))
				index = 0;
			for (var i = 0; i < len; i++) {
				switch (index) {
				case 0:
				case 1:
				case 10:
				case 11:
				case 12:
					break;

				case 2: // size
					values[i]  = values[i].toFileSize(2);
					break;

				case 3: // done
					values[i] = (values[i] / 10).toFixed(1) + "%";
					break;

				case 4: // downloaded
					values[i] = values[i].toFileSize();
					break;

				case 5: // uploaded
					values[i] = values[i].toFileSize();
					break;

				case 6: // ratio
					values[i] = (values[i] == -1) ? "\u221E" : (values[i] / 1000).toFixed(3);
					break;

				case 7: // download speed
					values[i] = (values[i] >= 103) ? (values[i].toFileSize() + perSec) : "";
					break;

				case 8: // upload speed
					values[i] = (values[i] >= 103) ? (values[i].toFileSize() + perSec) : "";
					break;

				case 9: // ETA
					values[i] = (values[i] == 0) ? "" :
								(values[i] == -1) ? "\u221E" : values[i].toTimeString();
					break;

				case 13: // availability
					values[i] = (values[i] / 65536).toFixed(3);
					break;

				case 14: // queue position
					values[i] = (values[i] <= -1) ? "*" : values[i];
					break;

				case 15: // remaining
					values[i] = values[i].toFileSize(2);
					break;
				}
				index++;
			}
			return values;
		},
		"onDelete": utWebUI.remove.bind(utWebUI),
		"onColResize": utWebUI.trtColResize.bind(utWebUI),
		"onColMove": utWebUI.trtColMove.bind(utWebUI),
		"onColToggle": utWebUI.trtColToggle.bind(utWebUI),
		"onSort": utWebUI.trtSort.bind(utWebUI),
		"onSelect": utWebUI.trtSelect.bind(utWebUI),
		"onDblClick": utWebUI.trtDblClk.bind(utWebUI)
	}, utWebUI.config.torrentTable));

	if (!isGuest) {
		colMask = utWebUI.config.flsCols;
		utWebUI.flsTable.create("FileList", [
				col(lang[CONST.FI_COL_NAME], TYPE_STRING, colMask & 0x01),
				col(lang[CONST.FI_COL_SIZE], TYPE_NUMBER, colMask & 0x02),
				col(lang[CONST.FI_COL_DONE], TYPE_NUMBER, colMask & 0x04),
				col(lang[CONST.FI_COL_PCT], (useProgress ? TYPE_NUM_PROGRESS : TYPE_NUMBER), colMask & 0x08),
				col(lang[CONST.FI_COL_PRIO], TYPE_NUMBER, colMask & 0x10)
			], $extend({
			"format": function(values, index) {
				var len = values.length;
				if (isNaN(index))
					index = 0;
				for (var i = 0; i < len; i++) {
					switch (index) {
					case 0:
						break;

					case 1:
						values[i] = values[i].toFileSize(2); //size
						break;

					case 2:
						values[i] = values[i].toFileSize(2); //done
						break

					case 3:
						values[i] = values[i] + "%"; //%
						break;

					case 4:
						values[i] = lang[CONST["FI_PRI" + values[i]]];
					}
					index++;
				}
				return values;
			},
			"onColResize": utWebUI.flsColResize.bind(utWebUI),
			"onColMove": utWebUI.flsColMove.bind(utWebUI),
			"onColToggle": utWebUI.flsColToggle.bind(utWebUI),
			"onSort": utWebUI.flsSort.bind(utWebUI),
			"onSelect": utWebUI.flsSelect.bind(utWebUI),
			"onRefresh": function() { if (this.torrentID != "") utWebUI.getFiles(utWebUI.torrentID, true); },
			"onDblClick": utWebUI.flsDblClk.bind(utWebUI),
			"refreshable": true
		}, utWebUI.config.fileTable));
		utWebUI.flsTable.loadObj.hide();
	}

	resizeUI();

	["_all_", "_dls_", "_com_", "_act_", "_iac_", "_nlb_"].each(function(k) {
		$(k).addEvent("click", function() {
			utWebUI.switchLabel(this);
		});
	});

	if (isGuest) return;

	$("query").addEvent("keydown", function(ev) {
		if (ev.code == 13)
			Search();
	});

	new Drag("HDivider", {
		"modifiers": {"x": "left", "y": ""},
		"onComplete": function() {
			(function () {
				resizeUI(this.value.now.x, null);
				if (Browser.Engine.presto)
					utWebUI.saveConfig(true);
			}).delay(20, this);
		}
	});
	new Drag("VDivider", {
		"modifiers": {"x": "", "y": "top"},
		"onComplete": function() {
			(function () {
				resizeUI(null, this.value.now.y);
				if (Browser.Engine.presto)
					utWebUI.saveConfig(true);
			}).delay(20, this);
		}
	});
}

function checkProxySettings() {

	var auth = $("proxy.auth").checked;
	var v = $("proxy.type").get("value").toInt() || 0;

	switch (v) {
		case 1: // Socks4
			if (auth) {
				$("proxy.password").disabled = true;
				$("proxy.password").addClass("disabled");
				$("DLG_SETTINGS_4_CONN_18").addClass("disabled");
			}

			break;
	}

}

function checkUpload(frm) {
	var filename = $("torrent_file").get("value");
	if (!filename.test(/\.torrent$/)) {
		alert("The file has to be a torrent file.");
		return false;
	}
	$("ADD_FILE_OK").disabled = true;
	return true;
}

function Search() {
	window.open(searchList[searchActive][1] + "" + $("query").get("value"), "_blank");
}

var searchList = [
	["Mininova", "http://www.mininova.org/search/?utorrent&search="],
	["BitTorrent", "http://search.bittorrent.com/search.jsp?Submit2=Search&query="],
	["The Pirate Bay", "http://thepiratebay.org/search.php?q="],
	["TorrentSpy", "http://torrentspy.com/search.asp?query="],
	["IsoHunt", "http://isohunt.com/torrents.php?ext=&op=and&ihq="],
	["PointBlank", "http://bt.point-blank.cc/?search="],
	["orb_bt", "http://www.orbdesign.net/bt/results.php?sitefilter=1&query="],
	[],
	["Google", "http://google.com/search?q="]
];

var searchActive = 0;

function searchSet(index) {
	searchActive = index;
	$("query").focus();
}

/*
var fldNodes = [];
var LI = new Element('li');
var TreeNode = new Class({

	"Implements": [Options, Events],
	"options": {
		"text": "",
		"div": null,
		"expandable": false
	},
	"selected": null,
	"element": null,
	"children": [],
	"parent": null,
	"root": null,
	"head": false,
	"level": -1,
	"open": false,

	"initialize": function(options, parent) {
		this.setOptions(options);
		this.parent = parent;
		if (!this.parent) {
			this.element = new Element("div");
			this.parent = $(this.options.div).adopt(this.element);
			this.head = true;
		} else {
			this.level = this.parent.level + 1;
			var $me = this;
			this.element = new Element("a").set({
				"events": {
					"click": function(ev) {
						ev.stop();
						$me.setSelected();
						$me.open = !$me.open;
						var toggle = function(node) {
							if (!node.children) return;
							node.children.each(function(ch) {
								ch.element[(ch.parent.open && $me.open) ? "show" : "hide"]();
								toggle(ch);
							});
						};
						toggle($me);
						if ($me.options.expandable)
							$me.element.setStyle("backgroundImage", "url(\"" + ($me.open ? "./icons/bullet_toggle_minus.png" : "./icons/bullet_toggle_plus.png") + "\")");
						$me.fireEvent("onClick", $me);
					}
				},
				"styles": {
					"paddingLeft": this.level * 20 + 20,
					"backgroundImage": "url(\"" + (this.options.expandable ? "./icons/bullet_toggle_plus.png" : "./images/folder.png") + "\")",
					"backgroundPosition": (this.level * 20 + 2) + "px center"
				},
				"href": "#"
			}).adopt(new Element("span").set("html", this.options.text)).inject(new Element("div", {"class": "item"}));
			if (this.parent.children.length > 0) {
				this.element.parentNode.inject(this.parent.children[this.parent.children.length - 1].element, "after");
			} else {
				this.element.parentNode.inject(this.parent.element, this.parent.head ? "bottom" : "after");
			}
		}
	},

	"setSelected": function(node) {
		if (this.head) {
			if (this.selected)
				this.selected.element.removeClass("selected");
			this.selected = node;
			this.selected.element.addClass("selected");
		} else {
			this.parent.setSelected($pick(node, this));
		}
	},

	"insert": function(options) {
		this.children.push(new TreeNode(options, this));
	},

	"clear": function() {
		this.children.each(function(node) {
			node.element.remove();
		});
		this.children = [];
	},

	"getRoot": function() {
		return this.head ? this.element : this.parent.getRoot();
	}

});
*/

function loadLangStrings() {
	[
		"OV_CAT_ALL",
		"OV_CAT_DL",
		"OV_CAT_COMPL",
		"OV_CAT_ACTIVE",
		"OV_CAT_INACTIVE",
		"OV_CAT_NOLABEL"
	].each(function(k) {
		$(k).set("text", lang[CONST[k]]);
	});
	if (isGuest) return;
	var tstr = lang[CONST.OV_TABS].split("||");
	utWebUI.tabs = new Tabs($("tabs"), {
		"tabs": {
			"gcont": tstr[0],
			"FileList": tstr[4],
			"spgraph": tstr[5],
			"lcont": tstr[6]
		},
		"onChange": utWebUI.tabChange.bind(utWebUI)
	}).draw().show("gcont");

	[
		"DLG_TORRENTPROP_1_GEN_01",
		"DLG_TORRENTPROP_1_GEN_03",
		"DLG_TORRENTPROP_1_GEN_04",
		"DLG_TORRENTPROP_1_GEN_06",
		"DLG_TORRENTPROP_1_GEN_08",
		"DLG_TORRENTPROP_1_GEN_10",
		"DLG_TORRENTPROP_1_GEN_11",
		"DLG_TORRENTPROP_1_GEN_12",
		"DLG_TORRENTPROP_1_GEN_14",
		"DLG_TORRENTPROP_1_GEN_16",
		"DLG_TORRENTPROP_1_GEN_17",
		"DLG_TORRENTPROP_1_GEN_18",
		"DLG_TORRENTPROP_1_GEN_19",
		"GN_TRANSFER",
		"GN_TP_01",
		"GN_TP_02",
		"GN_TP_03",
		"GN_TP_04",
		"GN_TP_05",
		"GN_TP_06",
		"GN_TP_07",
		"GN_TP_08",
		"GN_TP_09",
		"OV_NEWLABEL_TEXT"
	].each(function(k) {
		$(k).set("text", lang[CONST[k]]);
	});
	[
		["dlgProps-header", CONST.DLG_TORRENTPROP_00],
		["dlgLabel-header", CONST.OV_NEWLABEL_CAPTION],
		["dlgSettings-header", CONST.DLG_SETTINGS_00],
		["dlgAdd-header", CONST.OV_TB_ADDTORR]
	].each(function(k) {
		$(k[0]).set("text", lang[k[1]]);
	});

	$("DLG_TORRENTPROP_01").set("value", lang[CONST.DLG_TORRENTPROP_01]).addEvent("click", function() {
		DialogManager.hide("Props");
		utWebUI.setProperties();
	});
	$("DLG_TORRENTPROP_02").set("value", lang[CONST.DLG_TORRENTPROP_02]).addEvent("click", function() {
		if (utWebUI.propID == "multi") {
			[11, 17, 18, 19].each(function(v) {
				$("DLG_TORRENTPROP_1_GEN_" + v).removeEvents("click");
			});
		}
		this.propID = "";
		DialogManager.hide("Props");
	});
	$("LBL_OK").set("value", lang[CONST.DLG_SETTINGS_03]).addEvent("click", function() {
		DialogManager.hide("Label");
		utWebUI.createLabel();
	});
	$("LBL_CANCEL").set("value", lang[CONST.DLG_SETTINGS_04]).addEvent("click", function() {
		DialogManager.hide("Label");
	});
	$("ADD_FILE_OK").set("value", lang[CONST.DLG_SETTINGS_03]).addEvent("click", function() {
		$("upfrm").set("action", urlBase + "?token=" + utWebUI.TOKEN + "&action=add-file");
	});
	$("ADD_FILE_CANCEL").set("value", lang[CONST.DLG_SETTINGS_04]).addEvent("click", function() {
		DialogManager.hide("Add");
	});
	$("ADD_URL_OK").set("value", lang[CONST.DLG_SETTINGS_03]).addEvent("click", function() {
		DialogManager.hide("Add");
		utWebUI.addURL();
	});
	$("ADD_URL_CANCEL").set("value", lang[CONST.DLG_SETTINGS_04]).addEvent("click", function() {
		DialogManager.hide("Add");
	});

	["remove", "start", "pause", "stop"].each(function(act) {
		$(act).setProperty("title", lang[CONST["OV_TB_" + act.toUpperCase()]]);
	});
	$("setting").setProperty("title", lang[CONST.OV_TB_PREF]);
	$("add").setProperty("title", lang[CONST.OV_TB_ADDTORR]);
	perSec = "/" + lang[CONST.TIME_SECS].replace(/%d/, "").trim();
	SpeedGraph.init($("spgraph"));
	if (utWebUI.swfUpload) {
		var filmask = lang[CONST.CT_MASK1].split("||"), filters = {};
		filters[filmask[0]] = filmask[1];
		//filters[filmask[2]] = filmask[3];
		new Element("input", {
			"type": "button",
			"value": "Browse",
			"events": {
				"click": function() {
					utWebUI.swfUpload.browse(filters);
				}
			},
			"id": "swfBrowse"
		}).replaces($("torrent_file"))
		new Element("span", {
			"id": "swfFile"
		}).inject("swfBrowse", "after");
		new Element("input", {
			"type": "button",
			"value": lang[CONST.DLG_SETTINGS_03],
			"events": {
				"click": function() {
					utWebUI.swfUpload.upload();
				}
			},
			"class": "btn"
		}).replaces($("ADD_FILE_OK"));
	}
}

function loadSettingStrings() {
	new Tabs($("stgmenu"), {
		"tabs": {
			"st_webui": lang[CONST.ST_CAPT_WEBUI],
			"st_gl": lang[CONST.ST_CAPT_GENERAL],
			"st_dirs": lang[CONST.ST_CAPT_FOLDER],
			"st_con": lang[CONST.ST_CAPT_CONNECTION],
			"st_bw": lang[CONST.ST_CAPT_BANDWIDTH],
			"st_bt": lang[CONST.ST_CAPT_BITTORRENT],
			"st_tc": lang[CONST.ST_CAPT_TRANSFER_CAP],
			"st_que": lang[CONST.ST_CAPT_SEEDING],
			"st_sch": lang[CONST.ST_CAPT_SCHEDULER],
			"st_ao": lang[CONST.ST_CAPT_ADVANCED],
			"st_dc": lang[CONST.ST_CAPT_DISK_CACHE]
		}
	}).draw().show("st_webui");

	[
		"DLG_SETTINGS_1_GENERAL_02",
		"DLG_SETTINGS_1_GENERAL_10",
		"DLG_SETTINGS_1_GENERAL_11",
		"DLG_SETTINGS_1_GENERAL_12",
		"DLG_SETTINGS_1_GENERAL_13",
		"DLG_SETTINGS_1_GENERAL_17",
		"DLG_SETTINGS_1_GENERAL_18",
		"DLG_SETTINGS_1_GENERAL_19",
		"DLG_SETTINGS_1_GENERAL_20",
		"DLG_SETTINGS_2_UI_02",
		"DLG_SETTINGS_2_UI_05",
		"DLG_SETTINGS_2_UI_06",
		"DLG_SETTINGS_2_UI_15",
		"DLG_SETTINGS_2_UI_16",
		"DLG_SETTINGS_3_PATHS_01",
		"DLG_SETTINGS_3_PATHS_02",
		"DLG_SETTINGS_3_PATHS_03",
		"DLG_SETTINGS_3_PATHS_06",
		"DLG_SETTINGS_3_PATHS_07",
		"DLG_SETTINGS_3_PATHS_10",
		"DLG_SETTINGS_3_PATHS_11",
		"DLG_SETTINGS_3_PATHS_12",
		"DLG_SETTINGS_3_PATHS_15",
		"DLG_SETTINGS_3_PATHS_18",
		"DLG_SETTINGS_3_PATHS_19",
		"DLG_SETTINGS_4_CONN_01",
		"DLG_SETTINGS_4_CONN_02",
		"DLG_SETTINGS_4_CONN_05",
		"DLG_SETTINGS_4_CONN_06",
		"DLG_SETTINGS_4_CONN_07",
		"DLG_SETTINGS_4_CONN_08",
		"DLG_SETTINGS_4_CONN_09",
		"DLG_SETTINGS_4_CONN_11",
		"DLG_SETTINGS_4_CONN_13",
		"DLG_SETTINGS_4_CONN_15",
		"DLG_SETTINGS_4_CONN_16",
		"DLG_SETTINGS_4_CONN_18",
		"DLG_SETTINGS_4_CONN_19",
		"DLG_SETTINGS_4_CONN_20",
		"DLG_SETTINGS_4_CONN_21",
		"DLG_SETTINGS_5_BANDWIDTH_01",
		"DLG_SETTINGS_5_BANDWIDTH_02",
		"DLG_SETTINGS_5_BANDWIDTH_03",
		"DLG_SETTINGS_5_BANDWIDTH_05",
		"DLG_SETTINGS_5_BANDWIDTH_07",
		"DLG_SETTINGS_5_BANDWIDTH_08",
		"DLG_SETTINGS_5_BANDWIDTH_10",
		"DLG_SETTINGS_5_BANDWIDTH_11",
		"DLG_SETTINGS_5_BANDWIDTH_14",
		"DLG_SETTINGS_5_BANDWIDTH_15",
		"DLG_SETTINGS_5_BANDWIDTH_17",
		"DLG_SETTINGS_6_BITTORRENT_01",
		"DLG_SETTINGS_6_BITTORRENT_02",
		"DLG_SETTINGS_6_BITTORRENT_03",
		"DLG_SETTINGS_6_BITTORRENT_04",
		"DLG_SETTINGS_6_BITTORRENT_05",
		"DLG_SETTINGS_6_BITTORRENT_06",
		"DLG_SETTINGS_6_BITTORRENT_07",
		"DLG_SETTINGS_6_BITTORRENT_08",
		"DLG_SETTINGS_6_BITTORRENT_10",
		"DLG_SETTINGS_6_BITTORRENT_11",
		"DLG_SETTINGS_6_BITTORRENT_13",
		"DLG_SETTINGS_7_TRANSFERCAP_01",
		"DLG_SETTINGS_7_TRANSFERCAP_02",
		"DLG_SETTINGS_7_TRANSFERCAP_03",
		"DLG_SETTINGS_7_TRANSFERCAP_04",
		"DLG_SETTINGS_7_TRANSFERCAP_05",
		"DLG_SETTINGS_7_TRANSFERCAP_06",
		"DLG_SETTINGS_8_QUEUEING_01",
		"DLG_SETTINGS_8_QUEUEING_02",
		"DLG_SETTINGS_8_QUEUEING_04",
		"DLG_SETTINGS_8_QUEUEING_06",
		"DLG_SETTINGS_8_QUEUEING_07",
		"DLG_SETTINGS_8_QUEUEING_09",
		"DLG_SETTINGS_8_QUEUEING_11",
		"DLG_SETTINGS_8_QUEUEING_12",
		"DLG_SETTINGS_8_QUEUEING_13",
		"DLG_SETTINGS_9_SCHEDULER_01",
		"DLG_SETTINGS_9_SCHEDULER_02",
		"DLG_SETTINGS_9_SCHEDULER_04",
		"DLG_SETTINGS_9_SCHEDULER_05",
		"DLG_SETTINGS_9_SCHEDULER_07",
		"DLG_SETTINGS_9_SCHEDULER_09",
		"DLG_SETTINGS_9_WEBUI_01",
		"DLG_SETTINGS_9_WEBUI_02",
		"DLG_SETTINGS_9_WEBUI_03",
		"DLG_SETTINGS_9_WEBUI_05",
		"DLG_SETTINGS_9_WEBUI_07",
		"DLG_SETTINGS_9_WEBUI_09",
		"DLG_SETTINGS_9_WEBUI_10",
		"DLG_SETTINGS_9_WEBUI_12",
		"DLG_SETTINGS_A_ADVANCED_01",
		"DLG_SETTINGS_B_ADV_UI_07",
		"DLG_SETTINGS_C_ADV_CACHE_01",
		"DLG_SETTINGS_C_ADV_CACHE_02",
		"DLG_SETTINGS_C_ADV_CACHE_03",
		"DLG_SETTINGS_C_ADV_CACHE_05",
		"DLG_SETTINGS_C_ADV_CACHE_06",
		"DLG_SETTINGS_C_ADV_CACHE_07",
		"DLG_SETTINGS_C_ADV_CACHE_08",
		"DLG_SETTINGS_C_ADV_CACHE_09",
		"DLG_SETTINGS_C_ADV_CACHE_10",
		"DLG_SETTINGS_C_ADV_CACHE_11",
		"DLG_SETTINGS_C_ADV_CACHE_12",
		"DLG_SETTINGS_C_ADV_CACHE_13",
		"DLG_SETTINGS_C_ADV_CACHE_14",
		"DLG_SETTINGS_C_ADV_CACHE_15",
		"MENU_SHOW_CATEGORY",
		"MENU_SHOW_DETAIL",
		"ST_COL_NAME",
		"ST_COL_VALUE",
		"ST_SCH_LGND_FULL",
		"ST_SCH_LGND_LIMITED",
		"ST_SCH_LGND_OFF",
		"ST_SCH_LGND_SEEDING"
	].each(function(k) {
		$(k).set("text", lang[CONST[k]]);
	});

	$("DLG_SETTINGS_03").set("value", lang[CONST.DLG_SETTINGS_03]).addEvent("click", function() {
		DialogManager.hide("Settings");
		utWebUI.setSettings();
	});
	$("DLG_SETTINGS_04").set("value", lang[CONST.DLG_SETTINGS_04]).addEvent("click", function() {
		DialogManager.hide("Settings");
		utWebUI.loadSettings();
	});

	$("DLG_SETTINGS_4_CONN_04").set("value", lang[CONST.DLG_SETTINGS_4_CONN_04]).addEvent("click", function() {
		var v = utWebUI.settings["bind_port"], rnd = 0;
		do {
			rnd = parseInt(Math.random() * 50000) + 15000;
		} while (v == rnd);
		$("bind_port").set("value", rnd);
	});

	populateCombobox($("encryption_mode"), lang[CONST.ST_CBO_ENCRYPTIONS].split("||"), utWebUI.settings["encryption_mode"]);
	populateCombobox($("proxy.type"), lang[CONST.ST_CBO_PROXY].split("||"), utWebUI.settings["proxy.type"]);
	populateCombobox($("multi_day_transfer_mode"), lang[CONST.ST_CBO_TCAP_MODES].split("||"), utWebUI.settings["multi_day_transfer_mode"]);
	populateCombobox($("multi_day_transfer_limit_unit"), lang[CONST.ST_CBO_TCAP_UNITS].split("||"), utWebUI.settings["multi_day_transfer_limit_unit"]);
	populateCombobox($("multi_day_transfer_limit_span"), lang[CONST.ST_CBO_TCAP_PERIODS].split("||"), utWebUI.settings["multi_day_transfer_limit_span"]);

	utWebUI.langLoaded = true;

	$("sched_table").addEvent("change", function() {
		var sv = (utWebUI.settings["sched_table"] || "").pad(7*24, "0").substring(0, 7*24);
		var daycd = lang[CONST.ST_SCH_DAYCODES].split("||");
		var daynm = lang[CONST.ST_SCH_DAYNAMES].split("||");
		var tbody = new Element("tbody");
		var active = false;
		var mode = 0;
		for (var i = 0; i < 7; i++) {
			var tr = simpleClone(TR, false);
			for (var j = 0; j < 25; j++) {
				var td = simpleClone(TD, false);
				if (j == 0) {
					td.set("text", daycd[i]);
				} else {
					(function() {
						// Closure used here to ensure that each cell gets its own copy of idx...
						// Otherwise, weird JavaScript scoping rules apply, and all cells will
						// receive references to a shared idx (a variable's scope is function-wide
						// in JavaScript, not block-wide as in most other C-styled languages)
						var idx = i*24+j-1;
						td.set("class", "block mode" + sv.substr(idx, 1)).addEvent("mousedown", function() {
							if (!active && $("sched_enable").checked) {
								for (var k = 0; k <= 3; k++) {
									if (this.hasClass("mode" + k)) {
										mode = (k + 1) % 4;
										this.set("class", "block mode" + mode);
										sv = sv.substring(0, idx) + mode + sv.substring(idx+1);
										break;
									}
								}
								active = true;
							}

							return false;
						}).addEvent("mouseup", function() {
							if ($("sched_enable").checked) {
								$("sched_table").set("value", sv);
							}
							active = false;
						}).addEvent("mouseenter", function() {
							var day = Math.floor(idx / 24), hour = (idx % 24);
							$("sched_table_info").set("text", daynm[day] + ", " + hour + ":00 - " + hour + ":59");

							if ($("sched_enable").checked && active && !this.hasClass("mode" + mode)) {
								this.set("class", "block mode" + mode);
								sv = sv.substring(0, idx) + mode + sv.substring(idx+1);
							}
						}).addEvent("mouseleave", function() {
							$("sched_table_info").empty();
						});
						if (Browser.Engine.trident) {
							// Prevent text selection in IE
							td.addEvent("selectstart", $lambda(false));
						}
					})();
				}
				tr.grab(td);
			}
			tbody.grab(tr);
		}
		$("sched_table").empty().grab(tbody);
	}).fireEvent("change");

	var lgndex = {
		"full": lang[CONST.ST_SCH_LGND_FULLEX],
		"limited": lang[CONST.ST_SCH_LGND_LIMITEDEX],
		"off": lang[CONST.ST_SCH_LGND_OFFEX],
		"seeding": lang[CONST.ST_SCH_LGND_SEEDINGEX]
	};

	$$("#sched_table_lgnd ul li").addEvents({
		"mouseenter": function() {
			$("sched_table_info").set("text", lgndex[this.get("id").match(/.*_([^_]+)$/)[1]]);
		},
		"mouseleave": function() {
			$("sched_table_info").empty();
		}
	});
}

function populateCombobox(ele, vals, def) {
	ele.options.length = 0;
	vals.each(function(v, k) {
		if (v == "") return;
		ele.options[ele.options.length] = new Option(v, k, false, false);
	});
	ele.set("value", def);
}

var resizing = false;
function resizeUI(hDiv, vDiv) {
	if (resizing) return;
	resizing = true;

	var manualH = (typeof(hDiv) == "number"),
		manualV = (typeof(vDiv) == "number");

	var size = window.getSize(), ww = size.x, wh = size.y;

	var uiLimits = utWebUI.limits,
		minHSplit = uiLimits.minHSplit,
		minVSplit = uiLimits.minVSplit,
		minTrtH = uiLimits.minTrtH,
		minTrtW = uiLimits.minTrtW;

	var badIE = (Browser.Engine.trident && Browser.Engine.version <= 4);
	var showCat = true, showDet = false, showTB = false, tallCat = false;
	if (!isGuest) {
		showCat = utWebUI.config.showCategories;
		showDet = utWebUI.config.showDetails;
		showTB = utWebUI.config.showToolbar;
		tallCat = !!utWebUI.settings["gui.tall_category_list"];
	}

	var th = (showTB ? $("toolbar").getSize().y + 5 : 0);

	if (manualH) {
		hDiv -= 2;

		// Sanity check manual drag of divider
		if (hDiv < minHSplit) {
			hDiv = minHSplit;
		}
		else if (hDiv > ww - minTrtW) {
			hDiv = ww - minTrtW;
		}
	}
	else {
		hDiv = 0;
		if (showCat) {
			hDiv = utWebUI.config.hSplit;
			if ((typeof(hDiv) != "number") || (hDiv <= 0)) hDiv = uiLimits.defHSplit;
		}
	}

	if (manualV) {
		vDiv -= 2;

		// Sanity check manual drag of divider
		if (vDiv > wh - minVSplit) {
			vDiv = wh - minVSplit;
		}
		else if (vDiv < th + minTrtH) {
			vDiv = th + minTrtH;
		}
	}
	else {
		vDiv = 0;
		if (showDet) {
			vDiv = utWebUI.config.vSplit;
			if ((typeof(vDiv) != "number") || (vDiv <= 0)) vDiv = uiLimits.defVSplit;
		}
		vDiv = wh - vDiv;
	}

	// Resize torrent list
	var trtw = ww - (hDiv + 2 + (showCat ? 7 : 0)) - (badIE ? 2 : 0),
		trth = vDiv - (th + (showDet ? 0 : 2)) - (badIE ? 1 : 0);

	if (trtw < minTrtW) {
		// Gracefully degrade if torrent list too small
		hDiv -= minTrtW - trtw;
		if (showCat) {
			if (hDiv < minHSplit) {
				$("CatList").hide();
				showCat = false;
				trtw = ww - 2;
			}
			else {
				$("CatList").show();
				trtw = minTrtW;
			}
		}
	}

	if (trth < minTrtH) {
		// Gracefully degrade if torrent list too small
		vDiv += minTrtH - trth;
		if (showDet) {
			if (vDiv > wh - minVSplit) {
				$("tdetails").hide();
				showDet = false;
				trth = wh - th - 2;
			}
			else {
				$("tdetails").show();
				trth = minTrtH;
			}
		}
	}

	utWebUI.trtTable.resizeTo(trtw, trth);

	// Resize category/label list
	if (showCat) {
		if (hDiv) $("CatList").setStyle("width", hDiv - (badIE ? 2 : 0));

		if (tallCat) {
			$("CatList").setStyle("height", wh - th - 2);
		}
		else if (trth) {
			$("CatList").setStyle("height", trth);
		}
	}

	// Resize detailed info pane
	if (showDet) {
		var dw = ww - (3 + (showCat && tallCat ? hDiv + 7 : 0)) - (badIE ? 2 : 0);
		$("tdetails").setStyle("width", dw);
		if (vDiv) {
			var dh = wh - vDiv - $("tabs").getSize().y - 16;
			$("tdcont").setStyles({"width": dw - 5, "height": dh});
			$("gcont").setStyles({"width": dw - 10, "height": dh - 5});
			SpeedGraph.resize(dw - 5, dh - 12);
			$("lcont").setStyles({"width": dw - 14, "height": dh - 9});
			utWebUI.flsTable.resizeTo(dw - 7, dh - 2);
		}
	}

	// Reposition dividers
	if ($("HDivider")) {
		$("HDivider").setStyles({
			"height": tallCat ? wh - th : trth + 2,
			"left": showCat ? hDiv + 2 : -10,
			"top": th
		});
	}

	if ($("VDivider")) {
		$("VDivider").setStyles({
			"width": ww,
			"left": tallCat ? hDiv + 7 : 0,
			"top":  showDet ? vDiv + 2 : -10
		});
	}

	// Store new divider position(s)
	if (hDiv && showCat && manualH) utWebUI.config.hSplit = hDiv;
	if (vDiv && showDet && manualV) utWebUI.config.vSplit = (wh - vDiv);

	resizing = false;
}

function linked(obj, defstate, list, ignoreLabels, reverse) {
	ignoreLabels = ignoreLabels || [];
	var disabled = true, tag = obj.get("tag");
	if (tag == "input") {
		if (obj.type == "checkbox")
			disabled = !obj.checked || obj.disabled;
			if (reverse)
				disabled = !disabled;
	} else if (tag == "select") {
		disabled = (obj.get("value") == defstate);
	} else {
		return;
	}
	var element;
	for (var i = 0, j = list.length; i < j; i++) {
		if (!(element = $(list[i]))) continue;
		if (element.type != "checkbox")
			element[(disabled ? "add" : "remove") + "Class"]("disabled");
		element.disabled = disabled;
		element.fireEvent(((tag == "input") && Browser.Engine.trident) ? "click" : "change");
		if (ignoreLabels.contains(list[i])) continue;
		var label = element.getPrevious();
		if (!label || (label.get("tag") != "label")) {
			label = element.getNext();
			if (!label || (label.get("tag") != "label")) continue;
		}
		label[(disabled ? "add" : "remove") + "Class"]("disabled");
	}
}

window.addEvent("domready", function() {
	$(document.body);

	document.title = "\u00B5Torrent WebUI v" + VERSION;

	window.addEvent("resize", resizeUI);

	//
	// Mouse Click
	//

	ContextMenu.init("ContextMenu");
	document.addEvent("mousedown", function(ev) {
		if ((ev.isRightClick() && !ContextMenu.launched) || (!ev.isRightClick() && !ContextMenu.hidden && !ContextMenu.focused))
			ContextMenu.hide.delay(10, ContextMenu);
		ContextMenu.launched = false;
	});

	if (Browser.Engine.gecko) {
		document.addEvent("mousedown", function(ev) {
			if (ev.isRightClick() && !(/^input|textarea|a$/i).test(ev.target.tagName)) {
				ev.stop();
				return false;
			}
		}).addEvent("click", function(ev) {
			if (ev.isRightClick() && !(/^input|textarea|a$/i).test(ev.target.tagName)) {
				ev.stop();
				return false;
			}
		});
	} else if (Browser.Engine.presto && !("oncontextmenu" in document.createElement("foo"))) {
		/*
		 * 	http://my.opera.com/community/forums/findpost.pl?id=2112305
		 * 	http://dev.fckeditor.net/changeset/683
		 */
		var overrideButton;
		document.addEvent("mousedown", function(ev) {
			if (!ev.isRightClick()) return;
			if (!overrideButton) {
				var doc = ev.target.ownerDocument;
				overrideButton = doc.createElement("input");
				overrideButton.type = "button";
				overrideButton.style.cssText = "z-index:1000;position:fixed;top:" + (ev.client.y - 2) + "px;left:" + (ev.client.x - 2) + "px;width:5px;height:5px;opacity:0.01";
				(doc.body || doc.documentElement).appendChild(overrideButton);
			}
		}).addEvent("mouseup", function(ev) {
			if (overrideButton) {
				overrideButton.parentNode.removeChild(overrideButton);
				overrideButton = undefined;
				if (ev.isRightClick() && !(/^input|textarea|a$/i).test(ev.target.tagName)) {
					ev.stop();
					return false;
				}
			}
		});
	}

	document.addEvent("contextmenu", function(ev) {
		if (!(/^input|textarea|a$/i).test(ev.target.tagName)) {
			ev.stop();
			return false;
		}
	});

	//
	// Non-guest Setup
	//

	if (!isGuest) {

		window.addEvent("unload", function() {
			utWebUI.saveConfig(false);
		});

		//
		// Keyboard Shortcuts
		//

		var keyBindings = {
			"ctrl a": $empty,
			"ctrl e": $empty,

			"ctrl o": function() { DialogManager.show("Add"); },
			"ctrl p": function() { utWebUI.showSettings(); },
			"f2": function() { DialogManager.show("About"); },
			"f4": function() { utWebUI.toggleToolbar(); },
			"f6": function() { utWebUI.toggleDetPanel(); },
			"f7": function() { utWebUI.toggleCatPanel(); },

			"esc": function() {
				if (DialogManager.showing.length > 0) {
					DialogManager.hideTopMost(true);
				} else {
					utWebUI.restoreUI();
				}
			}
		};

		if (Browser.Platform.mac) {
			keyBindings["meta a"] = keyBindings["ctrl a"];
			keyBindings["meta e"] = keyBindings["ctrl e"];
			keyBindings["meta o"] = keyBindings["ctrl o"];
			keyBindings["meta p"] = keyBindings["ctrl p"];

			delete keyBindings["ctrl a"];
			delete keyBindings["ctrl e"];
			delete keyBindings["ctrl o"];
			delete keyBindings["ctrl p"];
		}

		document.addEvent("keydown", function(ev) {
			var key = eventToKey(ev);
			if (keyBindings[key]) {
				keyBindings[key]();
				ev.stop();
				return false;
			}
		});

		if (Browser.Engine.presto) {
			document.addEvent("keypress", function(ev) {
				var key = eventToKey(ev);
				if (keyBindings[key]) {
					ev.stop();
					return false;
				}
			});
		}

		//
		// Search Toolbar
		//

		$("search").addEvent("click", function(ev) {
			Search();
			ev.stop();
			return false;
		}).addEvent("contextmenu", function(ev) {
			ev.stop();
			return false;
		});

		$("searchsel").addEvent("click", function(ev) {
			ev.stop();
			ContextMenu.clear();
			for (var i = 0, j = searchList.length; i < j; i++) {
				if (searchList[i].length == 0) {
					ContextMenu.add([CMENU_SEP]);
				} else {
					if (i == searchActive) {
						ContextMenu.add([CMENU_SEL, searchList[i][0]]);
					} else {
						ContextMenu.add([searchList[i][0], searchSet.pass(i)]);
					}
				}
			}
			var pos = this.getPosition();
			pos.x += 4;
			pos.y += 12;
			ContextMenu.show(pos);
		}).addEvent("contextmenu", function(ev) {
			ev.stop();
			return false;
		});

		//
		// Toolbar Buttons
		//

		["remove", "start", "pause", "stop"].each(function(act) {
			$(act).addEvent("click", function(ev) {
				ev.stop();
				utWebUI[act]();
			});
		});

		$("setting").addEvent("click", function(ev) {
			ev.stop();
			utWebUI.showSettings();
		});

		//
		// Torrent Adding
		//

		$("add").addEvent("click", function(ev) {
			ev.stop();
			/*
			var ele = $("addlab");
			ele.options.length = 0;
			var count = 0;
			for (var key in utWebUI.customLabels)
				ele.options[count++] = new Option(key, key, false, count == 0);
			*/
			DialogManager.show("Add");
		});

		$("upfrm").addEvent("submit", function() {
			return checkUpload(this);
		});

		/*
		$("DLG_PRE_ADD_03").addEvent("click", function() {
			utWebUI.showFolderBrowser();
		});
		*/

		new IFrame({
			"id": "uploadfrm",
			"src": "about:blank",
			"onload": function(doc) {
				$("torrent_file").set("value", "");
				$("ADD_FILE_OK").disabled = false;
				var str = $(doc.body).get("text");
				if (str != "") {
					var data = JSON.decode(str);
					if (has(data, "error")) {
						alert(data.error);
						log("[Add Torrent File Error] " + data.error);
					}
				}
			}
		}).inject(document.body);

		//
		// Dialogs
		//

		DialogManager.dragMask = $("dragmask");

		["Add", "Settings", "Props", "About", "Label"].each(function(k) {
			var isModal = (["Label", "Props"].indexOf(k) >= 0);
			DialogManager.add(k, isModal);
		});

		$("dlgProps").getElement("a").addEvent("click", function(ev) {
			if (utWebUI.propID == "multi") {
				[11, 17, 18, 19].each(function(v) {
					$("DLG_TORRENTPROP_1_GEN_" + v).removeEvents("click");
				});
			}
		});

		//
		// Settings Dialog
		//

		$("dlgSettings").getElement("a").addEvent("click", function(ev) {
			utWebUI.loadSettings();
		});

		var linkedEvent = Browser.Engine.trident ? "click" : "change";

		// onchange fires in IE on <select>s
		$("proxy.type").addEvent("change", function() {
			linked(this, 0, ["proxy.proxy", "proxy.port", "proxy.auth", "proxy.resolve", "proxy.p2p"]);
		}).fireEvent("change");
		$("proxy.auth").addEvent(linkedEvent, function() {
			linked(this, 0, ["proxy.username"]);
			linked(this, 0, ["proxy.password"], null, (this.checked && ($("proxy.type").get("value").toInt() == 1)));
		});
		$("cache.override").addEvent(linkedEvent, function() {
			linked(this, 0, ["cache.override_size"], ["cache.override_size"]);
		});
		$("cache.write").addEvent(linkedEvent, function() {
			linked(this, 0, ["cache.writeout", "cache.writeimm"]);
		});
		$("cache.read").addEvent(linkedEvent, function() {
			linked(this, 0, ["cache.read_turnoff", "cache.read_prune", "cache.read_thrash"]);
		});
		$("prop-seed_override").addEvent(linkedEvent, function() {
			linked(this, 0, ["prop-seed_ratio", "prop-seed_time"]);
		});
		$("webui.enable_guest").addEvent(linkedEvent, function() {
			linked(this, 0, ["webui.guest"]);
		});
		$("webui.enable_listen").addEvent(linkedEvent, function() {
			linked(this, 0, ["webui.port"]);
		});
		$("multi_day_transfer_limit_en").addEvent(linkedEvent, function() {
			linked(this, 0, ["multi_day_transfer_mode", "multi_day_transfer_limit_value", "multi_day_transfer_limit_unit", "multi_day_transfer_limit_span", "DLG_SETTINGS_7_TRANSFERCAP_06"]);
		});
		$("seed_prio_limitul_flag").addEvent(linkedEvent, function() {
			linked(this, 0, ["seed_prio_limitul"]);
		});
		$("sched_enable").addEvent(linkedEvent, function() {
			linked(this, 0, ["sched_ul_rate", "sched_dl_rate", "sched_dis_dht"]);
			["sched_table", "sched_table_lgnd", "sched_table_info"].each(
				this.checked ? function(k) { $(k).removeClass("disabled"); }
							 : function(k) { $(k).addClass("disabled"); }
			);
		});
		$("dir_active_download_flag").addEvent(linkedEvent, function() {
			linked(this, 0, ["always_show_add_dialog", "dir_active_download"]);
		});
		$("dir_completed_download_flag").addEvent(linkedEvent, function() {
			linked(this, 0, ["dir_add_label", "dir_completed_download", "move_if_defdir"]);
		});
		$("dir_torrent_files_flag").addEvent(linkedEvent, function() {
			linked(this, 0, ["dir_torrent_files"]);
		});
		$("dir_completed_torrents_flag").addEvent(linkedEvent, function() {
			linked(this, 0, ["dir_completed_torrents"]);
		});
		$("dir_autoload_flag").addEvent(linkedEvent, function() {
			linked(this, 0, ["dir_autoload_delete", "dir_autoload"]);
		});
		$("ul_auto_throttle").addEvent(linkedEvent, function() {
			linked(this, 0, ["max_ul_rate", "max_ul_rate_seed_flag"], ["max_ul_rate"], true);
		});
		$("max_ul_rate_seed_flag").addEvent(linkedEvent, function() {
			linked(this, 0, ["max_ul_rate_seed"]);
		});

	}

	utWebUI.init();
});