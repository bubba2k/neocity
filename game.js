const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

function randomIntRange(floor, ceiling)
{
	var random = Math.random() * (ceiling - floor) + floor;

	return Math.round(random);
}

// Vector class
class vec2
{
	constructor(argX = 0, argY = 0)
	{
		this.x = argX;
		this.y = argY;
	}

	magnitude()
	{
		return Math.sqrt( Math.pow(this.x, 2) + Math.pow(this.y, 2) );
	}

	distVec(argVec)
	{
		var distVec = new vec2;

		distVec.x = argVec.x - this.x;
		distVec.y = argVec.y - this.y;

		return distVec;
	}

	scale(argScale)
	{
		var result = new vec2;

		result.x = this.x * argScale;
		result.y = this.y * argScale;

		return result;
	}

	add(arg)
	{
		var result = new vec2;

		result.x = this.x + arg.x;
		result.y = this.y + arg.y;

		return result;
	}

	sub(arg)
	{
		var result = new vec2;

		result.x = this.x - arg.x;
		result.y = this.y - arg.y;

		return result;
	}
}

// Track mouse position
var mousePos = new vec2(0, 0);

function getMousePos(canvas, evt)
{
	var rect = canvas.getBoundingClientRect();
	
	mousePos.x = evt.clientX - rect.left,
	mousePos.y = evt.clientY - rect.top
}

canvas.addEventListener('mousemove',
	function(evt)
	{
		getMousePos(canvas, evt);
	}, false);

// Load the sprites
let images = [];
for(var i = 0; i < 24; i++)
{
	images[i] = new Image;

	if(i < 10)
	{
		number = "0" + i.toString();
	}
	else
	{
		number = i.toString();
	}

	images[i].src = "./spheres/sphere-" + number + ".png";
}

const gravity_constant = new vec2(0, 9.81);

class Ball
{
	constructor(bSpawnAtCursor = true)
	{
		this.pos = new vec2(mousePos.x , mousePos.y + 1);

		if(bSpawnAtCursor == false)
		{
			this.pos.x = randomIntRange(50, canvas.width - 50);
			this.pos.y = randomIntRange(50, canvas.height - 50);
		}

		this.vel = new vec2(5, 1);

		this.sprite = images[randomIntRange(0, 23)];

		this.radius = randomIntRange(10, 40);

		this.verticalLock = false;
	}

	update(delta_t)
	{
		// apply velocity
		this.pos = this.pos.add(this.vel.scale(delta_t));

		// check for collisions
		var hasCollidedX = false;
		var hasCollidedY = false;
		if(this.pos.x > canvas.width - this.radius)
		{
			this.pos.x = canvas.width - this.radius;

			this.vel.x = -this.vel.x;

			hasCollidedX = true;
		}
		else if(this.pos.x < 0 + this.radius)
		{
			this.pos.x = 0 + this.radius;

			this.vel.x = -this.vel.x;

			hasCollidedX = true;
		}

		if(this.pos.y > canvas.height - this.radius)
		{
			this.pos.y = canvas.height - this.radius;
			this.vel.y = -this.vel.y;

			hasCollidedY = true;
		}
		else if(this.pos.y < 0 + this.radius)
		{
			this.pos.y = 0 + this.radius;
			this.vel.y = -this.vel.y;

			hasCollidedY = true;
		}

		// accelerate away from cursor
		var diff = mousePos.distVec(this.pos);
		if(diff.magnitude() > 100)
		{
			acceleration = new vec2(0,0);
		}
		else
		{
			var acceleration = diff.scale(300 / diff.magnitude());
			acceleration = acceleration.scale(1.4);
			acceleration.y *= 1.15;
		}

		this.vel = this.vel.add(acceleration.scale(delta_t));
		
		// apply gravity
		var gravity = gravity_constant.scale(this.radius);
		this.vel = this.vel.add(gravity.scale(delta_t));

		// decelerate through drag
		var deceleration = this.vel.scale(0.1);
		this.vel = this.vel.sub(deceleration.scale(delta_t));

		if(hasCollidedX)
		{
			this.vel.x *= 0.7;
			this.vel.y *= 0.9;
		}
		if(hasCollidedY)
		{
			this.vel.y *= 0.7;
			this.vel.x *= 0.99;
		}
	}

	draw()
	{
		ctx.drawImage(this.sprite, this.pos.x - this.radius, this.pos.y - this.radius,
					  this.radius * 2, this.radius * 2);
	}
};

let balls = [];

for(var i = 0; i < 5; i++)
{
	balls.push(new Ball(false));
}

// Mouse click callback
canvas.addEventListener('click',
	function(evt)
	{
		balls.push(new Ball);
	}, false);


var delay = 20;
setInterval(function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	balls.forEach(function(ball)
	{
		ball.update(delay / 1000);
		ball.draw();
	});
}, delay);
