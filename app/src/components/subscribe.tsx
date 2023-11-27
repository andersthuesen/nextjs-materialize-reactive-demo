"use client";

import { useEffect } from "react";

type SubscribeProps = { uuid: string };
export const Subscribe: React.FC<SubscribeProps> = ({ uuid }) => {
  useEffect(() => {
    const eventSource = new EventSource(`/api/events/${uuid}`);

    eventSource.addEventListener("message", (event) => {
      console.log(event);
    });

    eventSource.onmessage = (event) => {
      console.log(event);
    };

    return () => eventSource.close();
  }, [uuid]);

  return <h1>Subscribe to: {uuid}</h1>;
};
