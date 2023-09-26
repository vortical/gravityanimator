import React, { useRef } from "react";
import { GravityAnimator, DrawProps } from "./animator";

export  function AnimatedCanvas(props: {animator: GravityAnimator}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    if (canvasRef.current){
        const height = canvasRef.current.clientHeight;
        const width = canvasRef.current.clientHeight;
    }
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
        <canvas className="appcanvas" 
            ref={canvasRef}  
            width={canvasRef.current?.clientWidth}
            height={canvasRef.current?.clientHeight}
        
       
        />
    </div>
  );
};