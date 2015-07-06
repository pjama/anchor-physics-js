var PointMass = function(x, y, mass) {
	var G 		= 98.1,
			DAMP 	= 1.0;

	this.x = x;
	this.y = y;
	
	this.mass 	= mass;

	this.lastX 	= x;
	this.lastY 	= y;

	this.accX 	= 0;
	this.accY		= 0;
	
	var self = this;

	this.update = function(timestep) {
		
		var velX = self.x - self.lastX;
		var velY = self.y - self.lastY;

		velX *= DAMP;
		velY *= DAMP;

		var timestepSq = timestep * timestep;
		var nextX = self.x + velX + 0.5*self.accX*timestepSq;
		var nextY = self.y + velY + 0.5*self.accY*timestepSq;

		self.lastX = self.x;
		self.lastY = self.y;

		self.x = nextX;
		self.y = nextY;

		self.accX = 0;
		self.accY = 0;
	}

	this.applyForce = function(Fx, Fy) {
		self.accX += Fx / self.mass;
		self.accY += Fy / self.mass;
	}

	this.applyGravity = function() {
		this.applyForce(0, self.mass*G);
	}
}
