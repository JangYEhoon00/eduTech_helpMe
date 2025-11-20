import { useState, useEffect } from 'react';
import { FolderStructure, Node } from '../utils/types';

export const useFolderHierarchy = (nodes: Node[]) => {
  const [folderData, setFolderData] = useState<FolderStructure[]>([]);

  useEffect(() => {
    const buildTree = () => {
      const tree: FolderStructure[] = [
        { id: 'root_cs', name: 'Computer Science', type: 'folder', isOpen: true, children: [] },
        { id: 'root_math', name: 'Mathematics', type: 'folder', isOpen: false, children: [] },
        { id: 'root_other', name: 'General Knowledge', type: 'folder', isOpen: true, children: [] }
      ];

      const getParentFolder = (cat: string) => {
        const lower = cat.toLowerCase();
        if (['core', 'architecture', 'infrastructure', 'skill', 'training', 'ai', 'data'].some(k => lower.includes(k))) return tree[0]; // CS
        if (['math', 'concept', 'theory'].some(k => lower.includes(k))) return tree[1]; // Math
        return tree[2];
      };

      nodes.forEach(node => {
        const root = getParentFolder(node.category);
        
        // 2nd Level: Use Category as Subfolder
        let subFolder = root.children?.find(c => c.name === node.category);
        if (!subFolder) {
          subFolder = { 
            id: `sub_${node.category}`, 
            name: node.category, 
            type: 'folder', 
            isOpen: false, 
            children: [] 
          };
          root.children?.push(subFolder);
        }

        // 3rd Level: The Node itself
        subFolder.children?.push({
          id: `file_${node.id}`,
          name: node.label,
          type: 'file',
          nodeId: node.id
        });
      });

      return tree;
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
