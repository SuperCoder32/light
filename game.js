'use strict'

function randRange(start, stop) {
    return parseInt(Math.random()*(stop-start) + start);
}

function randMax(max) {
    return randRange(0, max);
}

class Polygon {
    constructor(vers) {
        this.vertices = vers;
        for (let i = 0; i < vers.length-1; i++) {
            let f = vers[i];
            let s = vers[i+1];
            lightEngine.segments.push( new Segment(f, s) );
        }
        let f = vers[vers.length-1];
        let s = vers[0];
        lightEngine.segments.push( new Segment(f, s) );
    }
    add(vec) {
        for (let ver of this.vertices) {
            ver.set(ver.add(vec));
        }
    }
}

class RandomPolygon extends Polygon {
    constructor() {
        let len = randRange(4, 10);
        let vers = [];
        for (let i = 0; i < len; i++) {
            vers.push( new Vector(randMax(200), randMax(200)) );
        }
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

        let offset = this.origin;
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

        let moveVec = this.dir.mul(this.velocity);
        this.polygon.add(moveVec);
        this.origin = this.origin.add(moveVec);
    }
}

function draw() {
    lightEngine.draw();
}

function update() {
    for (let en of enemies) {
        en.move();
    }
    player.x += vx;
    player.y += vy;
    lightEngine.update();
}

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

function spawn() {
    enemies.push(new Enemy());
    setTimeout(spawn, spawnInterval);
}

init({
    fullScreen: true,
    clear: false,
    updateDelay: 10,
});

let player = new Vector(canvas.width/2, canvas.height/2);
let lightEngine = new LightEngine(700, [255, 255, 255], 'black', player, [255, 0, 0], 7);

let vx = 0, vy = 0;
let v = 2;
let spawnInterval = 10000;
let enemies = [];

spawn();

