var PointMass = function(x, y, mass) {
	// var G 		= 98.1,
	var MU		= 200, // viscosity of water
			DAMP 	= 0.99;

	this.x = x;
	this.y = y;
	
	this.mass 	= mass;

	this.lastX 	= x;
	this.lastY 	= y;

	this.velX   = 0;
	this.velY   = 0;

	this.accX 	= 0;
	this.accY		= 0;
	
	var self = this;

	this.update = function(timestep) {
		
		self.velX = self.x - self.lastX;
		self.velY = self.y - self.lastY;

		self.velX *= DAMP;
		self.velY *= DAMP;

		var timestepSq = timestep * timestep;
		var nextX = self.x + self.velX + 0.5*self.accX*timestepSq;
		var nextY = self.y + self.velY + 0.5*self.accY*timestepSq;

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
	};

	this.applyGravity = function() {
		this.applyForce(0, self.mass*G);
	};

	this.applyDrag = function() {
		var Fx = -1 * MU * self.velX;
		var Fy = -1 * MU * self.velY;
		this.applyForce(Fx, Fy);
	};

	this.angleTo = function(point) {
		var theta;

		if (this.x == point.x) {
			if (this.y < point.y) {
				theta = Math.PI / 2;
			} else {
				theta -Math.PI/2;
			}
		} else {
			theta = Math.atan((point.y - this.y) / (point.x - this.x));
		}
		return theta;
	}
}
