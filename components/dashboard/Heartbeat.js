"use client";

import { useEffect } from "react";

export default function Heartbeat() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/ping', { cache: 'no-store' }).catch(() => {});
    }, 240000); 

    return () => clearInterval(interval);
  }, []);

  return null; 
}