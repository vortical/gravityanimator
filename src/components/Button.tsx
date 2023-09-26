import React from "react";



export type FilterButtonProps = {
  onClick: (f:any)=>void,
  name: string
};


export function Button(props: FilterButtonProps) {
    return (
        <button 
          type="button" 
          className="btn toggle-btn" 
          onClick={(e) => props.onClick(e)}>
          <span className="visually-hidden">Show </span>
          <span>{props.name}</span>
          <span className="visually-hidden"> tasks</span>
        </button>

    );
}