'use strict'

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	getCopy() {
		return new Vector(this.x, this.y);
	}
}

class Segment {
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}
	side(vector) {
		var x = vector.x;
		var y = vector.y;
		return (x - this.start.x) * (this.end.y - this.start.y) - (y - this.start.y) * (this.end.x - this.start.x); 
	}
	draw() {
		context.beginPath();
		context.moveTo(this.start.x, this.start.y);
		context.lineTo(this.end.x, this.end.y);
		context.stroke();
		context.closePath();
	}
}

function area_determinant (p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p2.y) - (p3.x - p2.x) * (p2.y - p1.y);
}

function clockwise (p1, p2, p3) {
    return area_determinant (p1, p2, p3) < 0;
}

function areColliding(Ax, Ay, Awidth, Aheight, Bx, By, Bwidth, Bheight) {
	if (Bx <= Ax + Awidth) 
		if (Ax <= Bx + Bwidth) 
			if (By <= Ay + Aheight) 
				if (Ay <= By + Bheight) 
					return true;
	return false;
}

function quadrant(origin, vec) {
	if (vec.x <= origin.x && vec.y >= origin.y) {
		return 1;
	} if (vec.x <= origin.x && vec.y <= origin.y) {
		return 2;
	} if (vec.x >= origin.x && vec.y <= origin.y) {
		return 3;
	} if (vec.x >= origin.x && vec.y >= origin.y) {
		return 4;
	}
}

function canvasIntersectionPoint(seg) {
	var k = (seg.end.y - seg.start.y) / (seg.end.x - seg.start.x);
	var offset = seg.start.y - k * seg.start.x;

	var vec1, vec2, vec3, vec4;
	vec1 = new Vector(0, offset);
	vec2 = new Vector(- offset / k, 0);
	vec3 = new Vector(canvas.width, k * canvas.width + offset);
	vec4 = new Vector((canvas.height - offset) / k, canvas.height);

	var quad = quadrant(seg.start, seg.end);

	if (seg.start.x === seg.end.x) {
		if (seg.end.y < seg.start.y) {
			return new Vector(seg.start.x, 0);
		} else {
			return new Vector(seg.start.x, canvas.height);
		}
	} if (seg.start.y === seg.end.y) {
		if (seg.end.x > seg.start.x) {
			return new Vector(canvas.width, seg.start.y);
		} else {
			return new Vector(0, seg.start.y);
		}
	}
	if (quad === 1) {
		if (vec1.y < vec4.y) {
			return vec1;
		} else {
			return vec4;
		}
	} if (quad === 2) {
		if (vec2.y > vec1.y) {
			return vec2;
		} else {
			return vec1;
		}
	} if (quad === 3) {
		if (vec3.x < vec2.x) {
			return vec3;
		} else {
			return vec2;
		}
	} if (quad === 4) {
		if (vec4.x < vec3.x) {
			return vec4;
		} else {
			return vec3;
		}
	}	
}

function update() {}

