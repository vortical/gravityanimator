

(function() {
	var width = 500, height = 500; // Width and height of simulation in pixels.
	var context = $("#canvas").get(0).getContext("2d");
	var paused = false;
	context.canvas.width = width;
	context.canvas.height = height;

	function randomParticles() {
		particles = []
		for (var i = 0; i < 0; i++){
			particles.push([Math.random()*width,Math.random()*height,0.1-0.2*Math.random(),0.1-0.2*Math.random()])
		}
		return particles
	}

	function drawPoints(particles) {
		for(var i = 0; i<particles.length; i++){
			context.beginPath();
			context.arc(particles[i][0],particles[i][1],3,0,2*Math.PI);
			context.fillStyle = "white";
			context.fill();
			context.stroke();
		}
	};

	var particles = randomParticles();
	var step = 0.01;
	var soft = 1;
	var drag = 0.0;
	var drift = 0;
	var central = 0.0;
	var new_point = true;

	function force_on_r(r2){
		if (r2>soft*soft){
			return -10/r2;
		} else {
			return -10/soft;
		}
	};

	function mainLoop() {
		var accel_x, accel_y, new_particles, rel_force, pos_x, pos_y, vel_x, vel_y;
		context.fillStyle = "rgb(0, 0, 0)";
		context.fillRect(0, 0, width, height);

		// Makes new particles
		$(document).mousedown(function (event){
			if (new_point){
				var new_x = event.pageX-canvas.offsetLeft;
				var new_y = event.pageY-canvas.offsetTop;
				if (new_x > 0 && new_y > 0 && new_x < width && new_y < height){
					particles.push([event.pageX-canvas.offsetLeft,event.pageY-canvas.offsetTop,0,0]);
					new_point = false
				}
			}
		});

		$(document).mouseup(function (event){
			new_point = true
		});

		// Update slider-based variables.
		speed = Math.pow(10,$("#speed").val());
		$("#speeddisplay").html(Math.round(speed)+"");

		// Run simulation step.
		if (!paused) {
			for(var iter = 0; iter < speed; iter++){
				new_particles = []
				for(var i = 0; i<particles.length; i++){
					accel_x = 0;
					accel_y = 0;
					for(var j = 0; j<particles.length; j++){
						if (j != i){
							rel_force = force_on_r((particles[i][0]-particles[j][0])*(particles[i][0]-particles[j][0])+(particles[i][1]-particles[j][1])*(particles[i][1]-particles[j][1]));
							accel_x += rel_force*(particles[i][0]-particles[j][0]);
							accel_y += rel_force*(particles[i][1]-particles[j][1]);
						}
					}
					accel_x += -drag*particles[i][2] + drift*(2*Math.random()-1) - central * (particles[i][0] - width/2)
					accel_y += -drag*particles[i][3] + drift*(2*Math.random()-1) - central * (particles[i][1] - width/2)

					vel_x = particles[i][2] + step*accel_x;
					vel_y = particles[i][3] + step*accel_y;
					pos_x = particles[i][0] + step*vel_x;
					pos_y = particles[i][1] + step*vel_y;
					
					new_particles.push([pos_x,pos_y,vel_x,vel_y])
				}
				particles = new_particles
			}
		}

		drawPoints(particles);

		setTimeout(mainLoop, 1); // Run, run, as fast as you can!
	};
			

	mainLoop();
})