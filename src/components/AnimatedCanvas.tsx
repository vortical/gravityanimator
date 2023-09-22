import React, { useRef } from "react";
import { GravityAnimator, DrawProps } from "./animator";

export  function AnimatedCanvas(props: {animator: GravityAnimator}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { animator } = props;

    function animate(){

        
        if (!canvasRef.current) {
            return;
        }

        animator.draw({ canvasRef });
        requestAnimationFrame(animate);
    
    };

    React.useEffect(() => {
    requestAnimationFrame(animate);
  }, []);

  return (
    <div>
        <canvas 
            ref={canvasRef}  
            width={960} 
            height={960} 
        />
    </div>
  );
};