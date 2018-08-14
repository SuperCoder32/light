'use strict'


function randRange(start, stop) {
    return parseInt(Math.random()*(stop-start) + start);
}

function randMax(max) {
    return randRange(0, max);
}

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
    set(v) {
        this.x = v.x;
        this.y = v.y;
    }
    add(v) {
        return new Vector(this.x+v.x, this.y+v.y);
    }
    mul(s) {
        return new Vector(s*this.x, s*this.y);
    }
    sub(v) {
        return this.add( v.mul(-1) );
    }
    equal(v) {
        return this.x == v.x && this.y == v.y;
    }
}

class Segment {
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}
    length() {
        var x1 = this.start.x, y1 = this.start.y;
        var x2 = this.end.x, y2 = this.end.y;
        return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    }
	draw() {
		context.beginPath();
		context.moveTo(this.start.x, this.start.y);
		context.lineTo(this.end.x, this.end.y);
		context.stroke();
		context.closePath();
	}
}

class Polygon {
    constructor(vers) {
        this.vertices = vers;

        for (var i = 0; i < vers.length-1; i++) {
            var f = vers[i];
            var s = vers[i+1];
            segments.push( new Segment(f, s) );
        }
        var f = vers[vers.length-1];
        var s = vers[0];
        segments.push( new Segment(f, s) );
    }
    add(vec) {
        this.vertices.forEach(function(ver) {
            ver.set(ver.add(vec));
        });
    }
}

class RandomPolygon extends Polygon {
    constructor() {
        var len = randRange(4, 10);
        var vers = [];
        for (var i = 0; i < len; i++) {
            vers.push( new Vector(randMax(200), randMax(200)) );
        }
        console.log(vers);
        super(vers);
    }
}

class Square extends Polygon {
    constructor(w, h) {
        super([
            new Vector(0, 0),
            new Vector(w, 0),
            new Vector(w, h),
            new Vector(0, h)
        ]);
    }
}


class Enemy {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.velocity = 3;

        this.right = new Vector(1, 0);
        this.down = new Vector(0, 1);
        this.left = new Vector(-1, 0);
        this.up = new Vector(0, -1);
        this.dir = this.right;

        this.origin = new Vector( randMax(canvas.width-this.width*2), randMax(canvas.height-this.height*2) );
        this.polygon = new RandomPolygon();

        var offset = this.origin;
        this.polygon.add(offset);
    }
    move() {
        if (this.dir == this.right && this.origin.x >= canvas.width - this.width*5) { 
           this.dir = this.down;
        } else if (this.dir == this.down && this.origin.y >= canvas.height - this.height*5) {
           this.dir = this.left;
        } else if (this.dir == this.left && this.origin.x <= this.width*5) {
           this.dir = this.up;
        } else if (this.dir == this.up && this.origin.y <= this.height*5) {
            this.dir = this.right;
        }

        var moveVec = this.dir.mul(this.velocity);
        this.polygon.add(moveVec);
        this.origin = this.origin.add(moveVec);
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

function drawPolygon(poly, fill, stroke) {
    context.beginPath();
    context.moveTo(poly[0].x, poly[0].y);
    for (var j=1; j<poly.length; j++) {
        context.lineTo(poly[j].x, poly[j].y);
    }
    context.closePath();
    if (stroke)
        context.stroke();
    if (fill)
        context.fill();
}

function drawPolygons() {
	if (segments.length >= 1) {
		for (var i=0; i<polygons.length; i++) {
            drawPolygon(polygons[i], true, false);
		}
	}
}

function draw() {
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);

    segments.forEach(function(seg) {
		context.strokeStyle = 'rgba(255, 0, 0, ' + 1 + ')';
		context.lineWidth = 1;
		seg.draw();
	});

	var gradient = context.createRadialGradient(lightSource.x, lightSource.y, lightRadius, lightSource.x, lightSource.y, 0);
	gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
	gradient.addColorStop(1, 'rgba(255, 255, 0, 1)');
	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = "black";
	context.strokeStyle = "black";
	drawPolygons();

	context.fillStyle = "green";
	context.fillRect(lightSource.x - pointSize / 2, lightSource.y - pointSize / 2, pointSize, pointSize);
}

function update() {
    enemies.forEach(function(en) {
        en.move();
    });
    lightSource.x += vx;
    lightSource.y += vy;
    updatePolygons();
}

var segments = [];
var polygons = [];
var lightSource = new Vector(canvas.width / 2, canvas.height / 2);
var lightRadius = 1000;
var pointSize = 10;
var vx = 0, vy = 0;
var v = 2;

function keydown(key) {
    switch(key) {
        case 'w':
            vy = -v;
            break;
        case 's':
            vy = +v;
            break;
        case 'a':
            vx = -v;
            break;
        case 'd':
            vx = +v;
            break;
    }
}
function keyup(key) {
    if (key == 'w' || key == 's')
        vy = 0;
    if (key == 'a' || key == 'd')
        vx = 0;
}

var spawnInterval = 10000;
var enemies = [];

function spawn() {
    enemies.push(new Enemy());
    setTimeout(spawn, spawnInterval);
}

spawn();
