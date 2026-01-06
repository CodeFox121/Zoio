let eyes = [];

function setup() {
  createCanvas(400, 260);
  eyes.push(new Eye(140, 120));
  eyes.push(new Eye(260, 120));
}

function draw() {
  background("#e8f5e9");

  for (let eye of eyes) {
    eye.update();
    eye.draw();
    eye.tryDry(mouseX, mouseY);
  }
}

function mousePressed() {
  for (let eye of eyes) {
    if (eye.isPoked(mouseX, mouseY)) {
      eye.poke();
      break;
    }
  }
}

// ======================
// CLASSE OLHO
// ======================
class Eye {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.eyeRadius = 40;
    this.pupilRadius = 12;
    this.maxOffset = 15;

    this.anger = 0;
    this.blinkTime = 0;

    this.tearPool = 0;
    this.tears = [];
    this.dripTimer = 0;
  }

  poke() {
    this.blinkTime = 10;
    this.anger = min(this.anger + 25, 255);
    this.tearPool += 1;
  }

  update() {
    if (this.blinkTime > 0) this.blinkTime--;

    // esfria aos poucos
    if (this.anger > 0 && frameCount % 2 === 0) {
      this.anger -= 1;
    }

    // pinga UMA lágrima se tiver acumulado
    if (this.tearPool >= 3 && this.dripTimer <= 0) {
      this.tears.push(
        new Tear(this.x, this.y + this.eyeRadius - 2)
      );
      this.tearPool--;
      this.dripTimer = 30;
    }

    this.dripTimer--;

    for (let t of this.tears) t.update();
    this.tears = this.tears.filter(t => t.y < height + 30);
  }

  tryDry(mx, my) {
    // área da pálpebra inferior
    let lidY = this.y + this.eyeRadius - 4;
    let lidWidth = 30 + this.tearPool * 4;

    let overLid =
      mx > this.x - lidWidth / 2 &&
      mx < this.x + lidWidth / 2 &&
      abs(my - lidY) < 6;

    if (overLid && this.tearPool > 0 && frameCount % 5 === 0) {
      this.tearPool--; // seca suavemente
    }
  }

  draw() {
    // piscando
    if (this.blinkTime > 0) {
      stroke(0);
      strokeWeight(4);
      line(this.x - 20, this.y, this.x + 20, this.y);
      strokeWeight(1);
      return;
    }

    // branco → vermelho
    let redness = color(
      255,
      255 - this.anger * 0.7,
      255 - this.anger * 0.7
    );

    fill(redness);
    stroke(0);
    circle(this.x, this.y, this.eyeRadius * 2);

    // pupila segue mouse
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
    let d = sqrt(dx * dx + dy * dy);
    if (d > this.maxOffset) {
      dx = (dx / d) * this.maxOffset;
      dy = (dy / d) * this.maxOffset;
    }

    // veias
    if (this.anger > 90) {
      stroke(180, 0, 0);
      for (let i = 0; i < this.anger / 45; i++) {
        line(
          this.x + random(-18, 18),
          this.y + random(-18, 18),
          this.x + dx * 0.8,
          this.y + dy * 0.8
        );
      }
    }

    // pupila
    fill("#2b2b2b");
    noStroke();
    circle(this.x + dx, this.y + dy, this.pupilRadius * 2);

    // piscina de lágrimas
    if (this.tearPool > 0) {
      fill(120, 180, 255);
      ellipse(
        this.x,
        this.y + this.eyeRadius - 4,
        12 + this.tearPool * 4,
        6
      );
    }

    for (let t of this.tears) t.draw();
  }

  isPoked(mx, my) {
    return dist(mx, my, this.x, this.y) < this.eyeRadius;
  }
}

// ======================
// CLASSE LÁGRIMA
// ======================
class Tear {
  constructor(x, y) {
    this.x = x + random(-4, 4);
    this.y = y;
    this.speed = random(1.8, 2.5);
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    fill(120, 180, 255);
    noStroke();

    ellipse(this.x, this.y, 12, 16);
    triangle(
      this.x - 6, this.y - 2,
      this.x + 6, this.y - 2,
      this.x, this.y - 12
    );
  }
}
