import { Animator, Coord, DrawProps} from './animator';


const G: number = 6.67e-11;

export class Body {
  mass: number;
  radius: number;
  position: Coord;
  speed: Coord;
  color: string;

  constructor(mass: number, radius: number, position: Coord, speed: Coord, color: string) {
    this.mass = mass;
    this.radius = radius;
    this.position = position;
    this.speed = speed;
    this.color = color;
  }
};


class ViewPort {
  dx: number;
  dy: number;
  centerOffsetX: number;
  centerOffsetY: number;
  offsetX: number;
  offsetY: number;
  centerBody: Body | null = null;

  constructor(pixelSize: Coord, worldSize: Coord, offsets: Coord = { x: 0, y: 0 }) {
    this.dx = worldSize.x / pixelSize.x;
    this.dy = worldSize.y / pixelSize.y;
    this.centerOffsetX = pixelSize.x / 2;
    this.centerOffsetY = pixelSize.y / 2;
    this.offsetX = offsets.x;
    this.offsetY = offsets.y;
  }

  translateScalar(n: number): number {
    return n / this.dx;
  }

  centerOnBody(body: Body | null) {
    this.centerBody = body;
  }

  translate(position: Coord): Coord {
    if (this.centerBody) {
      const bodyPosition = this.centerBody.position;
      position = { x: position.x - bodyPosition.x, y: position.y - bodyPosition.y };
    }
    let x = position.x / this.dx + this.centerOffsetX + this.offsetX;
    let y = position.y / this.dy + this.centerOffsetY + this.offsetY;

    return { x: x, y: y };
  }
}

export class GravityAnimator implements Animator{
  bodies: Body[];
  leaveTrace: boolean;
  offset: Coord;
  viewSize: number;
  isDirty: boolean = false;

  constructor(bodies: Body[], leaveTrace: boolean = true, offset: Coord = { x: 0, y: 0 }) {
    function defaultViewSize() {
      return bodies.reduce((accumulator, current) => {
        return Math.max(accumulator, Math.abs(current.position.x), Math.abs(current.position.y));
      }, 0);
    }
    this.bodies = bodies;
    this.leaveTrace = leaveTrace;
    this.offset = offset;
    this.viewSize = defaultViewSize();
  }

  setLeaveTrace(value: boolean) {
    this.leaveTrace = value;
  }

  setOffset(offset: Coord) {
    this.offset = offset;
    this.isDirty = true;
  }

  zoom(size: number) {
    this.viewSize = this.viewSize + (this.viewSize / (20 * size));
    this.isDirty = true;
  }

  setViewSize(size: number) {
    this.viewSize = size;
  }

  calculateBodyProperties(width: number, height: number, time: number) {
    // force of body 1 on body 2
    function gravityForce(body1: Body, body2: Body): Coord {
      // distance based/caused from body 1
      function distance(body1: Body, body2: Body): Coord {
        const pos1 = body1.position;
        const pos2 = body2.position;
        return { x: pos2.x - pos1.x, y: pos2.y - pos1.y };
      }

      function magnitude(vector: Coord): number {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
      }
      const vec_r = distance(body1, body2);
      const mag = magnitude(vec_r);
      const numerator = G * body1.mass * body2.mass;
      const denominator = Math.pow(mag, 3);

      return { x: (numerator * vec_r.x) / (denominator), y: (numerator * vec_r.y) / (denominator) };
    }

    //  based/caused from body 1
    // returns both acceleration vectors (body1 on body2, and body2 on body1) 
    function accelerations(body1: Body, body2: Body, gravityForces: Coord): Coord[] {
      const f = gravityForce(body1, body2);
      return [
        { x: f.x / body1.mass, y: f.y / body1.mass },
        { x: -f.x / body2.mass, y: -f.y / body2.mass }
      ];
    }

    function speeds(body: Body, acc: Coord, time: number): Coord {
      return {
        x: body.speed.x + acc.x * time,
        y: body.speed.y + acc.y * time
      };
    }

    function positions(body: Body, acc: Coord, time: number): Coord {
      return {
        x: body.position.x + (body.speed.x * time) + (acc.x * time * time) / 2,
        y: body.position.y + (body.speed.y * time) + (acc.y * time * time) / 2,
      };
    }

    let accelerationContributions: Coord[][] = [];

    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = 0; j < this.bodies.length; j++) {
        if (i < j) { // is a symetric matrix, but with values negated
          const aij_ji = accelerations(this.bodies[i], this.bodies[j], gravityForce(this.bodies[i], this.bodies[j]));
          if (!accelerationContributions[i]) {
            accelerationContributions[i] = [];
          }
          accelerationContributions[i][j] = aij_ji[0];
          if (!accelerationContributions[j]) {
            accelerationContributions[j] = [];
          }
          accelerationContributions[j][i] = aij_ji[1];
        }
      }
      // a body's total acceleration is the sum of all contributions from other bodies.
      let bodyAcceleration: Coord = accelerationContributions[i].reduce((accumulator, current) => {
        return { x: (current.x + accumulator.x), y: (current.y + accumulator.y) }
      }, { x: 0, y: 0 });

      this.bodies[i].position = positions(this.bodies[i], bodyAcceleration, time);
      this.bodies[i].speed = speeds(this.bodies[i], bodyAcceleration, time)
    }
  }

  drawBody(body: Body, ctx: CanvasRenderingContext2D, view: ViewPort) {
    ctx.beginPath();
    ctx.fillStyle = body.color; // like '#aabbcc'
    const position = view.translate(body.position);
    const radius = view.translateScalar(body.radius);
    ctx.arc(position.x, position.y, radius < 1 ? 1 : radius, 0, 2 * Math.PI, false);
    ctx.fill();
  }

  draw(props: DrawProps) {
    const { canvasRef } = props;
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const viewPortSize = this.viewSize;
    const biggestAxe = (width < height) ? { x: viewPortSize, y: viewPortSize * height / width } : { y: viewPortSize, x: viewPortSize * width / height };
    const view: ViewPort = new ViewPort({ x: width, y: height }, { x: biggestAxe.x * 2, y: biggestAxe.y * 2 }, this.offset)

    // loop 1000 times at 1 second per iteration 
    for (let i = 0; i < 1000; i++) {
      this.calculateBodyProperties(width, height, 10);
    }

    if (!this.leaveTrace || this.isDirty) {
      ctx.clearRect(0, 0, width, height);
      this.isDirty = false;
    }
    // We can 'center' our view onto a body. By default it centers on (0,0) which is the sun's position
    // in the array of bodies. Body 3 is the earth, which makes for an intersting animation.
  //  view.centerOnBody(this.bodies[3]);

    this.bodies.forEach((b) => this.drawBody(b, ctx, view));
  }
}