function updatePolygons() {
	polygons = [];

	for (var i=0; i<segments.length; i++) {
		var start = segments[i].start, end = segments[i].end;
		if (clockwise(lightSource, start, end)) {
			start = segments[i].end;
			end = segments[i].start;
		}

		polygons.push([]);
		var intersection1 = canvasIntersectionPoint( new Segment(lightSource, start) );
		var intersection2 = canvasIntersectionPoint( new Segment(lightSource, end) );

		if ((intersection1.x === intersection2.x && (intersection1.x === 0 || intersection1.x === canvas.width))
		 || (intersection1.y === intersection2.y && (intersection1.y === 0 || intersection1.y === canvas.height))) {

			polygons[i].push(intersection1);
			polygons[i].push(start);
			polygons[i].push(end);
			polygons[i].push(intersection2);

		} else {
			var additionals = [];
			if (intersection1.y === 0 && intersection2.x === canvas.width) {
				additionals = [new Vector(canvas.width, 0)];
			} else if (intersection1.x === canvas.width && intersection2.y === canvas.height) {
				additionals = [new Vector(canvas.width, canvas.height)];
			} else if (intersection1.y === canvas.height && intersection2.x === 0) {
				additionals = [new Vector(0, canvas.height)];
			} else if (intersection1.x === 0 && intersection2.y === 0) {
				additionals = [new Vector(0, 0)];
			} else if (intersection1.x === 0 && intersection2.x === canvas.width) {
				additionals.push(new Vector(0, 0));
				additionals.push(new Vector(canvas.width, 0));
			} else if (intersection1.y === 0 && intersection2.y === canvas.height) {
				additionals.push(new Vector(canvas.width, 0));
				additionals.push(new Vector(canvas.width, canvas.height));
			} else if (intersection1.x === canvas.width && intersection2.x === 0) {
				additionals.push(new Vector(canvas.width, canvas.height));
				additionals.push(new Vector(0, canvas.height));
			} else if (intersection1.y === canvas.height && intersection2.y === 0) {
				additionals.push(new Vector(0, canvas.height));
				additionals.push(new Vector(0, 0));
			} else if (intersection1.x === 0 && intersection2.y === canvas.height) {
				additionals.push(new Vector(0, 0));
				additionals.push(new Vector(canvas.width, 0));
				additionals.push(new Vector(canvas.width, canvas.height));
			} else if (intersection1.y === 0 && intersection2.x === 0) {
				additionals.push(new Vector(canvas.width, 0));
				additionals.push(new Vector(canvas.width, canvas.height));
				additionals.push(new Vector(0, canvas.height));
			} else if (intersection1.x === canvas.width && intersection2.y === 0) {
				additionals.push(new Vector(canvas.width, canvas.height));
				additionals.push(new Vector(0, canvas.height));
				additionals.push(new Vector(0, 0));
			} else if (intersection1.y === canvas.height && intersection2.x === canvas.width) {
				additionals.push(new Vector(0, canvas.height));
				additionals.push(new Vector(0, 0));
				additionals.push(new Vector(canvas.width, 0));
			}

			polygons[i].push(intersection1);
			for (var j=0; j<additionals.length; j++) {
				polygons[i].push(additionals[j]);
			}
			polygons[i].push(intersection2);
			polygons[i].push(end);
			polygons[i].push(start);
		}
	}
}

function drawPolygons() {
	if (segments.length >= 1) {
		for (var i=0; i<polygons.length; i++) {
			context.beginPath();
			context.moveTo(polygons[i][0].x, polygons[i][0].y);
			for (var j=1; j<polygons[i].length; j++) {
				context.lineTo(polygons[i][j].x, polygons[i][j].y);
			}
			context.closePath();
			context.stroke();
			context.fill();
		}
	}
}

function draw() {
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var gradient = context.createRadialGradient(lightSource.x, lightSource.y, 1000, lightSource.x, lightSource.y, 0);
	gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
	gradient.addColorStop(1, 'rgba(255, 255, 0, 1)');
	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = "black";
	context.strokeStyle = "black";
	drawPolygons();

	for (var i=0; i<segments.length; i++) {
		var rgbStr = "blue";
		context.strokeStyle = rgbStr;
		context.lineWidth = 1;
		segments[i].draw();
	}

	context.fillStyle = "green";
	context.fillRect(lightSource.x - pointSize / 2, lightSource.y - pointSize / 2, pointSize, pointSize);
}

var segments = [];
var polygons = [];
var boundPoint = null;
var lightSource = new Vector(canvas.width / 2, canvas.height / 2);
var pointSize = 10;
var updateDensity = 10, moveCounter = 0;

function mousemove() {
	if (boundPoint) {
		boundPoint.x = mouseX;
		boundPoint.y = mouseY;
        updatePolygons();
	}
}

function mousedown() {
	if (boundPoint) {
		boundPoint = null;
	} else {
		if (areColliding(lightSource.x - pointSize / 2, lightSource.y - pointSize / 2, pointSize, pointSize,
						mouseX, mouseY, 1, 1)) {
			boundPoint = lightSource;
		} else {
			segments.push(new Segment(
				new Vector(mouseX, mouseY),
				new Vector(mouseX, mouseY)
			));
			boundPoint = segments[segments.length - 1].end;
		}

		updatePolygons();
	}
}
