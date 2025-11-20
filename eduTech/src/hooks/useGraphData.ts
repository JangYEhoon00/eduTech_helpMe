import { useState, useMemo, useEffect } from 'react';
import { GraphData, Node, Link } from '../utils/types';
import { fetchGraphData, createNodes, createLinks, updateNode, deleteNode } from '../services/supabaseService';

export const useGraphData = (userId?: string) => {
  const [graphData, setGraphData] = useState<GraphData>({ 
    nodes: [], 
    links: [] 
  });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data when user logs in
  useEffect(() => {
    if (!userId) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const { nodes, links } = await fetchGraphData();
        // If user has no data, we could optionally seed it with INITIAL_NODES here
        // For now, we'll just show their (empty) data or whatever they have
        setGraphData({ nodes, links });
      } catch (error) {
        console.error('Failed to fetch graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

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

  const updateNodeStatus = async (nodeId: string, status: 'known' | 'fuzzy' | 'unknown') => {
    // Optimistic update
    setGraphData(prev => ({
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, status } : n),
      links: prev.links
    }));

    if (userId) {
      try {
        await updateNode(nodeId, { status });
      } catch (error) {
        console.error('Failed to update node status:', error);
      }
    }
  };

  const addNodesAndLinks = async (newNodes: Node[], newLinks: Link[]) => {
    // Optimistic update
    setGraphData(prev => ({
      nodes: [...prev.nodes, ...newNodes],
      links: [...prev.links, ...newLinks]
    }));

    if (userId) {
      try {
        await Promise.all([
          createNodes(newNodes),
          createLinks(newLinks)
        ]);
      } catch (error) {
        console.error('Failed to save nodes/links:', error);
      }
    }
  };

  const removeNode = async (nodeId: string) => {
    // Optimistic update
    setGraphData(prev => ({
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      links: prev.links.filter(l => l.source !== nodeId && l.target !== nodeId)
    }));

    if (userId) {
      try {
        await deleteNode(nodeId);
      } catch (error) {
        console.error('Failed to delete node:', error);
      }
    }
  };

  const removeCategory = async (category: string) => {
    const nodesToDelete = graphData.nodes.filter(n => n.category === category);
    const nodeIds = nodesToDelete.map(n => n.id);

    // Optimistic update
    setGraphData(prev => ({
      nodes: prev.nodes.filter(n => n.category !== category),
      links: prev.links.filter(l => !nodeIds.includes(l.source as string) && !nodeIds.includes(l.target as string))
    }));

    if (userId) {
      try {
        await Promise.all(nodeIds.map(id => deleteNode(id)));
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  return {
    graphData,
    setGraphData,
    selectedNode,
    setSelectedNode,
    hiddenCategories,
    uniqueCategories,
    toggleCategoryVisibility,
    updateNodeStatus,
    addNodesAndLinks,
    removeNode,
    removeCategory,
    isLoading
  };
};
