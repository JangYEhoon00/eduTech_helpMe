import { useState, useEffect } from 'react';
import { FolderStructure, Node } from '../utils/types';

export const useFolderHierarchy = (nodes: Node[]) => {
  const [folderData, setFolderData] = useState<FolderStructure[]>([]);

  useEffect(() => {
    const buildTree = () => {
      // Build tree dynamically from node categories only
      const categoryMap = new Map<string, FolderStructure>();

      nodes.forEach(node => {
        // Get or create category folder
        let categoryFolder = categoryMap.get(node.category);
        if (!categoryFolder) {
          categoryFolder = { 
            id: `sub_${node.category}`, 
            name: node.category, 
            type: 'folder', 
            isOpen: true, 
            children: [] 
          };
          categoryMap.set(node.category, categoryFolder);
        }

        // Add node as file to category folder
        categoryFolder.children?.push({
          id: `file_${node.id}`,
          name: node.label,
          type: 'file',
          nodeId: node.id
        });
      });

      // Convert map to array
      return Array.from(categoryMap.values());
    };

    setFolderData(buildTree());
  }, [nodes]);

  const toggleFolder = (id: string) => {
    const toggleRecursive = (items: FolderStructure[]): FolderStructure[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, isOpen: !item.isOpen };
        if (item.children) return { ...item, children: toggleRecursive(item.children) };
        return item;
      });
    };
    setFolderData(prev => toggleRecursive(prev));
  };

  const renameFolder = (id: string, newName: string) => {
    const renameRecursive = (items: FolderStructure[]): FolderStructure[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, name: newName };
        if (item.children) return { ...item, children: renameRecursive(item.children) };
        return item;
      });
    };
    setFolderData(prev => renameRecursive(prev));
  };

  return {
    folderData,
    toggleFolder,
    renameFolder
  };
};
