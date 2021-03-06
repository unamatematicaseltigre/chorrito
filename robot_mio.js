// ==UserScript==
// @name         Robot para el chorrito
// @version      1.16
// @description  Este robot activa los bonos, cobra el chorrito cada hora y apuesta. Esta es para mis apuestas PELIGROSAS (martingala). Simula estar despierto 21.45 horas al día.
// @author       laurentum
// @match        https://freebitco.in/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/laurentum/chorrito/master/robot_mio.js
// @downloadURL  https://raw.githubusercontent.com/laurentum/chorrito/master/robot_mio.js
// ==/UserScript==

(function() {
	'use strict';

	var version="1.16";

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
		var userID = (((document.getElementById('edit_tab')).getElementsByTagName('p')[0]).getElementsByTagName('span')[1]).innerHTML;
		var balance_BTC = parseFloat(document.getElementById('balance').innerHTML);
		var balance_PR = parseInt($('.user_reward_points').text().replace(',',""));
		estatus=estatus.replace(' ','%20');
		var parametros="Id="+userID+"&Btc="+balance_BTC+"&Rp="+balance_PR+"&Status="+estatus+"&Version="+version;
		$.ajax({
			crossDomain: true,	
        	url: "https://script.google.com/macros/s/AKfycbzYjk5fPj2IBAIVTQ17WfoF7Go-Ct6DPg1y3lzzrE6lnB6umRQ/exec?"+parametros,
			method : "GET",
        	dataType: "jsonp"
    	});
	}

	// premios es un objeto con una función para activar bonos para
	// acrecentar rápidamente los puntos reward y cobrar el bono
	// de aumento al premio por lanzamiento cada hora cuando tengas suficientes puntos.
	var premios = {};
	premios.rutina = function() {
        premios.puntos = parseInt($('.user_reward_points').text().replace(',',""));
        premios.temporizadorbono = {};
        if ($("#bonus_container_free_points").length !== 0) {
            premios.temporizadorbono.texto = $('#bonus_span_free_points').text();
            premios.temporizadorbono.hora = parseInt(premios.temporizadorbono.texto.split(":")[0]);
            premios.temporizadorbono.minuto = parseInt(premios.temporizadorbono.texto.split(":")[1]);
            premios.temporizadorbono.segundo = parseInt(premios.temporizadorbono.texto.split(":")[2]);
            premios.temporizadorbono.actual = premios.temporizadorbono.hora * 3600 + premios.temporizadorbono.minuto * 60 + premios.temporizadorbono.segundo;
        } else
            premios.temporizadorbono.actual = 0;
        if (premios.temporizadorbono.actual === 0 & tiemporestante()===0) {
			if (premios.puntos>8000) {
				Reportar("Activando los bonos de 100RP + 1000% por lanzamiento.");
				RedeemRPProduct('free_points_100');
				RedeemRPProduct('fp_bonus_1000');
			}
			else if (premios.puntos>5800) {
				Reportar("Activando los bonos de 100RP + 500% por lanzamiento.");
				RedeemRPProduct('free_points_100');
				RedeemRPProduct('fp_bonus_500');
			}
			else if (premios.puntos>5000) {
				Reportar("Activando los bonos de 100RP + 100% por lanzamiento.");
				RedeemRPProduct('free_points_100');
				RedeemRPProduct('fp_bonus_100');
			}
			else if (premios.puntos>1200) {
				Reportar("Activando el bono de 100RP por lanzamiento.");
				RedeemRPProduct('free_points_100');
			}
			else if (premios.puntos>600) {
				Reportar("Activando el bono de 50RP por lanzamiento.");
				RedeemRPProduct('free_points_50');
			}
			else if (premios.puntos>120) {
				Reportar("Activando el bono de 10RP por lanzamiento.");
				RedeemRPProduct('free_points_10');
			}
			else if (premios.puntos>20) {
				Reportar("Activando el bono de 1RP por lanzamiento.");
				RedeemRPProduct('free_points_1');
			}
		}
	};
	// apostador es la rutina de apostar
	var apostador={};
	apostador.rutina = function() {
		var saldoBTC = parseFloat(document.getElementById('balance').innerHTML);
		if (tiemporestante()>300 & saldoBTC>0.009) {	//apuesta sólo si queda tiempo suficiente y hay fuerza (saldo>0.009 BTC)
			document.getElementById("autobet_lose_return_to_base").checked=false;
			document.getElementById("autobet_lose_increase_bet").checked=true;
			document.getElementById("autobet_lose_increase_bet_percent").value="110";
			document.getElementById("autobet_roll_count").value="2000";
			document.getElementById("stop_after_profit").checked=true;
			document.getElementById("stop_after_profit_value").value="0.00000020";
			document.getElementById("autobet_change_client_seed").checked=true;
			$("#start_autobet").click();
		}
	};

	var body = $('body');	
	// verifica si el tipo esta despierto para operar el chorrito
	// (en promedio este robot trabaja 21.45 horas al dia)
	var umbral=1.0;
	var hora_actual=new Date();
	hora_actual=hora_actual.getHours();
	if (hora_actual<4) {umbral=0.6;}
	else if (hora_actual<7) {umbral=0.95;}
	else if (hora_actual<12) {umbral=0.99;}
	else if (hora_actual<14) {umbral=0.95;}
	else if (hora_actual<19) {umbral=0.99;}
	else if (hora_actual<23) {umbral=0.95;}
	else umbral=0.6;
	var despierto=Math.random()<umbral;
	var estado="";
	if (despierto) {estado="Estoy despierto.";}
	else {estado="Estoy dormido.";}
	// verifica si hay captcha
	var hay_captcha=$('#captchasnet_free_play_captcha').is(':visible');
	var estado_captcha="";
	var color_robot="#054908";
	if (hay_captcha) {estado_captcha="¡Maldita captcha! Reportando a mi amo..."; color_robot="#a40000";}
	else {
		if (despierto) {
			estado_captcha="Voy a cobrar el chorrito";
			if ($("#bonus_container_free_points").length !== 0) {estado_captcha+=".";}
			else {estado_captcha+=" y también voy a activar bonos (si tengo suficientes RP).";}
		} else {
			estado_captcha="No hago un coño.";
		}
	}
    body.prepend(
        $('<div/>').attr('style',"position:fixed;top:45px;left:0;z-index:999;width:300px;background-color:"+color_robot+";color: white; text-align: left;")
            .append(
                $('<div/>').attr('id','autofaucet')
					.append($('<p/>').attr('style','text-decoration:bold; text-align:center').text("( ͡° ͜ʖ ͡°) ╭∩╮  V."+version))
					.append($('<p/>').attr('style','text-decoration:bold; text-align:center').text("───────────────────────"))
                    .append($('<p/>').text(estado))
                    .append($('<p/>').text(estado_captcha))
            )
    ).prepend($('<style/>').text("#autofaucet p { margin: 0; margin-left: 2px;  text-align: left; }"));

	// activa la rutina para que se ejecute repetidamente de manera asíncrona según condiciones:
	if (despierto & !hay_captcha) {	
    	setTimeout(premios.rutina,1000);  // activar los bonos en un segundo (si aplica)
		setInterval(apostador.rutina,180000); // apostar cada 3 minutos
		// Luego de activar bonos, cobra el chorrito cuando sea posible.
		// El cobro del chorrito se hace aproximadamente cada hora, con tiempos 
		// de inter-cobro aleatorios para no levantar sospechas.
		var timeout=Math.floor(Math.random() * 60 )*1000+2000; //timeout adicional entre 2 y 62 segundos
   		if ($('#free_play_form_button').is(':visible')) {
			console.log("Cobrando el premios.");
   			setTimeout(function(){ $('#free_play_form_button').click();},timeout);
		}
   		setTimeout(function(){
			if ($('.close-reveal-modal').is(':visible')) {
				setTimeout(function(){$('.close-reveal-modal').click();},1000);
				// setTimeout(function(){$('#double_your_btc_link').click();},2000);
				// setTimeout(function(){$('#auto_bet_on').click();},3000);
				// setTimeout(function(){$('#show_double_your_btc_auto_bet_on_lose').click();},4000);
			}
		},timeout+12000); // cierra la ventana de dialogo pop-up 10 segundos despues de jugar el chorrito
		if (hora_actual==12) {Reportar("Balance al día");} // manda el reporte diario a las 12 del mediodía.
	} else {
		setTimeout(function(){location.reload();},3600000); // nos vemos en una hora.
		if (hora_actual==12) {	// manda el reporte diario a las 12 del mediodía.
			if (hay_captcha) {
				Reportar("Balance al día (captcha)");
			} else {Reportar("Balance al día.");}
		} else
			if (hay_captcha) {Reportar("captcha");} // reporta el problema
	}
})();
