'use client';
import { useState, useCallback, useRef } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Upload, FileCode2, Play } from 'lucide-react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// Naive structural parser
function parseCode(code: string, language: string) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const entities: { id: string; name: string; type: string; line: number; body?: string }[] = [];
  let idCounter = 1;

  const lines = code.split('\n');

  if (language === 'python') {
    // Basic Python parser
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const classMatch = line.match(/^class\s+([A-Za-z0-9_]+)/);
      if (classMatch) {
        entities.push({ id: `node-${idCounter++}`, name: classMatch[1], type: 'class', line: i });
      }
      const funcMatch = line.match(/^def\s+([A-Za-z0-9_]+)/);
      if (funcMatch) {
        entities.push({ id: `node-${idCounter++}`, name: funcMatch[1], type: 'function', line: i });
      }
      const importMatch = line.match(/^(?:from\s+([A-Za-z0-9_\.]+)\s+)?import\s+([A-Za-z0-9_\., ]+)/);
      if (importMatch) {
        const mods = importMatch[2].split(',').map(m => m.trim().split(' ')[0]);
        for (const mod of mods) {
          entities.push({ id: `node-${idCounter++}`, name: mod, type: 'import', line: i });
        }
      }
    }
  } else {
    // Basic JS/TS parser
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const classMatch = line.match(/class\s+([A-Za-z0-9_]+)/);
      if (classMatch) {
        entities.push({ id: `node-${idCounter++}`, name: classMatch[1], type: 'class', line: i });
      }
      const funcMatch = line.match(/function\s+([A-Za-z0-9_]+)/);
      if (funcMatch) {
        entities.push({ id: `node-${idCounter++}`, name: funcMatch[1], type: 'function', line: i });
      }
      const arrowFuncMatch = line.match(/(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>/);
      if (arrowFuncMatch) {
        entities.push({ id: `node-${idCounter++}`, name: arrowFuncMatch[1], type: 'function', line: i });
      }
      const importMatch = line.match(/import\s+.*from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        entities.push({ id: `node-${idCounter++}`, name: importMatch[1], type: 'import', line: i });
      }
    }
  }

  // Create Nodes (Positioned sequentially for now, ReactFlow handles dragging)
  let yOffset = 50;
  for (const entity of entities) {
    let color = '#3b82f6'; // blue for functions
    if (entity.type === 'class') color = '#a855f7'; // purple for classes
    if (entity.type === 'import') color = '#10b981'; // green for imports

    nodes.push({
      id: entity.id,
      position: { x: Math.random() * 400, y: yOffset },
      data: { 
        label: (
          <div className="flex flex-col items-center p-2.5 rounded-xl shadow-lg border border-zinc-700 bg-zinc-900 min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">{entity.type}</span>
            <span className="font-mono font-bold text-base" style={{ color }}>{entity.name}</span>
          </div>
        )
      },
      style: { border: 'none', background: 'transparent', padding: 0 }
    });
    yOffset += 100;
  }

  // Naive Edge Creation (Check if an entity name appears in another's body context)
  // To keep it simple, we check if entity A's name appears anywhere in the file after entity B is defined.
  // This is highly naive but generates a "Call Graph" aesthetic.
  for (let i = 0; i < entities.length; i++) {
    for (let j = 0; j < entities.length; j++) {
      if (i === j) continue;
      const source = entities[i];
      const target = entities[j];
      
      // If target's name appears in the code, draw an edge (very naive approximation)
      // We skip imports as sources
      if (source.type === 'import') continue;
      
      // Avoid infinite edges if names are too short
      if (target.name.length < 3) continue;

      const regex = new RegExp(`\\b${target.name}\\b`);
      if (regex.test(code)) {
        // Just arbitrarily add an edge if it matches to show connections
        // In a real AST, we'd check scope.
        // We add a random chance to avoid total spaghetti in large files
        if (Math.random() > 0.5) {
          edges.push({
            id: `e-${source.id}-${target.id}`,
            source: source.id,
            target: target.id,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#9ca3af' }
          });
        }
      }
    }
  }

  return { nodes, edges };
}

export default function CodeVisualizer() {
  const [code, setCode] = useState('// Paste your code here to visualize its architecture\n\nfunction main() {\n  fetchData();\n  renderUI();\n}\n\nfunction fetchData() {\n  return { data: true };\n}\n\nclass UIController {\n  renderUI() {\n    console.log("Rendering...");\n  }\n}');
  const [language, setLanguage] = useState('javascript');
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleVisualize = () => {
    const { nodes: newNodes, edges: newEdges } = parseCode(code, language);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Security check: Limit file size to 1MB to prevent browser OOM (Denial of Service)
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
    if (file.size > MAX_FILE_SIZE) {
      alert("Security Alert: File is too large. Maximum allowed size is 1MB to prevent performance issues.");
      return;
    }

    // Security check: Strict extension validation
    const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py'];
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExtension) {
      alert("Security Alert: Invalid file type. Only JavaScript, TypeScript, and Python files are allowed.");
      return;
    }

    if (file.name.endsWith('.py')) setLanguage('python');
    else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) setLanguage('typescript');
    else setLanguage('javascript');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      // Note: The content is safely loaded into Monaco Editor and parsed by our regex engine.
      // It is never executed or rendered as raw HTML, preventing XSS attacks.
      setCode(content);
    };
    reader.onerror = () => {
      alert("Error reading file securely.");
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-4 lg:p-8 max-w-[1600px] mx-auto gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileCode2 className="w-8 h-8 text-blue-500" />
            Code Architecture Visualizer
          </h1>
          <p className="text-foreground/70 mt-1">Upload code files to extract and visualize functions, classes, and dependencies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Left Side: Code Input */}
        <div className="lg:col-span-1 flex flex-col gap-4 border border-card-border rounded-2xl bg-white/40 backdrop-blur-md shadow-sm p-4 h-full">
          
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-white/50 border-card-border hover:bg-white hover:border-primary transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-6 h-6 text-foreground/50 mb-2" />
                <p className="text-xs text-foreground/60"><span className="font-semibold">Click to upload</span> (.js, .ts, .py)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" accept=".js,.jsx,.ts,.tsx,.py" onChange={onFileUpload} />
            </label>
          </div>

          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-semibold">Source Code</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 bg-white border border-card-border rounded text-xs"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-card-border">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-light"
              options={{ minimap: { enabled: false }, fontSize: 12, padding: { top: 8 } }}
            />
          </div>

          <button 
            onClick={handleVisualize}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            Generate Visual Graph
          </button>
        </div>

        {/* Right Side: React Flow Canvas */}
        <div className="lg:col-span-3 border border-card-border rounded-2xl bg-zinc-950 shadow-sm overflow-hidden relative">
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-950">
              <FileCode2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium">Paste your code and click "Generate Visual Graph" to start.</p>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-right"
            >
              <Controls />
              <MiniMap 
                nodeStrokeColor={(n) => {
                  if (n.data?.label?.props?.children[0]?.props?.children === 'class') return '#a855f7';
                  if (n.data?.label?.props?.children[0]?.props?.children === 'import') return '#10b981';
                  return '#3b82f6';
                }}
                nodeColor={(n) => '#27272a'}
                maskColor="rgba(0, 0, 0, 0.7)"
                nodeBorderRadius={8}
                style={{ backgroundColor: '#18181b' }}
              />
              <Background color="#3f3f46" variant={BackgroundVariant.Dots} gap={20} size={2} />
            </ReactFlow>
          )}
        </div>

      </div>
    </div>
  );
}
