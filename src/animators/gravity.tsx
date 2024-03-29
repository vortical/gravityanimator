import { Animator, Coord, DrawProps} from './animator';


const G: number = 6.67e-11;

export class Body {
  name: string;
  mass: number;
  radius: number;
  position: Coord;
  speed: Coord;
  color: string;

  acceleration: number;

  constructor(name: string, mass: number, radius: number, position: Coord, speed: Coord, color: string) {
    this.name = name;
    this.mass = mass;
    this.radius = radius;
    this.position = position;
    this.speed = speed;
    this.color = color;
    this.acceleration = 0;
  }
};


class ViewPort {
  dx: number;
  dy: number;
  centerOffsetX: number;
  centerOffsetY: number;
  offsetX: number;
  offsetY: number;
  centerBody: Body | undefined;

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

  centerOnBody(body: Body | undefined) {
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
  selectedCenterBody: Body|undefined;
  isPaused: boolean = false;

  constructor(bodies: Body[], leaveTrace: boolean = false, offset: Coord = { x: 0, y: 0 }) {
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

  togglePause(){
    this.isPaused = !this.isPaused;
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

  onSelectCenterBody(e: any){
    this.isDirty = true;
    this.selectedCenterBody = this.bodies.find( b => b.name == e.target.value);
    console.log("Select center: "+this.selectedCenterBody?.name);

  } 

  options(): JSX.Element {
    const selectOptions = this.bodies.map( b => (<option key={b.name} value={b.name}>{b.name}</option>));
  
    return (<div>
      <select name="body-selected" value={this.selectedCenterBody?.name} onChange={((that:any) => (e:any) => that.onSelectCenterBody(e))(this)}>
        <option key="select..." value="">Select center body ...</option>
        {selectOptions}
      </select  >
    </div>);
  }


  /**
   * 
   * Calculates and updates the positions and velocities of the (n-bodies). Accelerations are
   * based on F = GMiMj/(R*R).
   * Ax for (Mi) = (GMj/R*R*R)* [x/mag(R)]
   * Ay for (Mi) = (GMj/R*R*R)* [y/mag(R)]
   * ...
   * For each body we currently sum up all the acceleration values with all the other bodies. 
   * 
   * For positions:
   * Xi+1 = Xi + Vi*dt + Ai*(dt*dt)/2
   * 
   * Once positions at i+1 are determined, we calculate velocities using the averages of
   * accelerations at i and i+1; which requires another pass at gathering accelerations 
   * based on the postision at i+1.
   *     
   * So for velocities we use:
   * Vi+1 = Vi + (Ai + Ai+1)/2*dt
   * 
   * 
   * @param width 
   * 
   * @param height 
   * @param time 
   */
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
    function twoBodyAccelerations(body1: Body, body2: Body, gravityForces: Coord): Coord[] {
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
        y: body.position.y + (body.speed.y * time) + (acc.y * time * time) / 2  
      };
    }

    function accelerations(bodies: Body[]){
      let accelerationContributions: Coord[][] = [];
      let bodyAccelerations: Coord[] = [];

      for (let i = 0; i < bodies.length; i++) {
        for (let j = 0; j < bodies.length; j++) {
          if (i < j) { // is a symetric matrix, but with values negated
            const aij_ji = twoBodyAccelerations(bodies[i], bodies[j], gravityForce(bodies[i], bodies[j]));
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
        bodyAccelerations[i] = accelerationContributions[i].reduce((accumulator, current) => {
          return { x: (current.x + accumulator.x), y: (current.y + accumulator.y) }
        }, { x: 0, y: 0 });
      }
      return bodyAccelerations;
    }

    const accelerations_i1 = accelerations(this.bodies);

    for(let i = 0; i < this.bodies.length; i++) {
        this.bodies[i].position = positions(this.bodies[i], accelerations_i1[i], time);
    }

    const accelerations_i2 = accelerations(this.bodies);
    // now speed Vi+1 = Vi + (Ai + Ai+1)dt/2;
    // Notice we need acceleration at i+1 to calculate speed. Acceleration just depends on position, which we have

    function combine<T>(aa: T[], bb: T[], f:(a:T, b: T)=>T ){
      return aa.map( (a,i) => f(a, bb[i]));
    }
    const avgAccelerations = combine(accelerations_i1, accelerations_i2, (a,b) => {return {x: (a.x + b.x)/2, y: (a.y + b.y)/2};}) ;

    for(let i = 0;  i< this.bodies.length; i++) {
      const a = accelerations_i1[i].x + accelerations_i1[i].x 
      this.bodies[i].speed = speeds(this.bodies[i], avgAccelerations[i], time)
    }

  }

  drawBody(body: Body, ctx: CanvasRenderingContext2D, view: ViewPort) {
    ctx.beginPath();
    ctx.fillStyle = body.color; // like '#aabbcc'
    const position = view.translate(body.position);
    const radius = view.translateScalar(body.radius);
    ctx.arc(position.x, position.y, radius < 0.3 ? 0.3 : radius, 0, 2 * Math.PI, false);
    ctx.fill();
   if(!this.leaveTrace){
      ctx.font = '10pt sans-serif';
      ctx.fillText(body.name, position.x+radius, position.y);
   }
  }

  draw(props: DrawProps) {
    if(this.isPaused){
      return;
    }

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
    for (let i = 0; i < 500; i++) {
      this.calculateBodyProperties(width, height, 1);
    }

    if (!this.leaveTrace || this.isDirty) {
      ctx.clearRect(0, 0, width, height);
      this.isDirty = false;
    }
    // We can 'center' our view onto a body. By default it centers on (0,0) which is the sun's position
    // in the array of bodies. Body 3 is the earth, which makes for an intersting animation.
    view.centerOnBody(this.selectedCenterBody);

    this.bodies.forEach((b) => this.drawBody(b, ctx, view));
  }
}
