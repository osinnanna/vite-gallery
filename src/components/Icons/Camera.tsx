import React from "react";

const Camera = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
    <style>{`
      .camera-body {
        animation: breathe 4s ease-in-out infinite;
        transform-origin: center;
      }
      .rec-light {
        animation: pulse-red 1.5s infinite;
      }
      .lens-focus {
        animation: focus 3s ease-in-out infinite;
        transform-origin: center;
      }
      @keyframes breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      @keyframes pulse-red {
        0%, 100% { opacity: 1; fill: #ff4d4d; }
        50% { opacity: 0.3; fill: #ff0000; }
      }
      @keyframes focus {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.1); opacity: 1; }
      }
    `}</style>
    <g className="camera-body">
      <rect x="40" y="70" width="120" height="80" rx="12" fill="#2d2d2d" />
      <path d="M70 70 L80 50 L120 50 L130 70 Z" fill="#1a1a1a" />
      <rect x="85" y="45" width="30" height="15" rx="3" fill="#333" />
      <circle className="rec-light" cx="145" cy="85" r="3" />
      <circle cx="100" cy="110" r="45" fill="#1a1a1a" stroke="#444" strokeWidth="2" />
      <g className="lens-focus">
        <circle cx="100" cy="110" r="30" fill="#3a3a3a" stroke="#555" strokeWidth="1" />
        <circle cx="100" cy="110" r="20" fill="#0c1a2b" opacity="0.9" />
        <path d="M105 95 Q 115 100 110 115" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      </g>
      <rect x="50" y="62" width="15" height="8" rx="2" fill="#444" />
    </g>
  </svg>
);

export default Camera;
