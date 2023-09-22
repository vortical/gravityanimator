import React from "react";
import { NumberLiteralType } from "typescript";

export type DrawProps = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

export class Coord {
  x: number;
  y: number;

  constructor(x: number, y: number){
    this.x = x;
    this.y = y;
  }

}
export class Body{
  mass: number;
  radius: number;
  position: Coord;
  speed: Coord;
  color: string;
  
  constructor(mass: number, radius: number, position: Coord, speed: Coord, color: string){
    this.mass = mass;
    this.radius = radius;
    this.position = position;
    this.speed = speed;
    this.color = color;;
  }
};
const G: number = 6.67e-11;


class ViewPort {
  dx: number;
  dy: number;
  offsetX:  number;
  offsetY: number;

  constructor(pixelSize: Coord, worldSize: Coord ){
    this.dx = worldSize.x/pixelSize.x;
    this.dy = worldSize.y/pixelSize.y;
    this.offsetX = pixelSize.x/2;
    this.offsetY = pixelSize.y/2;
  }

  translateScalar(n: number): number {
    return n/this.dx;
  }

  translate(position: Coord): Coord{
    let x = position.x/this.dx + this.offsetX;
    let y = position.y/this.dy + this.offsetY;

    return {x: x, y:y};
  }
}
export class GravityAnimator {


  x: number;

  bodies: Body[];

  days: number;
  timeSecs: number = 0;

  constructor(bodies: Body[]) {
    this.x = 0;
    this.bodies = bodies;
    this.days = 0;
  }


  calculateNext(width: number, height: number, time: number){

    this.timeSecs += time;

    this.days =this.timeSecs/86400*7;
    if((this.timeSecs % 86400*7) == 0) {
      console.log("weeks"+this.days);
    }

    // force of body 1 on body 2
    function gravityForce(body1: Body, body2: Body): Coord{
      // distance based/caused from body 1
      function distance(body1: Body, body2: Body): Coord {
        const pos1 = body1.position;
        const pos2 = body2.position;
        return {x: pos2.x - pos1.x, y: pos2.y -pos1.y};

      }

      function magnitude(vector: Coord): number {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y);  
      }      
      const vec_r = distance(body1, body2);
      const mag = magnitude(vec_r);

      const numerator = G* body1.mass * body2.mass;
      const denominator =  Math.pow(mag, 3);

      return {x: (numerator * vec_r.x) /(denominator), y: (numerator * vec_r.y) /(denominator) };

    }

    //  based/caused from body 1
    // returns both acceleration vectors (body1 on body2, and body2 on body1)
    function accelerations(body1: Body, body2: Body, gravityForces: Coord): Coord[]{
      
      const f = gravityForce(body1, body2);
      // todo: don't forget to negate acceleration
      return [ 
        {x: f.x/body1.mass, y: f.y/body1.mass},  
        {x: -f.x/body2.mass, y: -f.y/body2.mass} 
      ];

    }

    function speeds(body: Body, acc: Coord, time: number): Coord{
      //vo + a t
      return {
        x: body.speed.x + acc.x * time,
        y: body.speed.y + acc.y * time
      };
    }

    function positions(body: Body, acc: Coord, time: number): Coord {
      // xo + vo t + at2/2
      return {
        x: body.position.x + (body.speed.x * time)+ (acc.x * time * time)/2,
        y: body.position.y + (body.speed.y * time)+ (acc.y * time * time)/2,
      };
    }


    // for now, just 2 bodies...
    const force = gravityForce(this.bodies[0], this.bodies[1]);
    const a = accelerations(this.bodies[0], this.bodies[1], force);
    const body1Speed = speeds(this.bodies[0],a[0], time)
    const body2Speed = speeds(this.bodies[1],a[1], time)

    const body1Pos = positions(this.bodies[0],a[0], time);
    const body2Pos = positions(this.bodies[1],a[1], time);

    this.bodies[0].position = body1Pos;
    this.bodies[1].position = body2Pos;
    
    this.bodies[0].speed = body1Speed;
    this.bodies[1].speed = body2Speed;

  }

  drawBody(body: Body, ctx: CanvasRenderingContext2D,view: ViewPort ) {

    ctx.beginPath();
  
    ctx.fillStyle = body.color; // like '#aabbcc'
    const position = view.translate(body.position);
    const radius = view.translateScalar(body.radius);
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
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

    const view: ViewPort = new ViewPort({x: width, y: height}, {x:1000000000, y:1000000000})
    
    this.calculateNext(width, height, 1);

    
   // ctx.clearRect(0,0,width, height);
    this.bodies.forEach((b) => this.drawBody(b, ctx, view));
  }
   



}
