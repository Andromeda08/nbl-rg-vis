import { type RGBColor } from 'd3';
import * as d3 from 'd3';

export type DependencyType = 'Ignored' | 'Expose' | 'Read' | 'Write';
export const getDependencyType = (x: number): DependencyType => {
  switch (x) {
    case 1:   return 'Expose';
    case 2:   return 'Read';
    case 3:   return 'Write';
    default:  return 'Ignored';
  }
};

export type ResourceType = 'SceneData' | 'Buffer' | 'Image' | 'TopLevelAS' | 'Unknown';
export const getResourceTypeColor = (type: ResourceType): RGBColor => {
  switch (type) {
    case "SceneData":   return d3.color('rgb(255, 186, 0)')!.rgb();
    case "Buffer":      return d3.color('rgb(255, 100, 103)')!.rgb();
    case "Image":       return d3.color('rgb(124, 136, 255)')!.rgb();
    case "TopLevelAS":  return d3.color('rgb(154, 230, 0)')!.rgb();
    default:            return d3.color('rgb(128, 128, 128)')!.rgb();
  }
};

export const getAllResourceTypes = (): ResourceType[] => {
  return ['SceneData', 'Buffer', 'Image', 'TopLevelAS'];
};
