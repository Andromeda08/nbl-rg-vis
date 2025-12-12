import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { renderToString } from 'react-dom/server';
import * as d3 from 'd3';
import {
  type DependencyType,
  getDependencyType,
  type ResourceType,
  getAllResourceTypes,
  getResourceTypeColor,
} from "../util.ts";
import {
  Statistics,
  type StatisticsValues
} from "./Statistics.tsx";

type ResourceUse = {
  genResName: string;
  start: number;
  end: number;
  type: ResourceType;
  usedAs: string;
  dep: DependencyType;
  isOptimizable: boolean;
  isAliased: boolean;
  requiredMemory: string;
}

// eslint-disable-next-line
export const Visualization: FC<{ data: any }> = ({ data }) => {
  const visRef = useRef<HTMLDivElement>(null);
  const [visibleTypes, setVisibleTypes] = useState<ResourceType[]>(getAllResourceTypes());

  const [width, getVisWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const marginLeft = 80;
  const margin = 32;

  const toggleResourceTypeVisibility = (type: ResourceType) => {
    if (visibleTypes.includes(type)) {
      setVisibleTypes(visibleTypes.filter(t => t !== type));
    } else {
      const newTypes = [type];
      visibleTypes.forEach(t => newTypes.push(t));
      setVisibleTypes(newTypes);
    }
  }

  const visibleResources = data.resourceTemplates
    .filter((res) => visibleTypes.includes(res.resourceType as ResourceType));

  // Resource "names" for the optimizer generated ones
  const genResourceNames: string[] = visibleResources
    .map((res) => `Resource-${res.id}`);

  // Resize
  useEffect(() => {
    if (visRef.current) {
      const updateDimensions = () => {
        if (visRef.current) {
          const { width, height } = visRef.current.getBoundingClientRect();
          getVisWidth(width - 32);
          setHeight(height - 48);
        }
      }

      setTimeout(() => {
        updateDimensions();
      }, 0);

      window.addEventListener("resize", updateDimensions);

      return () => {
        window.removeEventListener("resize", updateDimensions);
      }
    }
  }, []);

  // Collect actual resources and their usage info
  const getResources = useCallback(
    // eslint-disable-next-line
    (input: any[]): ResourceUse[] => {
      const resources: ResourceUse[] = [];
      input.forEach((res) => {
        res.usageRanges.forEach((range: { start: number, end: number }) => {
          const usagePoint = res.usagePoints.find((p) => p.point === range.start);
          resources.push({
            genResName: `Resource-${res.id}`,
            start: range.start,
            end: range.end,
            type: res.resourceType as ResourceType,
            usedAs: usagePoint!.usedAs,
            dep: getDependencyType(usagePoint!.dependencyInfo.dependencyType),
            isOptimizable: res.originalResource.isOptimizable,
            isAliased: (res.usageRanges.length > 1) && (res.resourceType as ResourceType === 'Image'),
            requiredMemory: usagePoint.memoryRequirement,
          });
        });
      });
      return resources;
    }, []);

  const resources = useMemo<ResourceUse[]>(
    () => getResources(data.resourceTemplates),
    [getResources, data]
  );

  // Statistics
  const getStatistics = useCallback(
    // eslint-disable-next-line
    (data: any): StatisticsValues => {
      return {
        originalResources: data.optimizerResultMeta.nOriginalCount,
        reduction: data.optimizerResultMeta.nReduction,
        images: data.resourceTemplates.filter(r => r.resourceType === 'Image').length,
        buffers: data.resourceTemplates.filter(r => r.resourceType === 'Buffer').length,
        otherResources: data.resourceTemplates.filter(r => r.resourceType !== 'Image' && r.resourceType !== 'Buffer').length,
        totalMemory: resources
          .reduce((sum: number, { requiredMemory }) => sum + parseInt(requiredMemory, 10), 0)
          .toString()
          .concat(" MB"),
        optimizedMemory: data.resourceTemplates
          .map((res) => {
            let maxMemory = 0;
            res.usageRanges.forEach((range: { start: number, end: number }) => {
              res.usagePoints
                .filter((usagePoint) => range.start <= usagePoint.point && range.end <= usagePoint.point)
                .forEach((usagePoint) => maxMemory = Math.max(maxMemory, parseInt(usagePoint.memoryRequirement, 10 )));
            });
            return maxMemory
          })
          .reduce((sum, value) => sum + value, 0)
          .toString()
          .concat(" MB"),
      }
    }, [resources]);

  const statistics = useMemo<StatisticsValues>(
    () => getStatistics(data),
    [getStatistics, data],
  );

  // d3
  useEffect(() => {
    const rectHeight = 32;
    // Timeline range
    const range = {
      start: data.optimizerResultMeta.timelineRange.start,
      end: data.optimizerResultMeta.timelineRange.end,
    };

    d3
      .select(visRef.current)
      .selectAll("*")
      .remove();

    const svg = d3.select(visRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Assemble X axis based on timeline range.
    const x = d3.scaleLinear()
      .domain([range.start, range.end])
      .range([margin, width - marginLeft - margin]);

    const axisTop = d3
      .axisTop(x)
      .tickFormat(d3.format('d'))
      .ticks(range.end - range.start);

    svg.append('g').attr("transform", `translate(${marginLeft}, ${margin})`).call(axisTop);

    // Y axis
    const y = d3.scaleBand()
      .domain(genResourceNames)
      .range([margin, height - margin]);

    const axisLeft = d3.axisLeft(y)
    svg.append('g').attr("transform", `translate(${marginLeft}, 0)`)
      .call(g => {
        g.call(axisLeft);
        g.selectAll(".tick")
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          .attr("transform", d => `translate(0, ${y(d) + (rectHeight * 2)})`);
      });

    // Tooltip
    const tooltip = d3
      .select(visRef!.current)
      .append("div")
      .style("transition-property", "opacity")
      .style("transition-timing-function", "var(--tw-ease, var(--default-transition-timing-function)")
      .style("transition-duration", "var(--tw-duration, var(--default-transition-duration)")
      .style("position", "absolute")
      .style("padding", "12px")
      .style("background", "var(--color-zinc-800)")
      .style("color", "var(--color-zinc-50)")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const renderTooltip = (res: ResourceUse): string => renderToString(
      <div className="text-xs flex flex-col transition-opacity">
        <span className="mb-1">{res.genResName}</span>
        <span className="text-zinc-400">
          Type: <span style={{ color: getResourceTypeColor(res.type).toString() }}>{res.type}</span>
        </span>
        <span className="text-zinc-400 mb-1">
            Required Memory: <span className="text-zinc-50">{(res.type === 'Buffer' || res.type === "Image") ? `${res.requiredMemory ?? 0} MB` : 'n/a'}</span>
        </span>
        <div className="flex gap-2">
          {(res.isAliased) && (
            <span className="px-1 py-0.5 rounded-lg border border-red-500 bg-red-500 text-zinc-50">
              Aliased
            </span>
          )}
          {res.isOptimizable && (
            <span className="px-1 py-0.5 rounded-lg border border-lime-500 bg-lime-500 text-zinc-50">
              Optimizable
            </span>
          )}
        </div>
      </div>
    );

    // Boxes for resource uses
    resources
      .filter((res) => visibleTypes.includes(res.type))
      .forEach((res) => {
      const sx = x(res.start);
      const sy = y(res.genResName)!;
      const w = Math.abs(x(res.end) - x(res.start));

      const px = sx + marginLeft;
      const py = sy + margin + (rectHeight / 2);

      svg
        .style("cursor", "pointer")
        .append("rect")
        .attr("x", px)
        .attr("y", py)
        .attr("height", rectHeight)
        .attr("width", w)
        .attr("fill", getResourceTypeColor(res.type).toString())
        .on("mouseover", () => {
          tooltip
            .style("opacity", 1)
            .style("left", `${px}px`)
            .style("top", `${py + rectHeight + 8}px`)
            .html(renderTooltip(res));
        })
        .on("mouseleave", () => tooltip.style("opacity", 0));

      svg
        .append("text")
        .text(res.usedAs)
        .attr("x", px)
        .attr("y", py - 20)
        .attr("fill", "var(--color-zinc-400)")
        .style("text-anchor", "start")
        .style("font-size", 14)
        .style("dominant-baseline", "hanging");
    });

  }, [data, width, height, genResourceNames, resources, visibleTypes]);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <p className="text-zinc-400 font-mono">Resource Timeline [{data.optimizerResultMeta.timelineRange.start}, {data.optimizerResultMeta.timelineRange.end}]</p>
      <div className="w-full h-full flex gap-4">
        <div
          ref={visRef}
          className="relative w-full h-full border border-zinc-800 overflow-x-scroll"
        />
        <div className="flex flex-col gap-4">
          {/* Statistics Panel */}
          <Statistics stats={statistics} />
          {/* Visibility Toggles */}
          <div className="border border-zinc-800 min-w-64 h-fit p-4 flex flex-col gap-4">
            <p className="font-mono text-sm">Toggle Resource Types</p>
            <div className="grid grid-cols-2 gap-2">
              { getAllResourceTypes().map((type, i) => (
                <button
                  key={i}
                  className={`w-full px-2 py-1 border-zinc-800 border cursor-pointer  hover:bg-zinc-700 transition-colors ${visibleTypes.includes(type) && 'bg-zinc-800'}`}
                  onClick={() => toggleResourceTypeVisibility(type)}
                >
                  <span
                    className="text-sm font-mono"
                    style={{ color: getResourceTypeColor(type).toString() }}
                  >
                    {type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};