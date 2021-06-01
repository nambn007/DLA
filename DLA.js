var canvas = document.getElementById('dla');
var context = canvas.getContext('2d');

context.clearRect(0, 0, canvas.width, canvas.height);
canvas.style.backgroundColor = 'rgba(0, 0, 0, 1)';


// Draw circle
var widthScreen = 500
var heightScreen = 500

canvas.width = widthScreen
canvas.height = heightScreen

var xpos =  widthScreen / 2
var ypos = heightScreen / 2
var defaultRadiusCircle = 1

var inputNumP = document.getElementById('numP');
inputNumP.value = 1000;
var inputProbility = document.getElementById('probility');
inputProbility.value = 1;
var inputRadiusCircle = document.getElementById('radiusCircle');
inputRadiusCircle.value = defaultRadiusCircle;
var inputBias = document.getElementById('bias');
inputBias.value = 0;

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
			this.x = this.x + dx - this.bias * this.x / dis;
			this.y = this.y + dy - this.bias * this.y / dis;	
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
	constructor(context, numberParticle, stickDistribution, radiusCircle){
		this.context = context;
		this.numberParticle = numberParticle;
		this.stickDistribution = stickDistribution;
		this.particles = [];
		this.radiusCircle = radiusCircle
		this.particles[0] = new Particle(context, 0, 0, this.radiusCircle, 'red', 0);

		this.radiusBounding = this.radiusCircle;
		this.radiusGen = this.radiusBounding + 1;
		this.radiusKill = this.radiusGen + this.radiusCircle * 2;
		this.radiusStep = this.radiusCircle;
		this.numHit = 1;

		console.log('A ' + this.radiusBounding);
		console.log('B ' + this.radiusGen);
		console.log('C ' + this.radiusCircle);
	}


	distanceO(pos){
		return Math.sqrt(pos[0] ** 2 + pos[1] ** 2);
	}
	
	squareDistanceO(pos){
		return pos[0] ** 2 + pos[1] ** 2;
	}


	bindingToAggregation(index, circle){
		circle.color = 'red';
		this.particles[index] = circle;
		this.numHit += 1;

		var disO = this.distanceO([circle.x, circle.y]);

		if(disO > this.radiusBounding){
			this.radiusBounding = disO;
			this.radiusGen = this.radiusBounding + this.radiusCircle * 4;
			this.radiusKill = this.radiusGen + this.radiusCircle * 4;		
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
			if(random <= this.stickDistribution){
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

var dla;
var isHit = false;
var particle;
var title = document.getElementById('title');
var requestId;
var xran, yran;
var particle;
var defaultBias = 0;

function setUpDLA(numP, probility, radiusCircle, bias){
	numP = parseInt(numP);
	probility = parseFloat(probility);
	radiusCircle = parseFloat(radiusCircle);
	bias = parseFloat(bias);
	console.log('Pro ' + probility);
	defaultRadiusCircle = radiusCircle;
	defaultBias = bias;

	if(!dla){
		dla = new DLA(
			context, 
			numP,
			probility,
			radiusCircle
		);
		isHit = false;
		var [xran, yran] = dla.randomGenPosition();

		particle = new Particle(
				context,
				xran,
				yran, 
				defaultRadiusCircle,
				'white',
				bias
			);
	}
}




function draw(){
	requestId = undefined;
	context.clearRect(0, 0, canvas.width, canvas.height);
	canvas.style.backgroundColor = 'rgba(0, 0, 0, 1)';

	dla.draw();

	if(dla.numHit < dla.numberParticle){
		particle.draw();
		for(var i=0; i < 100000; i++){
			particle.diffusion(defaultRadiusCircle / 2);
			if (dla.isBindingToAggregation(dla.numHit, particle)){
				dla.bindingToAggregation(dla.numHit, particle);
				var [xran, yran] = dla.randomGenPosition()	
				particle = new Particle(
									context,
									xran,
									yran, 
									defaultRadiusCircle,
									'white',
									defaultBias
								);
			}
			if(!dla.isInSafeArea(particle)){
				particle.setRandomGenPosition(dla.radiusGen);
			}
			if(dla.numHit >= dla.numberParticle){
					break;
			}
		}
	}else{
		stop();
		var button = document.getElementById('buttonDLA');
		button.value = 1;
		button.innerHTML = 'Bắt đầu';
		return;
	}

	title.innerHTML = 'Số hạt trong không gian:  ' + dla.numHit;

	//requestAnimationFrame(draw);
	start();
}



function start() {
    if (!requestId) {
       requestId = window.requestAnimationFrame(draw);
    }
}

function stop() {
    if (requestId) {
       window.cancelAnimationFrame(requestId);
       requestId = undefined;
    }
}


function onClick(){
	var button = document.getElementById('buttonDLA');
	var inputNumP = document.getElementById('numP').value;
	var inputProbility = document.getElementById('probility').value;
	var inputRadiusCircle = document.getElementById('radiusCircle').value;
	var inputBias = document.getElementById('bias').value;


	if(inputNumP == ""){
		inputNumP = 1000;
	}
	if(inputProbility == ""){
		inputProbility = 1;
	}
	if(inputRadiusCircle == ""){
		inputRadiusCircle = defaultRadiusCircle;
	}
	if(inputBias == ""){
		inputBias = 0;
	}

	setUpDLA(inputNumP, inputProbility, inputRadiusCircle, inputBias);

	if(button.value == 1){
		button.value = 0;
		button.innerHTML = 'Dừng';
		start();	
	}else{
		button.value = 1;
		button.innerHTML = 'Tiếp tục';
		stop();
	}
}


function reset(){
	stop();
	dla = undefined;
	isHit = false;
	particle = undefined;
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	canvas.style.backgroundColor = 'rgba(0, 0, 0, 1)';

	var button = document.getElementById('buttonDLA');
	button.value = 1;
	button.innerHTML = 'Bắt đầu';
}