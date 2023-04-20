var angleSlider = document.getElementById("angleSlider");
var velocitySlider = document.getElementById("velocitySlider");
var gravitySlider = document.getElementById("gravitySlider");

let gravity = 9.8; // Standard gravity = 9.80665 m/s^2 (rounded down to avoid 2 decimals)

angle = getAngleSlider();
velocity = getVelocitySlider();


angleSlider.oninput = function() {
	angle = this.value;
	document.getElementById("angleOut").innerHTML = this.value;
  previewLine();

}

velocitySlider.oninput = function() {
	velocity = this.value/10;
  document.getElementById("velocityOut").innerHTML = this.value/10;
  previewLine();

}

gravitySlider.oninput = function() {
	gravity = this.value/10;
  document.getElementById("gravityOut").innerHTML = this.value/10;
  console.log(gravity);
  previewLine();

}


let canvas = document.getElementById("drawcanvas");
let ctx = canvas.getContext("2d");
let ball_color = "#FF8000", ball_radius = 20;
let line_color = "#121212";

if (window.matchMedia) {
  // Check if the dark-mode Media-Query matches
  if(window.matchMedia('(prefers-color-scheme: dark)').matches){
    line_color = "#D2DADA";
  } else {
    // Light
  }
} else {
  // Default (when Media-Queries are not supported)
}


let cx = ctx.canvas.width, cy = ctx.canvas.height;
let bx = ball_radius, by = cy-ball_radius;
let default_velocity = 10, default_angle = 45; // 10 m/s and 45 deg
let increment = 15;

let initial_x=0, initial_y=0;

let elasticity_index = 0.6;
	let lang_index = 1;



let Vx, Vy;

let language_strings = [["Angle", "Velocity", "Gravity", "Time taken", "Final velocity", "Final position", "Maximum height"], ["Angle", "Velocitat", "Gravetat", "Temps trigat", "Velocitat final", "Posició final", "Altura màxima"], ["Angle", "Vitesse", "Gravité", "Temps pris", "Vitesse finale", "Position finale", "Hauteur maximale"], ["Ángulo", "Velocidad", "Gravedad", "Tiempo tardado", "Velocidad final", "Posición final", "Altura máxima"]];
let sliderNames = ["angle", "velocity", "gravity", "timetaken", "finalvelocity", "finalposition", "maximumheight"];

let languageNames =  ["Language: English", "Idioma: Català", "Langage: Français", "Idioma: Español"];


function drawBall(x, y, radius, color)
{
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.arc(x, y, radius, 0, 2*Math.PI); // Full circle
		ctx.stroke();
		//ctx.fill();
}

function setLanguage(index)
{
	let sliderDisplay = [];
	for(let i = 0; i < sliderNames.length; i++)
	{
		sliderDisplay[i] = document.getElementById(sliderNames[i] + "Disp");
		sliderDisplay[i].innerHTML = language_strings[lang_index][i];
	}
	document.getElementById("languageName").innerHTML = languageNames[lang_index];

}


function langIndex(index)
{
	console.log(index);
	lang_index = index;
	setLanguage(index);
}


function initCanvas(){
	setLanguage(lang_index);

	angleSlider.value = default_angle;
	velocitySlider.value = default_velocity*10;
	gravitySlider.value = gravity*10;
	startGame();
}

const resizeObserver = new ResizeObserver(() => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
});

resizeObserver.observe(canvas);

function round(num,dec)
{
    num = Math.round(num+'e'+dec)
    return Number(num+'e-'+dec)
}

function displayInformation(xf, vf, max_y, time_taken)
{
	document.getElementById("timetaken").innerHTML = round(time_taken, 2);
	document.getElementById("finalvelocity").innerHTML = round(vf, 2);
	document.getElementById("finalposition").innerHTML = round(xf, 2);
	document.getElementById("maximumheight").innerHTML = round(max_y, 2);
}

