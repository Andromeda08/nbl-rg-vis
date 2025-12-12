import type {FC} from 'react';
import {ChevronDownIcon, ChevronRightIcon} from 'lucide-react';

export const Header: FC<{
  // eslint-disable-next-line
  graphs: any[];
  // eslint-disable-next-line
  setActiveGraph: any;
  activeGraphName: string;
  resourceCount: number;
}> = ({ graphs, setActiveGraph, activeGraphName, resourceCount }) => {

  return (
    <header className="font-mono h-20 w-full px-16 flex items-center gap-16 border-b border-b-zinc-800">
      <div className="flex items-center gap-4 h-full">
        <span className="font-bold">Nebula</span>
        <span className="font-semibold text-zinc-400">/</span>
        <div className="relative h-full flex items-center cursor-pointer group">
          <span className="text-sm flex items-center">RenderGraph Compiler Result: {activeGraphName} <ChevronDownIcon className="w-5 h-5 ml-1" /> </span>
          <div className="absolute z-20 text-sm min-w-64 h-fit bg-zinc-900 border-zinc-800 border-l border-r top-[60px] left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="w-full items-start flex flex-col gap-1">
              {graphs.map((g, i) => (
                <button
                  key={i}
                  className={`${i !== 0 && 'border-b border-zinc-800'} w-full flex items-center px-4 py-2 transition-colors hover:bg-zinc-800 cursor-pointer`}
                  onClick={() => {
                    setActiveGraph(g);
                    console.log(g);
                  }}
                >
                  <ChevronRightIcon className="w-4 h-4 mr-1" />{g.inputGraphName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-full flex">
        <button
          className={`w-fit h-full px-4 flex items-center bg-zinc-800 border-zinc-800 border-r border-l cursor-pointer  hover:bg-zinc-700 transition-colors`}
        >
          <span className="text-sm font-mono flex items-center gap-2">Resources <span className="w-5 h-5 bg-zinc-600 flex items-center justify-center rounded-full border border-zinc-600">{resourceCount}</span></span>
        </button>
      </div>
    </header>
  );
};