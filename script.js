var angleSlider = document.getElementById("angleSlider");
var velocitySlider = document.getElementById("velocitySlider");
var gravitySlider = document.getElementById("gravitySlider");
var restitutionCoefSlider = document.getElementById("restitutionCoefSlider");
var initialHeightSlider = document.getElementById("initialHeightSlider");


let gravity = 9.8; // Standard gravity = 9.80665 m/s^2 (rounded down to avoid 2 decimals)
let elasticity_index = 0.6;
let initial_x = 0, initial_y = 10;

angle = getAngleSlider();
velocity = getVelocitySlider();

angleSlider.oninput = function () {
  angle = this.value;
  document.getElementById("angleOut").innerHTML = this.value;
  previewLine();
};

velocitySlider.oninput = function () {
  velocity = this.value / 10;
  document.getElementById("velocityOut").innerHTML = this.value / 10;
  previewLine();
};

gravitySlider.oninput = function () {
  gravity = this.value / 10;
  document.getElementById("gravityOut").innerHTML = this.value / 10;
  console.log(gravity);
  previewLine();
};

restitutionCoefSlider.oninput = function () {
  elasticity_index = this.value / 100;
  document.getElementById("restitutionCoefOut").innerHTML = this.value / 100;
  console.log(gravity);
  previewLine();
};

initialHeightSlider.oninput = function () {
  initial_y = this.value / 10;
  document.getElementById("initialHeightOut").innerHTML = this.value / 10;
  console.log(initial_y);
  previewLine();
};



let canvas = document.getElementById("drawcanvas");
let ctx = canvas.getContext("2d");
let ball_color = "#7A0222",  ball_radius = 14;
let line_color = "#1DEFD2";
line_color = "#46a9bf";

let FPS = 60;

/* if (window.matchMedia) {
  // Check if the dark-mode Media-Query matches
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    line_color = "#C2CACA";
  }
} else {
  // Default (when Media-Queries are not supported)
} */

let cx = ctx.canvas.width,
  cy = ctx.canvas.height;
let bx = ball_radius,
  by = cy - ball_radius;
let default_velocity = 10,
  default_angle = 45; // 10 m/s and 45 deg
let increment = 15;


let lang_index = 1;

let Vx, Vy;

let language_strings = [
  [
    "Angle",
    "Velocity",
    "Gravity",
    "Restitution coefficient",
    "Initial height",
    "Time taken",
    "Final velocity",
    "Final position",
    "Maximum height",
  ],
  [
    "Angle",
    "Velocitat",
    "Gravetat",
    "Coeficient de restitució",
    "Alçada inicial",
    "Temps trigat",
    "Velocitat final",
    "Posició final",
    "Altura màxima",
  ],
  [
    "Angle",
    "Vitesse",
    "Gravité",
    "Coefficient de restitution",
    "Hauteur initiale",
    "Temps pris",
    "Vitesse finale",
    "Position finale",
    "Hauteur maximale",
  ],
  [
    "Ángulo",
    "Velocidad",
    "Gravedad",
    "Coeficiente de restitución",
    "Altura inicial",
    "Tiempo tardado",
    "Velocidad final",
    "Posición final",
    "Altura máxima",
  ],
];

let sliderNames = [
  "angle",
  "velocity",
  "gravity",
  "restitutionCoef",
  "initialHeight",
  "timetaken",
  "finalvelocity",
  "finalposition",
  "maximumheight",
];

let langNames = ["en", "ca", "fr", "es"];


function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "Expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";Path=/;SameSite=Lax";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

function drawBall(x, y, radius, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.arc(x, y, radius, 0, 2 * Math.PI); // Full circle
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

function setLanguage(index) {
  let sliderDisplay = new Array();
  for (let i = 0; i < sliderNames.length; i++) {
    console.log(sliderNames[i] + "Disp");
    console.log(sliderNames.length);
    document.getElementById(sliderNames[i] + "Disp").innerHTML =
      language_strings[lang_index][i];
  }
  setCookie("default_language", langNames[index], 365);

  for(let i = 0; i < langNames.length; i++)
  {
    document.getElementById(langNames[i] + "lang").style.color = (i == index) ? "#08e4d3" : "#11b78b";
  }
}

function langIndex(index) {
  lang_index = index;
  setLanguage(index);
}

function initCanvas() {
  let cookieLanguage = getCookie("default_language");
  if(getCookie == null)
  {
    lang_index = 0;
    setCookie("default_language", langNames[lang_index], 365);
  }  else {
    for(let i = 0; i < langNames.length; i++)
    {
      if(langNames[i] == cookieLanguage)
      {
        lang_index = i;
        break;
      }
    }
  }
  setLanguage(lang_index);

  angleSlider.value = default_angle;
  velocitySlider.value = default_velocity * 10;
  gravitySlider.value = gravity * 10;
  restitutionCoefSlider.value = elasticity_index * 100;
  initialHeightSlider.value = initial_y*10;
  startGame();
  previewLine();
}

const resizeObserver = new ResizeObserver(() => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
});

resizeObserver.observe(canvas);

function round(num, dec) {
  num = Math.round(num + "e" + dec);
  return Number(num + "e-" + dec);
}

