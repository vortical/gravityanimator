import React from "react";

export type DrawProps = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

export class Coord {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export interface Animator {
  draw(props:DrawProps): void;
  setLeaveTrace(value: boolean): void;
  setOffset(offset: Coord): void;
  zoom(z: number): void;
  options(): JSX.Element;
  togglePause(): void; 
}
