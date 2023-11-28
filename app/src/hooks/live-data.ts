import { useEffect, useState } from "react";

export const useLiveData = <T>(initialData: T, uuid: string) => {
  const [data, setData] = useState<T>(initialData);
  useEffect(() => {
    const eventSource = new EventSource(`/api/events/${uuid}`);

    const handler = (event: MessageEvent) => {
      const events = JSON.parse(event.data);
      setData(events[events.length - 1]);
    };

    eventSource.addEventListener("message", handler);

    return () => {
      eventSource.removeEventListener("message", handler);
      eventSource.close();
    };
  }, [uuid]);

  return data;
};