function displayInformation(xf, vf, max_y, time_taken) {
  document.getElementById("timetaken").innerHTML = round(time_taken, 2);
  document.getElementById("finalvelocity").innerHTML = round(vf, 2);
  document.getElementById("finalposition").innerHTML = round(xf, 2);
  document.getElementById("maximumheight").innerHTML = round(max_y, 2);
}

function previewLine() {
  ctx.clearRect(0, 0, cx, cy);
  ctx.strokeStyle = "#000000";
  ctx.save();
  ctx.moveTo(bx, by);
  //ctx.lineTo(bx+10*Vx, by-10*Vy);
  ctx.stroke();
  let resol = 15 + Math.round(velocity) + Math.round(4 / gravity);

  launchBall(
    angle,
    velocity,
    ball_radius / increment + initial_x,
    initial_y,
    resol,
    increment,
    false,
    0
  );
  ctx.restore();
  drawBall(ball_radius, cy - ball_radius-initial_y*increment, ball_radius, ball_color);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let sizeMultiplier = 0;

function launchBall(angle_launch, vel, x0, y0, steps, inc, showBall, bounceCount) {
  steps = Math.round(steps); // If steps are decimal, it will cause displaying issues
  let x = x0, y = y0;
    angleRad = (angle_launch / 180) * Math.PI;

  (Vx = vel * Math.cos(angleRad)), (Vy = vel * Math.sin(angleRad));
  ctx.beginPath();
  //console.log("Vx: " + Vx + " Vy: " + Vy + " Delta=" + (Math.pow(Vy, 2) - 2*gravity*y0));
  if (((vel > 0 && Vy > 0) || (angle_launch == 0 && y0 > 0)) && x0 * inc < cx) {
    ctx.strokeStyle = line_color;
    let endtime =
      (Vy + Math.sqrt(Math.pow(Vy, 2) + 2 * gravity * y0)) / gravity; // Calculate the end time
    /*
			We get the equation y = y0 +  v0y*t + 1/2*g*t^2

			After setting y to 0 we get a nice second degree equation, 1/2*g*t^2 + v0y*t + y0 = 0

			Solving for x by using the quadratic formula and simplyfing gives that expression

		*/
    let delta_time = endtime / steps; // After isolating from the equation
    let count = 0;
    //console.log('Launching ball with angle ' + angle_launch + 'º, velocity ' + vel + ' m/s, gravity ' + gravity + ' m/s^2 and y0 ' + y0 + 'm');
    let xf = x0 + Vx * endtime;

    let vf = Math.sqrt(Math.pow(Vy - gravity * endtime, 2) + Math.pow(Vx, 2));
    let time = 0;

    let max_y = y0 + Math.pow(Vy, 2) / (2 * gravity);
    ctx.moveTo(inc * x0, cy - inc * y0);
    for (let k = 0; k < endtime; k += delta_time) {
      /*if((inc*x > cx) && inc*y > cy && count > 1)
			{
				break; // Don't process things that aren't rendered
			}*/
      ctx.moveTo(inc * x, cy - inc * y);
      time += delta_time;

      x = x0 + Vx * time;
      y = y0 + Vy * time - (Math.pow(time, 2) * gravity) / 2;
      //if(inc*(y+1) <= cy || count < 2)
      {
        ctx.lineTo(inc * x, cy - inc * y);
        ctx.stroke();
      }

      count++;
	  if(showBall)
	  {
		sizeMultiplier = (xf-x0)/(Vx*duration/1000+Math.pow(duration/1000, 2));

	  }
      if (Math.abs(endtime - k) < 1e-8 || Math.abs(y) < 1e-8) {
        break;
      }
    }

    if (bounceCount < 3 || (vf * elasticity_index) / gravity > 0.2) {
      if (showBall) {
        drawBall(xf * inc, cy - ball_radius-initial_y*increment, ball_radius, ball_color);
      } else {
        if (xf * inc < cx && vf > 1) {
          if(bounceCount == 0)
          {
                      console.log("Sense rectificació: " + angle_launch);
          angle_launch = 180*Math.abs(Math.atan2(Vy-gravity*endtime, Vx))/Math.PI;

          console.log("Amb rectificació: " + angle_launch);
          }

          launchBall(
            angle_launch,
            vf * elasticity_index,
            x,
            0,
            steps * elasticity_index,
            inc,
            showBall,
            ++bounceCount
          ); // y0 = 0 because it bounces with the ground (y = 0)
        }
      }
    }

    displayInformation(xf, vf, max_y, endtime);
  }
  ctx.closePath();
}

function animateBall(time, speed, x0, xf, y0, yf, x_acc, y_acc)
{

}

function startGame() {
  previewLine();
  drawBall(ball_radius, cy - ball_radius-initial_y*increment, ball_radius, ball_color);
  document.addEventListener("keypress", function (event) {
    if (
      event.key == " " ||
      event.key == "Enter" ||
      event.keyCode == 32 ||
      event.keyCode == 13
    ) {
      launchBall(angle, velocity, ball_radius / increment, 0, 200, 15, true, 0);
    }
  });
}

function getAngleSlider() {
  return document.getElementById("angleOut").innerHTML;
}

function getVelocitySlider() {
  return document.getElementById("velocityOut").innerHTML;
}
