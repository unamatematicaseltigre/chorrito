// ==UserScript==
// @name         Robot DLV sin RP
// @version      1.49a
// @description  Sin bouncer ni canje de puntos RP
// @author       laurentum
// @match        https://freebitco.in/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/laurentum/chorrito/master/robot_obrero_a.js
// @downloadURL  https://raw.githubusercontent.com/laurentum/chorrito/master/robot_obrero_a.js
// ==/UserScript==

(function() {
	'use strict';

	var version="1.49a";

	// función para consultar tiempo restante hasta próximo roll
	function tiemporestante(){
		var tR={};
		tR.texto = $('title').text().replace("FreeBitco.in - Free Bitcoin Wallet, Faucet, Lottery and Dice!","");
		tR.texto = tR.texto.replace("- FreeBitco.in - Win free bitcoins every hour!", "");
		if (tR.texto!=="") {
			tR.minuto = parseInt(tR.texto.split(":")[0]);
			tR.seg = parseInt(tR.texto.split(":")[1]);
			tR.tiempo = tR.minuto*60+tR.seg;
		} else
			tR.tiempo = 0;
		return(tR.tiempo);
	}

	// función para reportar
	function Reportar(estatus) {
		estatus=encodeURIComponent(estatus);
		var parametros="Id="+userID+"&Btc="+balance_BTC+"&Rp="+balance_PR+"&Status="+estatus+"&Version="+version;
		peticion=$.ajax({
			crossDomain: true,	
        		url: "https://script.google.com/macros/s/AKfycbzrBiC5Of2eAGPxoLBVFqcQ6W9mTu0N9Y3b2JWCTLYoeZ2s6npG/exec?"+parametros,
			method : "GET",
        		dataType: "jsonp"
    		});
		// Callback handler en caso de éxito
		peticion.done(function (response, textStatus, jqXHR){
			// Pasa un mensaje a la consola
			if (response["fila"]!=-1) {			
				console.log("Escribiendo en la fila ",response["fila"]);
			} else {
				console.log("Maquina no está en mis registros");
			}
		});
	} // Reportar

	// Esta es la función principal que hace todo
	// Se ejecuta 2 seg después esperando los resultados del rebote
	
	function accion_principal() {
		body.prepend(
			$('<div/>').attr('style',"position:fixed;top:45px;left:0;z-index:999;width:300px;background-color:"+color_robot+";color: white; text-align: left;")
			.append(
				$('<div/>').attr('id','autochorrito')
				.append($('<p/>').attr('style','text-decoration:bold; text-align:center').text("( ͡° ͜ʖ ͡°) ╭∩╮  v."+version))
				.append($('<p/>').attr('style','text-decoration:bold; text-align:center').text("───────────────────────"))
				.append($('<p/>').text(userID))
				.append($('<p/>').text(acct_email))
				.append($('<p/>').text(estado))
				.append($('<p/>').text(estado_captcha))
			)
		).prepend($('<style/>').text("#autochorrito p { margin: 0; margin-left: 2px;  text-align: left; }"));
		// activa la rutina para que se ejecute repetidamente de manera asíncrona según condiciones:
		if (!hay_captcha & !bloqueo_ip & !timer_running) {	
			var timeout=Math.floor(Math.random() * 60 )*1000+2000; //timeout adicional entre 2 y 62 segundos
			if ($('#free_play_form_button').is(':visible')) {
				console.log("Cobrando el premio.");
				setTimeout(function(){ $('#free_play_form_button').click();},timeout);
			}
			setTimeout(function(){
				if ($('.close-reveal-modal').is(':visible')) {
					setTimeout(function(){$('.close-reveal-modal').click();},1000);
				}
			},timeout+12000); // cierra la ventana de dialogo pop-up 12 segundos despues de jugar el chorrito
			setTimeout(function(){location.reload(true);},timeout+3601000); //obliga a hacer un refrescamiento de la pagina en una hora
			Reportar(estatus_reporte); // manda el reporte cada hora
		} else {
			setTimeout(function(){location.reload();},3600000); // nos vemos en una hora.
			if (hay_captcha) estatus_reporte="Balance al día (captcha)";
			if (timer_running) estatus_reporte="Balance al día (timer running)";
			if (bloqueo_ip) estatus_reporte="Balance al día (bloqueo ip)";
			Reportar(estatus_reporte); // reportar cada hora de todas formas
		}
	} // accion_principal
	
	var estatus_reporte = "Balance a la hora";
	var body = $('body');
	// datos de esta cuenta
	var userID = (((document.getElementById('edit_tab')).getElementsByTagName('p')[0]).getElementsByTagName('span')[1]).innerHTML;
	userID = parseInt(userID);
	var balance_BTC = parseFloat(document.getElementById('balance').innerHTML);
	var balance_PR = parseInt($('.user_reward_points').text().replace(',',""));
	var acct_email=document.getElementById('edit_profile_form_email').value;
	var estado="Estoy despierto.";
	// verifica si hay captcha u otras condiciones
	var hay_captcha=($('#captchasnet_free_play_captcha').is(':visible'))||($('#free_play_recaptcha').is(':visible'));
	var timer_running=($("#multi_acct_same_ip").is(":visible"));
	var bloqueo_ip=$('#free_play_error').is(':visible');
	var estado_captcha="";
	var color_robot="#054908";
	if (hay_captcha) {estado_captcha="¡Maldita captcha! Reportando a mi amo..."; color_robot="#a40000";}
	if (timer_running) {estado_captcha="El reloj está corriendo. Reportando a mi amo..."; color_robot="#a40000";}
	if (!timer_running & !hay_captcha & !bloqueo_ip) {
		estado_captcha="Voy a cobrar el chorrito.";
	}
	setTimeout(accion_principal,2000); // espera 2 seg para ver si está autorizado o no y ejecuta el resto.
})();
