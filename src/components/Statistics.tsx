import { type FC } from 'react';

export type StatisticsValues = {
  originalResources: number;
  reduction: number;
  images: number;
  buffers: number;
  otherResources: number;
  totalMemory: string;
  optimizedMemory: string;
};

const StatisticsItem: FC<{ name: string, value: never }> = ({ name, value }) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-zinc-400">{name}:</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}

export const Statistics: FC<{ stats: StatisticsValues }> = ({ stats }) => {
  const pairs: {key: string, value: never }[] = Object
    .entries(stats)
    .map(([key, value]) => ({ key, value: value as never }));

  return (
    <div className="border border-zinc-800 min-w-64 h-fit p-4 flex flex-col gap-4">
      <p className="font-mono text-sm">Statistics</p>
      <div className="text-sm flex flex-col gap-2">
        {pairs.map((pair, i) => (
          <StatisticsItem name={pair.key} value={pair.value as never} key={i}/>
        ))}
      </div>
    </div>
  );
}