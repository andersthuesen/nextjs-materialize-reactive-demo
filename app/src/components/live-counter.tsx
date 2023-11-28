"use client";
import { useLiveData } from "@/hooks/live-data";

export const LiveCounter = ({
  initialCount,
  uuid,
}: {
  initialCount: { count: number };
  uuid: string;
}) => {
  const data = useLiveData(initialCount, uuid);

  return <h1 className="text-lg">Current count: {data.count}</h1>;
};
