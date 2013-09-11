function load(){
	opendb();
	loadsettings();
	loaddays();
	showfulldate();
	getday();	
	};
function showfulldate() {  
  Date.prototype.monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
	];
	Date.prototype.getMonthName = function() {
		return this.monthNames[this.getMonth()];
	};
	Date.prototype.getDayName = function(){
		var days= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		var today = new Date();
		return days[today.getDay()]
	};
	var d = new Date()  
  	var fulldate = d.getDayName()+", "+ d.getDate()+" "+ d.getMonthName()+" "+ d.getFullYear();
  $("#fulldate").text(fulldate);
}
function getday() {
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var oneWeek = 7*24*60*60*1000;
    var stda = "7/19/2013";
    var firstDate = new Date(stda);
    var count = firstDate;
    var today = new Date();
    today.setHours("0")
    today.setMilliseconds("0")
    today.setMinutes("0")
    today.setSeconds("0")
    var diffWeek = Math.floor(Math.abs((today.getTime() - firstDate.getTime())/(oneWeek)))+1;
    for(var i=0; count<today;) {
      if(count.getDay()<5)
	i++;
	count.setDate(count.getDate()+1) ;
    }
    var day = (i%7)+1;
    $("#day").text("Day "+day);
    $("#week").text("Week "+diffWeek);
}
function loadsettings(){
	db.transaction(function(tx){	
	  tx.executeSql("SELECT * FROM SETTINGS", [], function (tx, results) {
		  var el = $("#DPC");
		  for(var i = 0; i< results.rows.length; i++){
			  var item = results.rows.item(i);			  
			  switch (item.type){
				  case "daysnum":
				  	el.find("#daysint").val(item.value);
				  	break;
				  case "cstart":
				  	el.find("#cycle_start").val(item.value);
				  	break;
				  case "cend":
				  	el.find("#cycle_end").val(item.value);
				  	break;
				  }
		  }
		  });
	});
	}
function loaddays(){
		db.transaction(function(tx){	
		tx.executeSql("SELECT * FROM DAYS", [], function (tx, results) {
			var el = $("#DPC");
			for(var i = 0; i< results.rows.length; i++){
				var item = results.rows.item(i);			  
				days_cycle_ui_add(item);
			}
			});
	  });
	 }
function days_cycle_save(){
	var el = $("#DPC");
	var elr = $("#DPC").find("#daylist");
	elr.text("");
	var days_number = el.find("#daysint").val();
	var cycle_start = el.find("#cycle_start").val();
	var cycle_end = el.find("#cycle_end").val();
	cycle_settings_db(days_number,cycle_start,cycle_end);
	db.transaction(function(tx){
	  tx.executeSql('DELETE FROM DAYS');
	  tx.executeSql('DELETE FROM PERIODS');
	  tx.executeSql("SELECT * FROM DAYS", [], function (tx, results) {
			  for(var i = 1; i<= days_number; i++){
				  var day = "";
				  try {day = results.rows.item(i-1);}catch (ex) {};
				  if(day == ""){
					  var display = "Day " + i;
					  var periods = "";
					  days_create_db(i,display,periods);
					  day={
						  id:i, display:display, periods:periods
						  };
					  days_cycle_ui_add(day);		
					  }
				  else{
					  days_cycle_ui_add(day);
				  }				
				  }
		  });
	},errorCB);
	}
function days_cycle_ui_add(day){
	var el = $("#DPC").find("#daylist");
	var dayel = $('<li><a></a></li>');
	dayel.find("a").attr("data-id",day.id);
	dayel.find("a").attr("onClick","pageedit_show(attributes[0].value)");
	dayel.find("a").text(day.display);
	el.append(dayel);
	if (el.hasClass('ui-listview')) {
        	el.listview('refresh');
		}
	}
function pageedit_show(pageid){
	pageid = Number(pageid);
	var el = $("#pageedit").find("#pagehost").text("");
	db.transaction(function(tx){
	  tx.executeSql("SELECT * FROM DAYS WHERE id=?", [pageid], function (tx, results) {
		  var day = results.rows.item(0);
		  var periods = day.periods.split(",");
		  var el = $("#pageedit");
		  for(var i = 1; i <= periods.length; i++){
			  if(!periods[i] == ""){
				var id = Number(periods[i]);
				periods_create(id);
			  }
		  }
			$.mobile.changePage("#pageedit");
		  });
		},errorCB);
	}
function periods_create(periodid){
	db.transaction(function(tx){	
	tx.executeSql("SELECT * FROM PERIODS WHERE id=?", [periodid], function (tx, results) {
		var period = results.rows.item(0);
		periods_create_ui(period);
		});
	},errorCB);
	}
function periods_create_ui(item){
	var el = $("#pageedit").find("#pagehost");
	var hostel = $('<div data-role="collapsible"><h2></h2></div>');
	var periodel = $('\
		<ul data-role="listview" data-inset="true">\
         <li data-role="fieldcontain">\
            <label for="title">Title (Subject)</label>\
            <input type="text" name="title" id="title"/>\
            <br>\
            <label for="time_start">Time Start</label>\
            <input type="time" name="time_start" id="time_start" value="" data-mini="true" data-inline="true" />\
            <label for="time_end">Time End</label>\
            <input type="time" name="time_end" id="time_end" value="" data-mini="true" data-inline="true" />\
            <br>\
            <label for="loc">Location</label>\
            <input type="text" name="loc" id="loc" value="" />\
            <label for="more">More Info</label>\
            <textarea type="text" name="more" id="more" value=""></textarea>\
         </li>\
        <li><div><a data-role="button" href="#">Save</a></div></li>\
      </ul>\
	  ');
	if(!item){
		var id = new Date().getTime();
		var title = "Example Period";
		var tstart = "12:00";
		var tend = "13:00";
		var loc = "Room: 1206";
		var more = "Place more information here.";
		item = {id:id, title:title, tstart:tstart, tend:tend, loc:loc, more:more}
		}
	else{
		
		}
		hostel.find("h2").text(item.title);
		hostel.attr("data-id",item.id);
		periodel.find("#title").val(item.title);
		periodel.find("#time_start").val(item.tstart);
		periodel.find("#time_end").val(item.tend);
		periodel.find("#loc").val(item.loc);
		periodel.find("#more").attr("placeholder",item.more);			
		hostel.append(periodel);		
		el.append(hostel);
		el.find("ul").trigger('create');		
		el.find("ul").listview()
		el.find("ul").listview('refresh');		
		if (el.hasClass('ui-collapsible-set')) {
        	el.collapsibleset('refresh');
		}		
	}