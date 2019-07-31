"use strict"

class PartOfSnake { // square (side on side)
	constructor(x, y) {
		this.x = x; // current coordinate (0..24)
		this.y = y; // current coordinate (0..24)
		
		this.previousX = x;
		this.previousY = y;
	}
}

var snake = []; // array of PartOfSnake

const side = 30; // length of the side of the snake part

const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;
var direction; // UP/RIGHT/DOWN/LEFT

var directionChanged; // permission for change direction

var foodX; // current coordinate of food
var foodY; // current coordinate of food

var score;
var startReset = true; // true = start/false = reset

const BACKGROUND_COLOR = "White";
const BORDER_COLOR = "Black";

var bestScore = document.getElementById("bestScore");
var button = document.getElementById("startReset");
var currentScore = document.getElementById("currentScore");
var context = document.getElementById("field").getContext("2d");
var timer;

// return the value of cookie with name "name" (or undefined if it doesn't exist)
function getCookie(name) {
	var cookies = document.cookie.split("; ");

	for (var i = 0; i < cookies.length; i++) {
		var strings = cookies[i].split("=");
		if (strings[0] == name) return strings[1];
	}
  
  return undefined;
}

// set new cookie / change value existing cookie / delete cookie (expires: -1)
// expires in days
function setCookie(name, value, options) {
	options = options || {};

	var expires = options.expires;

	if (typeof expires == "number" && expires) {
		var date = new Date();
		date.setDate(date.getDate() + expires);
		expires = options.expires = date;
	}
  
	if (expires && expires.toUTCString)
		options.expires = expires.toUTCString();

	var updatedCookie = name + "=" + encodeURIComponent(value);

	for (var propName in options) {
		updatedCookie += "; " + propName;
		var propValue = options[propName];
		if (propValue !== true)
			updatedCookie += "=" + propValue;
	}

	document.cookie = updatedCookie;
}

function reset() {
	var scoreFromCookie = getCookie("bestScore") ;
	if (typeof scoreFromCookie == "string")
		bestScore.value = "Best: " + scoreFromCookie;

	// draw border
	context.beginPath();
	context.strokeStyle = BORDER_COLOR;
	context.lineWidth = 4;
	context.strokeRect(1, 1, 756, 756);

	// draw background
	context.fillStyle = BACKGROUND_COLOR;
	context.fillRect(3, 3, 753, 753);
	context.closePath();
	
	// default snake
	snake.length = 0;
	snake.push(new PartOfSnake(2, 0));
	snake.push(new PartOfSnake(1, 0));
	snake.push(new PartOfSnake(0, 0));
	
	direction = RIGHT;
	directionChanged = true;
	score = 0;
	
	drawSnake();
	currentScore.value = score;
}

function drawSnake() {
	drawFace();
	
	for (var i = 1; i < snake.length; i++) {
		context.beginPath();
		context.fillStyle = "SteelBlue";
		context.fillRect(4 + snake[i].x * side, 4 + snake[i].y * side, side, side);
		context.fillStyle = "DarkBlue";
		context.fillRect(11 + snake[i].x * side, 11 + snake[i].y * side, side - 14, side - 14);
		context.closePath();		
	}
}

function drawFace() {
	context.beginPath();
	switch (direction) {
		case UP: {
			context.fillStyle = "DarkTurquoise";
			context.fillRect(4 + snake[0].x * side, 4 + snake[0].y * side + side / 2, side, side / 2);
			context.arc(4 + snake[0].x * side + side / 2, 4 + snake[0].y * side + side / 2, side / 2, 0, Math.PI, true);
			context.fill();
			
			break;
		}
		case RIGHT: {
			context.fillStyle = "DarkTurquoise";
			context.fillRect(4 + snake[0].x * side, 4 + snake[0].y * side, side / 2, side);
			context.arc(4 + snake[0].x * side + side / 2, 4 + snake[0].y * side + side / 2, side / 2, 1.5 * Math.PI, 0.5 * Math.PI);
			context.fill();
			
			break;
		}
		case DOWN: {
			context.fillStyle = "DarkTurquoise";
			context.fillRect(4 + snake[0].x * side, 4 + snake[0].y * side, side, side / 2);
			context.arc(4 + snake[0].x * side + side / 2, 4 + snake[0].y * side + side / 2, side / 2, 0, Math.PI);
			context.fill();
			
			break;
		}
		case LEFT: {
			context.fillStyle = "DarkTurquoise";
			context.fillRect(4 + snake[0].x * side + side / 2, 4 + snake[0].y * side, side / 2, side);
			context.arc(4 + snake[0].x * side + side / 2, 4 + snake[0].y * side + side / 2, side / 2, 0.5 * Math.PI, 1.5 * Math.PI);
			context.fill();
			
			break;
		}
	}
	context.closePath();
	
	// draw red eye
	context.beginPath();
	context.arc(4 + snake[0].x * side + side / 2, 4 + snake[0].y * side + side / 3, 4, 0, 2 * Math.PI);
	context.fillStyle = "Red";
	context.fill();
	context.closePath();
}

function start() {
	if (startReset) {
		button.textContent = "Reset";
		setFood();
		timer = setInterval("animation();", 150); // delay = 150 milliseconds
		
		startReset = false;
	}
	else {
		button.textContent = "Start";
		clearInterval(timer);
		setBestScoreToCookie();
		reset();
		
		startReset = true;
	}
}

