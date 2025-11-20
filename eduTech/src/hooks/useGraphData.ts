import { useState, useMemo } from 'react';
import { GraphData, Node } from '../utils/types';
import { INITIAL_NODES, INITIAL_LINKS } from '../utils/constants';

export const useGraphData = () => {
  const [graphData, setGraphData] = useState<GraphData>({ 
    nodes: INITIAL_NODES as any, 
    links: INITIAL_LINKS 
  });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(graphData.nodes.map(n => n.category))).sort();
  }, [graphData.nodes]);

  const toggleCategoryVisibility = (categoryName: string) => {
    setHiddenCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(c => c !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const updateNodeStatus = (nodeId: string, status: 'known' | 'fuzzy' | 'unknown') => {
    setGraphData(prev => ({
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, status } : n),
      links: prev.links
    }));
  };

  return {
    graphData,
    setGraphData,
    selectedNode,
    setSelectedNode,
    hiddenCategories,
    uniqueCategories,
    toggleCategoryVisibility,
    updateNodeStatus
  };
};
