var canvas = document.getElementById('dla')

console.log(canvas)

var context = canvas.getContext('2d')

// Draw circle
var widthScreen = 500
var heightScreen = 500

canvas.width = widthScreen
canvas.height = heightScreen

var xpos =  widthScreen / 2
var ypos = heightScreen / 2
var defaultRadiusCircle = 1



class Particle {
	constructor(context, x, y, radius, color, bias){
		this.context = context;
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.bias = bias;
	}

	distanceO(pos){
		return Math.sqrt(pos[0] ** 2 + pos[1] ** 2);
	}

	setRandomGenPosition(radiusGen){
		var angle = Math.random() * 2 * Math.PI;
		this.x = radiusGen * Math.cos(angle);
		this.y = radiusGen * Math.sin(angle);
	}

	diffusion(radiusStep){
		var dx = (Math.random() * 2 - 1 )* radiusStep;
		var dy = (Math.random() * 2 - 1 )* radiusStep;
		if(this.bias == 0){
			this.x = this.x + dx;
			this.y = this.y + dy;
		}else{
			var dis = this.distanceO([this.x, this.y]);
			this.x = this.x + dx - this.bias / dis;
			this.y = this.y + dy - this.bias / dis;	
		}
	}

	draw(){
		this.context.fillStyle = this.color;
		this.context.beginPath();
		this.context.arc(this.x + widthScreen / 2, this.y + heightScreen / 2, this.radius, 0, 2*Math.PI);
		this.context.fill();
	}
}

class DLA {
	constructor(context, numberParticle, stickDistribution, bias, limitRadius){
		this.context = context;
		this.numberParticle = numberParticle;
		this.stickDistribution = stickDistribution;
		this.bias = bias;
		this.particles = [];
		this.radiusCircle = defaultRadiusCircle
		this.particles[0] = new Particle(context, 0, 0, this.radiusCircle, 'red', 0);
		this.limitRadius = limitRadius;

		this.radiusBounding = this.radiusCircle;
		this.radiusGen = this.radiusBounding + this.radiusCircle * 1;
		this.radiusKill = this.radiusGen + this.circle * 2;
		this.radiusStep = this.radiusCircle;

		this.numHit = 1;
	}


	distanceO(pos){
		return Math.sqrt(pos[0] ** 2 + pos[1] ** 2);
	}
	
	squareDistanceO(pos){
		return pos[0] ** 2 + pos[1] ** 2;
	}

	diffusion(x, y){
		var dx = Math.random() * this.radiusStep;
		var dy = -Math.random() * this.radiusStep;

		if(this.bias == 0){
			return [x + dx, y + dy];
		}else{
			var dis = this.distanceO([x, y]);
			var new_x = x + dx - this.bias / dis;
			var new_y = y + dy - this.bias / dis;
			return [new_x, new_y];
		}
	}

	bindingToAggregation(index, circle){
		circle.color = 'red';
		this.particles[index] = circle;
		this.numHit += 1;

		var disO = this.distanceO([circle.x, circle.y]);

		if(disO > this.radiusBounding){
			this.radiusBounding = disO;
			this.radiusGen = this.radiusBounding + this.radiusCircle * 4;
			this.radiusKill = this.radiusGen * 2;		
		}
	}

	isBindingToAggregation(index, circle){
		var isBounding = false;
		var constDis = 4 * this.radiusCircle * this.radiusCircle;
		for(var preIndex=0; preIndex < index; preIndex++){
			var dx = circle.x - this.particles[preIndex].x;
			var dy = circle.y - this.particles[preIndex].y;
			var sdis = this.squareDistanceO([dx, dy]);
			if(sdis <= constDis + 1){
				isBounding = true;
				break;
			}
		}

		if(isBounding){
			var random = Math.random();
			if(random > this.stickDistribution){
				return true;
			}
			return false;
		}
		return false;
	}

	isInSafeArea(particle){
		var disO = this.distanceO([particle.x, particle.y]);
		if(disO < this.radiusKill){
			return true;
		}
		return false;
	}

	randomGenPosition(){
		var angle = Math.random() * 2 * Math.PI;
		var x = this.radiusGen * Math.cos(angle);
		var y = this.radiusGen * Math.sin(angle);

		return [x, y];
	}



	draw(){
		for(var i=0; i<this.particles.length; i++){
			this.particles[i].draw();
		}
	}

}
// context, numberParticle, stickDistribution, bias, limitRadius
dla = new DLA(
		context, 
		1000,
		0.8,
		0.2,
		200
	)

isHit = false;
var [xran, yran] = dla.randomGenPosition()	
var particle = new Particle(
		context,
		xran,
		yran, 
		defaultRadiusCircle,
		'white',
		0
	);

function draw(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	canvas.style.backgroundColor = 'rgba(0, 0, 0, 1)';

	dla.draw();

	if(dla.numHit < dla.numberParticle){
		particle.draw();
		for(var i=0; i < 100000; i++){
			particle.diffusion(0.5);
			if (dla.isBindingToAggregation(dla.numHit, particle)){
				console.log('in here');
				dla.bindingToAggregation(dla.numHit, particle);
				var [xran, yran] = dla.randomGenPosition()	
				particle = new Particle(
									context,
									xran,
									yran, 
									defaultRadiusCircle,
									'white',
									0.0
								);
			}
			if(!dla.isInSafeArea(particle)){
				particle.setRandomGenPosition(dla.radiusGen);
			}
		}
	}

	// particle.diffusion(5);
	// particle.draw();

	requestAnimationFrame(draw);
}


draw();