function previewLine()
{
  ctx.clearRect(0,0, cx, cy);
	angleRad = (angle/180) * Math.PI;
	ctx.strokeStyle = "#000000";
	ctx.moveTo(bx, by);
	//ctx.lineTo(bx+10*Vx, by-10*Vy);
	ctx.stroke();
	let resol = 10;
	if(velocity > resol)
	{
		resol = Math.round(velocity)+1;
	}
	resol += Math.round(gravity/4);

	launchBall(angle, velocity, ball_radius/increment+initial_x, initial_y, resol, increment, false, 0);
  drawBall(ball_radius, cy-ball_radius, ball_radius, ball_color);

}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function launchBall(angle, vel, x0, y0, steps, inc, showBall, bounceCount)
{


	let x=x0, y=y0;
	Vx = vel*Math.cos(angleRad), Vy = vel*Math.sin(angleRad);

	//console.log("Vx: " + Vx + " Vy: " + Vy + " Delta=" + (Math.pow(Vy, 2) - 2*gravity*y0));
	if(((vel > 0 && Vy > 0) || (angle == 0 && y0 > 0)) && x0*inc < cx)
	{
		ctx.strokeStyle = line_color;
		let endtime = (Vy+Math.sqrt(Math.pow(Vy, 2) + 2*gravity*y0))/gravity; // Calculate the end time
		/*
			We get the equation y = y0 +  v0y*t + 1/2*g*t^2

			After setting y to 0 we get a nice second degree equation, 1/2*g*t^2 + v0y*t + y0 = 0

			Solving for x by using the quadratic formula and simplyfing gives that expression

		*/
		let delta_time = endtime / steps; // After isolating from the equation
		let count = 0;
		//console.log('Launching ball with angle ' + angle + 'º, velocity ' + vel + ' m/s, gravity ' + gravity + ' m/s^2 and y0 ' + y0 + 'm');
		console.log("DT: " + delta_time + " ET: " + endtime + " STEPS: " + steps);
		let xf = x0 + Vx*endtime;

		let vf = Math.sqrt(Math.pow(Vy - gravity*endtime, 2) + Math.pow(Vx, 2));
		//console.log("Final velocity: " + vf);
		//console.log("Xf=" + xf);
		let time=0;

		let max_y = y0 + Math.pow(Vy, 2)/(2*gravity);
		ctx.moveTo(inc*x0, cy-inc*y0);
		for(let k = 0; k < endtime; k+= delta_time)
		{
			if((inc*x > cx) && count > 0)
			{
				break; // Don't process things that aren't rendered
			}
			ctx.moveTo(inc*x, cy-(inc*y));
			time += delta_time;

			x = x0 + Vx*time;
			y = y0 + Vy*time - Math.pow(time, 2)*gravity/2;
			if(inc*y <= cy)
			{
				ctx.lineTo(inc*x, cy-(inc*y));
				ctx.stroke();
			}

			count++;
			console.log("X: " + x + " Y: " + y + " Time: " + time + "\tEndtime: " + endtime);
			if(Math.abs(endtime - k) < 1e-8 || Math.abs(y) < 1e-8)
			{
				console.log("Break ok " + endtime + " " + k);
				break;
			}

		}
			
		
		if(bounceCount < 3)
		{
			if(showBall)
			{
				drawBall(xf*inc, cy-ball_radius, ball_radius, ball_color);
			} else {
				console.log("Current velocity: " + vel + "\nNew velocity: " + vel*
				elasticity_index);
				if(xf*inc < cx)
				{
					console.log("x*inc=", x*inc, "; cx=" + cx);
					launchBall(angle, vel*elasticity_index, x, 0, steps, inc, showBall, bounceCount+1); // y0 = 0 because it bounces with the ground (y = 0)

				}
			}
		}

		displayInformation(xf, vf, max_y, endtime);
	}
}


function startGame()
{
	previewLine();
	drawBall();
	document.addEventListener("keypress", function(event) {
	 if (event.keyCode == 32 || event.keyCode == 13) {

	    launchBall(angle, velocity, ball_radius/increment, 0, 200, 15, true, 0);
	  }
})


}


function getAngleSlider()
{
	return document.getElementById("angleOut").innerHTML;
}

function getVelocitySlider()
{
	return document.getElementById("velocityOut").innerHTML;
}