function setFood() {
	var emptySquares = [];
	for (var i = 0; i < 625; i++) {
		var tmpX = i % 25;
		var tmpY = Math.floor(i / 25);
		
		var fl = true;
		for (var j = 0; j < snake.length; j++)
			if (snake[j].x == tmpX && snake[j].y == tmpY) {
				fl = false;
				break;
			}
		
		if (fl) emptySquares.push(i);
	}
	
	if (emptySquares.length == 0) gameOver(true);
	
	var randomInt = getRandomInt(0, emptySquares.length - 1);
	foodX = emptySquares[randomInt] % 25;
	foodY = Math.floor(emptySquares[randomInt] / 25);
	
	drawFood();
}

function setBestScoreToCookie() {
	var bestScoreInt = Number(bestScore.value.split(" ")[1]) || 0;
	if (score > bestScoreInt) setCookie("bestScore", score, { expires: 365 });
}

function drawFood() {
	context.beginPath();
	context.fillStyle = "Green";
	context.arc(4 + foodX * side + side / 2, 4 + foodY * side + side / 2, side / 2, 0, 2 * Math.PI);
	context.fill();	
	context.closePath();
	
	context.beginPath();
	context.fillStyle = "Yellow";
	context.arc(4 + foodX * side + side / 2.5, 4 + foodY * side + side / 2.5, side / 8, 0, 2 * Math.PI);
	context.fill();
	context.closePath();
	
	context.beginPath();
	context.fillStyle = "Red";
	context.arc(4 + foodX * side + side / 1.5, 4 + foodY * side + side / 1.5, side / 8, 0, 2 * Math.PI);
	context.fill();	
	context.closePath();
}

//random int from min to max (inclusive min and max)
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function animation() {
	makeNextMove();
	if (crash())
		gameOver(false);
	else
		redrawSnake();
}

function makeNextMove() {
	directionChanged = false;
	
	snake[0].previousY = snake[0].y;
	snake[0].previousX = snake[0].x;
	
	switch (direction) {
		case UP: {
			snake[0].y -= 1;
			break;
		}
		case RIGHT: {
			snake[0].x += 1;
			break;
		}
		case DOWN: {
			snake[0].y += 1;
			break;
		}
		case LEFT: {
			snake[0].x -= 1;
			break;
		}
	}
	
	for (var i = 1; i < snake.length; i++) {
		snake[i].previousX = snake[i].x;
		snake[i].previousY = snake[i].y;
		
		snake[i].x = snake[i - 1].previousX;
		snake[i].y = snake[i - 1].previousY;
	}
	
	// checking for food
	if (snake[0].x == foodX && snake[0].y == foodY) {
		snake.push(new PartOfSnake(snake[snake.length - 1].previousX, snake[snake.length - 1].previousY));
		currentScore.value = ++score;
		setFood();
	}
}

// crash = true
function crash() {
	// collision with border
	if (snake[0].x < 0 || snake[0].y < 0 || snake[0].x > 24 || snake[0].y > 24)
		return true;
	
	// collision with body of snake
	for (var i = 1; i < snake.length; i++)
		if (snake[0].y == snake[i].y && snake[0].x == snake[i].x) return true;
	
	return false;
}

// redraw snake[0] (face), snake[1], snake[snake.length - 1]
function redrawSnake() {
	drawFace();

	context.beginPath();
	context.fillStyle = "SteelBlue";
	context.fillRect(4 + snake[1].x * side, 4 + snake[1].y * side, side, side);
	context.fillStyle = "DarkBlue";
	context.fillRect(11 + snake[1].x * side, 11 + snake[1].y * side, side - 14, side - 14);
	context.closePath();
	
	context.beginPath();
	context.fillStyle = BACKGROUND_COLOR;
	context.fillRect(4 + snake[snake.length - 1].previousX * side, 4 + snake[snake.length - 1].previousY * side, side, side);
	context.closePath();
}

function gameOver(mode) {
	clearInterval(timer); // stop timer
	setBestScoreToCookie();
	
	if (mode)
		currentScore.value = currentScore.value + " - Win";
	else
		currentScore.value = currentScore.value + " - Game Over";
}

function goUp() {
	if (!directionChanged)
		if (direction == RIGHT || direction == LEFT) {
			direction = UP;
			directionChanged = true;
		}
}

function goLeft() {
	if (!directionChanged)
		if (direction == UP || direction == DOWN) {
			direction = LEFT;
			directionChanged = true;
		}
}

function goRight() {
	if (startReset) { 
		start();
		directionChanged = false;
	}

	if (!directionChanged)
		if (direction == UP || direction == DOWN) {
			direction = RIGHT;
			directionChanged = true;
		}
}

function goDown() {
	if (startReset) {
		start();
		directionChanged = false;
	}
        	
	if (!directionChanged)
		if (direction == RIGHT || direction == LEFT) {
			direction = DOWN;
			directionChanged = true;
		}
}

// management of snake by keys with arrows
document.onkeydown = function(e) {
	switch (e.keyCode) {
        case 37: // arrow left
			goLeft();
            break;
            
        case 38: // arrow up
			goUp();
            break;
            
        case 39: // arrow right
			goRight();
            break;
            
        case 40: // arrow down
			goDown();
            break;
    }
};

// management of snake by touch screen
window.addEventListener("load", function() {
	document.addEventListener("touchstart", touch, false);}, false);

function touch(event) {
    if (direction == RIGHT || direction == LEFT) {
    	if (event.touches[0].screenY < snake[0].y * side)
    		goUp();
    	else
    		goDown();
    } else {
    	if (event.touches[0].screenX < snake[0].x * side)
    		goLeft();
    	else
    		goRight();
    }
}