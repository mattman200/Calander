var db;
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
function cycle_settings_db(daysnum,cstart){
	db.transaction(function(tx){
		tx.executeSql('INSERT OR REPLACE INTO SETTINGS (id,type,value) VALUES (?,?,?)', [1,"daysnum",daysnum]);
		tx.executeSql('INSERT OR REPLACE INTO SETTINGS (id,type,value) VALUES (?,?,?)', [2,"cstart",cstart]);				
		},errorCB);
	}
function days_create_db(id,display,periods){
	db.transaction(function(tx){
		tx.executeSql('INSERT INTO DAYS (id,display,periods) VALUES (?,?,?)', [id, display, periods]);
		},errorCB);
	}
function days_update_periods(id,periods){
	db.transaction(function(tx){
		tx.executeSql('UPDATE DAYS SET periods=? WHERE id=? ', [periods, id]);
		},errorCB);
	}
function period_add_db(id,title,tstart,tend,loc,more){
	db.transaction(function(tx){
		tx.executeSql('INSERT OR REPLACE INTO PERIODS (id,title,tstart,tend,loc,more) VALUES (?,?,?,?,?,?)', [id,title,tstart,tend,loc,more]);
		},errorCB);
	}
function period_remove_db(id){
	db.transaction(function(tx){
		tx.executeSql('DELETE FROM PERIODS WHERE id=?', [id]);
		},errorCB);
	}
function cycle_occure_save_db(value){
	db.transaction(function(tx){
		tx.executeSql('INSERT OR REPLACE INTO SETTINGS (id,type,value) VALUES (?,?,?)', [4,"occure",value]);
		},errorCB);
	}
function lastdaycheck_save(value){
	db.transaction(function(tx){
		tx.executeSql('INSERT OR REPLACE INTO SETTINGS (id,type,value) VALUES (?,?,?)', [5,"lastday",value]);
		},errorCB);
	}
function lastdatecheck_save(value){
	db.transaction(function(tx){
		tx.executeSql('INSERT OR REPLACE INTO SETTINGS (id,type,value) VALUES (?,?,?)', [6,"lastdate",value]);
		},errorCB);
	}