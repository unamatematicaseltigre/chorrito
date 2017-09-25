// El robot de google
// Version : 1.05
// deployed as https://script.google.com/macros/s/AKfycbzYjk5fPj2IBAIVTQ17WfoF7Go-Ct6DPg1y3lzzrE6lnB6umRQ/exec

var SHEET_NAME = "Actividad";
var SCRIPT_PROP = PropertiesService.getScriptProperties(); // propiedad de nuevo servicio

function doGet(e){
  return recibeData(e);
}

function doPost(e){
  return recibeData(e);
}

function recibeData(e) {
  // El lock service es para evitar escribir concurrentemente la misma Google sheet.
  // [1] http://googleappsdeveloper.blogspot.co.uk/2011/10/concurrency-and-google-apps-script.html
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);  // espera 30 segundos antes de estar derrotado.

  try {
    // next set where we write the data - you could write to multiple/alternate destinations
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var sheet = doc.getSheetByName(SHEET_NAME);
	var sheet2 = doc.getSheetByName("Inventario");
    // algunos valores importantes en parámetros
	var IdFBTC = e.parameter["Id"];
	var SaldoBTC = parseFloat(e.parameter["Btc"]);
	var SaldoPR = parseInt(e.parameter["Rp"]);
	var tienecaptcha = e.parameter["Status"]=="captcha";
	// otros parametros y variables
    var headRow = 1; // La primera fila es la de los ecabezados
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow()+1; // proxima fila
    var row = [];
	var compare_row = [];
    // Para cada campo (columna del encabezado) ...
    for (i in headers){
      if (headers[i] == "Timestamp"){ // esta es la fecha/hora
        row.push(new Date());
      } else { // utiliza el nombre en el encabezado para recuperar ese campo
        row.push(e.parameter[headers[i]]);
		compare_row.push(e.parameter[headers[i]]);
      }
    }
	var fila_nueva=compare_row.join();
	// busca alguna fila con el mismo ID, BTC, PR y Status . Si hay una igual, es un duplicado y no debe escribirse.
	// Por alguna razón, se escriben filas iguales con el mismo timestamp o con un timestamp que difiere por segundos.
	var duplicado=false;
	var data_hoja = sheet.getRange(2,2,sheet.getLastRow()-1,sheet.getLastColumn()-1).getValues();
	for (i in data_hoja) {
		if (data_hoja[i].join()==fila_nueva) {duplicado=true;}
	}
    // escribe los datos en la última fila de la hoja y actualiza el balance en la otra hoja
	if (!duplicado) {
		// escribe la fila en "Actividad"
		sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
		// busca la fila de esa cuenta en la hoja de inventario y actualiza la data si existe esa cuenta
		var cuentas=sheet2.getRange(2,1,sheet2.getLastRow()-1,1).getValues().join().split(',');
		var indice_cuenta=cuentas.indexOf(IdFBTC);
		if (indice_cuenta!=-1) {
            		var ahora=row[0];
			row=[];
			row.push(SaldoBTC);
			row.push(SaldoPR);
			if (tienecaptcha) {row.push("Si");} else {row.push("No");}
            		row.push(ahora);
 			sheet2.getRange(indice_cuenta+2,2,1,4).setValues([row]);
		}
	}
    // retorna resultados de exito JSONP
    return ContentService
          .createTextOutput(e.parameter.callback + "(" + JSON.stringify({"result":"success", "row": nextRow}) + ")" )
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch(e){
    // Si hay error ...
    return ContentService
          .createTextOutput(e.parameter.callback + "(" + JSON.stringify({"result":"error", "error": e}) + ");" )
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } finally { // libera el lock para que otros puedan acceder
    lock.releaseLock();
  }
}

function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty("key", doc.getId());
}
