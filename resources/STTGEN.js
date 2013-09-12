function load(){
	opendb();
	loadsettings();
	loaddays();	
	showfulldate();		
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
var cyclenum = 0;
var daysoccureon = "";
var date_start = "";
var lastday = 0;
var lastdate = "";
var week = "";
function getcurentday(){
	var datenow = new Date();
	datenow = new Date(datenow.toLocaleDateString());
	var lastdate_val = new Date(lastdate);
	var incrament = 0;
	for(;!(lastdate_val.getTime() - datenow.getTime()) == 0;){
		var day = lastdate_val.getDay();
		var days = daysoccureon.split(",");
		for(var i = 0; i < days.length; i++){
			if(day == days[i]){
				incrament = incrament + 1;
				}
			}	
		lastdate_val.setDate(lastdate_val.getDate()+1);
		}
	for(; !incrament == 0; incrament--){
		if(lastday == cyclenum ){
			lastday = 1;
			}
		else{
			lastday = lastday + 1;	
			}
		}
	week = Math.floor(Math.abs((datenow.getTime() - new Date(date_start.split('/').reverse().join('/')).getTime())/(7*24*60*60*1000)))+1;
	lastdaycheck_save(lastday);
	var datestring =  [datenow.getFullYear(), zeroPad(datenow.getMonth()+1,10), zeroPad(datenow.getDate(),10) ].join('/');
	lastdatecheck_save(datestring);
	home_day_display(lastday);
	var page = $("#setup");					
	page.find("#curentday").val(lastday);
	}
function zeroPad(nr,base){
  var len = (String(base).length - String(nr).length)+1;
  return len > 0? new Array(len).join('0')+nr : nr;
}

function loadsettings(){
	db.transaction(function(tx){	
	  tx.executeSql("SELECT * FROM SETTINGS", [], function (tx, results) {
		  var el = $("#DPC");
		  for(var i = 0; i< results.rows.length; i++){
			  var item = results.rows.item(i);			  
			  switch (item.type){
				  case "daysnum":
				  	cyclenum = Number(item.value);
				  	el.find("#daysint").val(item.value);
				  	break;
				  case "cstart":
				  	date_start = item.value;
				  	el.find("#cycle_start").val(item.value);
				  	break;
				  case "cend":				  	
				  	break;
				  case "occure":
				  	daysoccureon = item.value;
					loaddaysselected(item.value);
					break;
				  case "lastday":
				  	lastday = Number(item.value);
					var page = $("#setup");					
					page.find("#curentday").val(item.value);
					break;
				  case "lastdate":
				  	lastdate = item.value;					
					break;					  
				  }
		  }
		  getcurentday();
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
function loaddaysselected(days){
	var page = $("#setup");
	var selectel = page.find("#select_days");	
	days = days.split(",");			
	for(var i = 0; i < days.length; i++){
		selectel.find("#"+days[i])[0].selected = true;				
		}
	if (selectel.parent().hasClass('ui-select')) {
            selectel.selectmenu('refresh');
            }
	}
function days_cycle_save(){
	var el = $("#DPC");
	$("#EDP").find("#daylist").text("");
	var days_number = el.find("#daysint").val();
	var cycle_start = el.find("#cycle_start").val();	
	cycle_settings_db(days_number,cycle_start);
	lastday = 1;
	lastdaycheck_save(lastday);
	var datenow = new Date(cycle_start.split('/').reverse().join('/'));
	var datestring =  [datenow.getFullYear(), zeroPad(datenow.getMonth()+1,10), zeroPad(datenow.getDate(),10) ].join('/');
	lastdatecheck_save(datestring);
	lastdate = datestring;
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
				  getcurentday();
		  });
	},errorCB);
	}
function days_cycle_ui_add(day){
	var el = $("#EDP").find("#daylist");
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
	$("#pageedit").attr("data-id",pageid);
	db.transaction(function(tx){
	  tx.executeSql("SELECT * FROM DAYS WHERE id=?", [pageid], function (tx, results) {
		  var day = results.rows.item(0);
		  var periods = day.periods.split(",");
		  var el = $("#pageedit");
		  for(var i = 0; i <= periods.length; i++){
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
            <textarea type="text" name="more" id="more" value="" placeholder="Place more information here."></textarea>\
         </li>\
        <li><div><a data-role="button" href="#" data-theme="f" id="remove" onClick="daysedit_periods_remove(attributes[5].value)">Remove</a></div></li>\
      </ul>\
	  ');
	if(!item){
		var id = new Date().getTime();
		var title = "Example Period";
		var tstart = "12:00";
		var tend = "13:00";
		var loc = "Room: 1206";
		var more = "";
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
		periodel.find("#more").val(item.more);
		periodel.find("#remove").attr("data-id",item.id);			
		hostel.append(periodel);		
		el.append(hostel);
		el.find("ul").trigger('create');				
		el.find("ul").listview()
		el.find("ul").listview('refresh');		
		if (el.hasClass('ui-collapsible-set')) {
        	el.collapsibleset('refresh');
		}
		
	}
	
function dayedit_save(){
	var page = $("#pageedit");
	var periodshost = page.find("#pagehost");
	var periods = periodshost.find('[data-role="collapsible"]');
	var pageid = Number(page.attr("data-id"));
	var listofids = "";	
	for(var i = 0; i < periods.length; i++){
		period = $(periods[i]);
		periodid = Number(period.attr("data-id"));
		var item = {};
		item.title = period.find("#title").val();
		item.tstart = period.find("#time_start").val();
		item.tend = period.find("#time_end").val();
		item.loc = period.find("#loc").val();
		item.more = period.find("#more").val();
		period_add_db(periodid,item.title,item.tstart,item.tend,item.loc,item.more);
		listofids = listofids +periodid+",";
		}
		listofids = listofids.slice(0,-1);
		days_update_periods(pageid,listofids);
		home_day_display(lastday);
		$.mobile.changePage("#setup");
	}
function daysedit_periods_remove(id){
	var page = $("#pageedit");
	var pageid = Number(page.attr("data-id"));
	var periodshost = page.find("#pagehost");
	var period = periodshost.find('.ui-collapsible[data-id="'+id+'"]');
	period_remove_db(Number(id));	
	db.transaction(function(tx){
	  tx.executeSql("SELECT * FROM DAYS WHERE id=?", [pageid], function (tx, results) {
		  var day = results.rows.item(0);
		  var periods = day.periods.split(",");
		  for(var i = 0; i<periods.length; i++){
			  if (periods[i] == id){
				  periods[i] = "";
				  }
			  }
			var periods2 = "";
		   for(var i = 0; i<periods.length; i++){
			  if (!periods[i] == ""){
				  periods2 = periods2 + periods[i] +",";
				  }
			  }
			 periods2 = periods2.slice(0,-1);
			 days_update_periods(pageid,periods2);
			 home_day_display(lastday);
		  });
	});	
	period.remove();	
	if (periodshost.hasClass('ui-collapsible-set')) {
        	periodshost.collapsibleset('refresh');
		}	
	}
function cycle_occure_save(){
	var page = $("#setup");
	var selectel = page.find("#select_days");
	var lastday = page.find("#curentday").val();
	lastdaycheck_save(lastday);	
	var datenow = new Date();
	var datestring =  [datenow.getFullYear(), zeroPad(datenow.getMonth()+1,10), zeroPad(datenow.getDate(),10) ].join('/');
	lastdatecheck_save(datestring);	
	var optionsel = selectel.find("option");
	var days = "";
	for(var i = 0; i < optionsel.length; i++){
		if(optionsel[i].selected){
			var day = $(optionsel[i]).val();
			days = days + day + ",";
			}
		}
	days = days.slice(0,-1);
	cycle_occure_save_db(days);
	daysoccureon = days;
	home_day_display(lastday);
	}
function home_day_display(dayid){
	$("#home").find("#periodslist").text("");
	$("#day").text("");
	var day = new Date().getDay();
	var days = daysoccureon.split(",");
	var yes = false;
	for(var i = 0; i < days.length; i++){
		if(day == days[i]){
			yes = true;
			}
		}
	if(yes){	  
	  $("#day").html("Day "+lastday+"&nbsp&nbsp&nbsp&nbsp&nbsp Week "+week);
	  db.transaction(function(tx){	
		  tx.executeSql("SELECT * FROM DAYS WHERE id=?", [dayid], function (tx, results) {
			  var day = results.rows.item(0);
			  if(!day.periods == ""){
				  var periods = day.periods.split(",");
				  for(var i = 0; i < periods.length; i++){
					  home_periods_display(Number(periods[i]));
					  }
				  }
			  });
		});
	}
	}
function home_periods_display(periodid){
	db.transaction(function(tx){	
		tx.executeSql("SELECT * FROM PERIODS WHERE id=?", [periodid], function (tx, results) {
			var period = results.rows.item(0);
			home_periods_display_ui(period);
			});
		},errorCB);
	}
function home_periods_display_ui(item){
	var el = $("#home").find("#periodslist");
	var hostel = $('<li></li>');
	var periodel = $('\
	<a href="#">\
      <h3></h3>\
      <p id="1"></p>\
      <p id="2" class="ui-li-aside"></p>\
    </a>\
	');			
		hostel.attr("data-id",item.id);
		periodel.find("h3").text(item.title);
		periodel.find("p#1").html(item.tstart + " - " + item.tend + 
		"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" 
		+ item.more);		
		periodel.find("p#2").text(item.loc);
		//periodel.find("#more").val(item.more);					
		hostel.append(periodel);		
		el.append(hostel);		
		if (el.hasClass('ui-listview')) {
        	el.listview('refresh');
		}	
	}