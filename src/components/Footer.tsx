import { type FC, useState } from 'react';
import { getResourceTypeColor, type ResourceType } from '../util.ts';

export type FooterTab = 'output' | 'nodes' | 'resources';

const getProducedCount = (node) => {
  return node.dependencies
    .filter((d) => {
      return d.dependencyType === 1 || d.dependencyType === 3;
    })
    .length;
}

const getConsumedCount = (node) => {
  return node.dependencies
    .filter((d) => {
      return d.dependencyType === 2;
    })
    .length;
}

// eslint-disable-next-line
export const Footer: FC<{ data: any; }> = ({ data }) => {
  const [activeFooterTab, setFooterTab] = useState<FooterTab>('output');

  const renderFooterContent = (footerTab: FooterTab) => {
    if (footerTab === 'output') {
      return (
        <>
          {data.messages.map((message, i) => (
            <p className="text-sm" key={i}>{ message }</p>
          ))}
        </>
      );
    }

    if (footerTab === 'nodes') {
      return (
        <div className="flex flex-col gap-2 text-sm">
          {data.nodeExecutionOrder.map((node, i) => (
            <div className="grid grid-cols-[32px_auto] items-center">
              <p className="w-5 h-5 bg-zinc-600 flex items-center justify-center rounded-full border border-zinc-600">{i}</p>
              <div className="flex gap-2">
                <p>{node.displayName}</p>
                <span className="text-zinc-400">(produced: {getProducedCount(node)}, consumed: {getConsumedCount(node)})</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (footerTab === 'resources') {
      return (
        <div className="flex flex-col gap-2 text-sm">
          {data.resourceTemplates.map((res, i) => (
            <div className="grid grid-cols-[100px_auto] items-center">
              <p
                className="w-fit px-1.5 py-1 h-5 bg-zinc-800 flex items-center justify-center rounded-full border border-zinc-800"
                style={{ color: getResourceTypeColor(res.resourceType as ResourceType).toString() }}
              >
                {res.resourceType}
              </p>
              <div className="flex gap-2">
                <p>{`Resource #${i} [ID=${res.id}]`}</p>
                <p className="text-zinc-400">(# of different uses: {res.usageRanges.length})</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  }

  return (
    <footer className="h-64 min-h-32 w-full flex flex-col gap-2 border-t border-t-zinc-800">
      <div className="flex border-b border-zinc-800">
        <button
          className={`w-fit px-2 py-1 border-zinc-800 border-r cursor-pointer  hover:bg-zinc-700 transition-colors ${activeFooterTab === 'output' && 'bg-zinc-800'}`}
          onClick={() => setFooterTab('output')}
        >
          <span className="text-sm font-mono">Output Log</span>
        </button>
        <button
          className={`w-fit px-2 py-1 border-zinc-800 border-r cursor-pointer  hover:bg-zinc-700 transition-colors ${activeFooterTab === 'nodes' && 'bg-zinc-800'}`}
          onClick={() => setFooterTab('nodes')}
        >
          <span className="text-sm font-mono">Nodes</span>
        </button>
        <button
          className={`w-fit px-2 py-1 border-zinc-800 border-r cursor-pointer  hover:bg-zinc-700 transition-colors ${activeFooterTab === 'resources' && 'bg-zinc-800'}`}
          onClick={() => setFooterTab('resources')}
        >
          <span className="text-sm font-mono">Generated Resources</span>
        </button>
      </div>
      <div className="h-auto w-full px-4 pb-2 overflow-y-scroll">
        { renderFooterContent(activeFooterTab) }
      </div>
    </footer>
  );
}