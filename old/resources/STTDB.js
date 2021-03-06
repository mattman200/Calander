var db
function errorCB(err) {
    alert("Error processing SQL: " + err.code);
}//db.transaction(function(tx){},errorCB);
function opendb(){
	db = window.openDatabase('STT', '1.0', 'School Time Table BD', 2*1024*1024);
	db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS DAYS (id INTEGER PRIMARY KEY AUTOINCREMENT , display, periods)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS PERIODS (id INTEGER PRIMARY KEY AUTOINCREMENT, title, tstart, tend, loc, more)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS SETTINGS (id INTEGER PRIMARY KEY AUTOINCREMENT, type, value)');        
    }, errorCB);	
}
function cycle_settings_db(daysnum,cstart,cend){
	db.transaction(function(tx){
		tx.executeSql('INSERT INTO SETTINGS (id,type,value) VALUES (?,?,?)', [1, "daysnum",daysnum]);
		tx.executeSql('INSERT INTO SETTINGS (id,type,value) VALUES (?,?,?)', [2, "cstart",cstart]);
		tx.executeSql('INSERT INTO SETTINGS (id,type,value) VALUES (?,?,?)', [3, "cend",cend]);		
		},errorCB);
	}
function days_create_db(id,display,periods){
	db.transaction(function(tx){
		tx.executeSql('INSERT INTO SETTINGS (id,display,periods) VALUES (?,?,?)', [id, display, periods]);
		},errorCB);
	}
