
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, Type } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MindMapNode {
  id: string;
  text: string;
  children: MindMapNode[];
  level: number;
}

interface VisualMindMapEditorProps {
  mermaidCode: string;
  onChange: (newCode: string) => void;
  readOnly?: boolean;
}

const VisualMindMapEditor: React.FC<VisualMindMapEditorProps> = ({ mermaidCode, onChange, readOnly = false }) => {
  const { t } = useTranslation();
  const [rootNode, setRootNode] = useState<MindMapNode | null>(null);

  // Parse Mermaid to Tree
  useEffect(() => {
    const parseMermaid = (code: string) => {
      const lines = code.split('\n').filter(line => line.trim() !== '' && line.trim() !== 'mindmap');
      
      if (lines.length === 0) {
        setRootNode({ id: 'root', text: 'Root', children: [], level: 0 });
        return;
      }

      // Helper to count indent spaces (handles both spaces and tabs)
      const getIndent = (str: string) => {
        const match = str.match(/^[\s\t]*/);
        const whitespace = match ? match[0] : '';
        // Treat 1 tab as 2 spaces for consistency
        return whitespace.replace(/\t/g, '  ').length;
      };

      const buildTree = (): MindMapNode => {
        // Find root (first line)
        const rootLine = lines[0];
        // Strip quotes and parentheses for the root text if present
        const cleanRootText = rootLine.trim().replace(/^root\s*\(|^\(+|"|"\)$|\)$/g, '');
        
        const root: MindMapNode = {
          id: Math.random().toString(36).substr(2, 9),
          text: cleanRootText,
          children: [],
          level: 0
        };

        const stack: { node: MindMapNode; indent: number }[] = [{ node: root, indent: getIndent(rootLine) }];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const indent = getIndent(line);
          // Strip quotes from node text
          // Remove wrapping quotes "Text"
          let text = line.trim();
          if (text.startsWith('"') && text.endsWith('"')) {
            text = text.substring(1, text.length - 1);
          }
          
          const newNode: MindMapNode = {
            id: Math.random().toString(36).substr(2, 9),
            text: text,
            children: [],
            level: indent // Relative level
          };

          // Find parent
          while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
          }

          if (stack.length > 0) {
            const parent = stack[stack.length - 1].node;
            parent.children.push(newNode);
          }

          stack.push({ node: newNode, indent });
        }
        return root;
      };

      try {
        const tree = buildTree();
        setRootNode(tree);
      } catch (e) {
        console.error("Failed to parse mindmap", e);
      }
    };

    parseMermaid(mermaidCode);
  }, [mermaidCode]);

  // Convert Tree to Mermaid
  const serializeToMermaid = (node: MindMapNode): string => {
    let output = 'mindmap\n';
    
    // Root needs special syntax in some mermaid versions, but usually indentation 0 works 
    // or root("Name") syntax. Let's use root("Name") for top level to be safe.
    output += `  root("${node.text.replace(/"/g, "'")}")\n`;

    const traverse = (n: MindMapNode, depth: number) => {
      // Indent: Start at 2 levels deep (4 spaces) because root is indented 2 spaces
      const indent = '  '.repeat(depth + 1);
      // ALWAYS wrap text in double quotes to be safe against special characters like () or /
      // Escape any existing double quotes
      const safeText = `"${n.text.replace(/"/g, "'")}"`;
      output += `${indent}${safeText}\n`;
      n.children.forEach(child => traverse(child, depth + 1));
    };

    node.children.forEach(child => traverse(child, 1));
    
    return output;
  };

  const handleUpdate = (newRoot: MindMapNode) => {
    setRootNode(newRoot);
    const code = serializeToMermaid(newRoot);
    onChange(code);
  };

  const updateNodeText = (id: string, text: string) => {
    if (!rootNode) return;
    const updateRecursive = (node: MindMapNode): MindMapNode => {
      if (node.id === id) return { ...node, text };
      return { ...node, children: node.children.map(updateRecursive) };
    };
    handleUpdate(updateRecursive(rootNode));
  };

  const addChild = (parentId: string) => {
    if (!rootNode) return;
    const updateRecursive = (node: MindMapNode): MindMapNode => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...node.children, {
            id: Math.random().toString(36).substr(2, 9),
            text: t('visual_editors.new_node'),
            children: [],
            level: node.level + 1
          }]
        };
      }
      return { ...node, children: node.children.map(updateRecursive) };
    };
    handleUpdate(updateRecursive(rootNode));
  };

  const deleteNode = (id: string) => {
    if (!rootNode) return;
    if (rootNode.id === id) return; // Cannot delete root
    
    const deleteRecursive = (node: MindMapNode): MindMapNode => {
      return {
        ...node,
        children: node.children.filter(c => c.id !== id).map(deleteRecursive)
      };
    };
    handleUpdate(deleteRecursive(rootNode));
  };

  // Recursive Tree Node Component
  const TreeNode: React.FC<{ node: MindMapNode; depth: number }> = ({ node, depth }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div className="select-none">
        <div 
          className="flex items-center gap-2 py-1 px-2 rounded hover:bg-slate-100 group transition-colors"
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-600 ${node.children.length === 0 ? 'invisible' : ''}`}
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          
          <div className="relative flex-1">
             {readOnly ? (
               <div className="w-full px-1 py-0.5 text-sm text-slate-700">{node.text}</div>
             ) : (
               <input 
                 value={node.text}
                 onChange={(e) => updateNodeText(node.id, e.target.value)}
                 className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-400 focus:bg-white rounded px-1 py-0.5 text-sm text-slate-700 outline-none"
               />
             )}
          </div>

          {!readOnly && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => addChild(node.id)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title={t('visual_editors.add_child')}
              >
                <Plus size={14} />
              </button>
              {depth > 0 && (
                <button 
                  onClick={() => deleteNode(node.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                  title={t('visual_editors.delete_node')}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
        
        {isExpanded && node.children.map(child => (
          <TreeNode key={child.id} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className={`h-full overflow-y-auto custom-scroll p-4 bg-white rounded-xl border border-slate-200 shadow-sm ${readOnly ? 'print:border-slate-300' : ''}`}>
       <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
         <Type size={14} /> {t('visual_editors.visual_editing')}
       </div>
       {rootNode ? (
         <TreeNode node={rootNode} depth={0} />
       ) : (
         <div className="text-sm text-slate-400 text-center py-4">{t('visual_editors.cant_parse_mindmap')}</div>
       )}
    </div>
  );
};

export default VisualMindMapEditor;
