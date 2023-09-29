import React, { useState, useRef, MouseEvent, MouseEventHandler, KeyboardEventHandler, EventHandler } from "react";
import { Animator, DrawProps } from "../animators/animator";

export function AnimatedCanvas(props: { animator: Animator }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Don't need to use these hooks given we are simply animating the canvas ourselves.
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [pressStart, setPressStart] = useState({ x: 0, y: 0 });

  const { animator } = props;

  function animate() {
    if (!canvasRef.current) {
      return;
    }
    animator.draw({ canvasRef });
    requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const checkSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener("resize", checkSize);
    requestAnimationFrame(animate);
  }, []);

  const onMouseDown: MouseEventHandler<HTMLElement> = (e) => {
    setPressStart({ x: e.clientX, y: e.clientY })
    setIsPanning(true);
  };

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    if (isPanning) {
      const pan = { x: e.clientX - pressStart.x, y: e.clientY - pressStart.y };
      setOffset(pan);
    }
  };

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (pressStart) {
      const pan = { x: e.clientX - pressStart.x, y: e.clientY - pressStart.y };
      setOffset(pan);
      setIsPanning(false);
      if (offset.x != 0 || offset.y != 0) {
        animator.setOffset(offset);
      }
    }
  };

  const onKeyUp: KeyboardEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    if (e.code == "ArrowUp") {
      animator.zoom(1);
    }
    if (e.code == "ArrowDown") {
      animator.zoom(-1);
    }
  };


  return (
    <div>
      {animator.options()}
      <canvas className="appcanvas"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onKeyDown={onKeyUp}
        ref={canvasRef}
        tabIndex={1}
        width={size.width}
        height={size.height}
      />
    </div>
  );
};