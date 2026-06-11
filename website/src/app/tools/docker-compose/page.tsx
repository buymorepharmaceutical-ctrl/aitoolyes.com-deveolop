'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import { Box, Server, Database, Check, Copy, Download, Cpu, HardDrive, Network } from 'lucide-react';

interface ServiceOption {
  id: string;
  name: string;
  image: string;
  category: 'database' | 'cache' | 'backend' | 'frontend' | 'monitoring';
  defaultPorts: string[];
  defaultEnv: Record<string, string>;
  defaultVolumes?: string[];
  selected: boolean;
}

const AVAILABLE_SERVICES: ServiceOption[] = [
  { id: 'postgres', name: 'PostgreSQL', image: 'postgres:15-alpine', category: 'database', defaultPorts: ['5432:5432'], defaultEnv: { POSTGRES_USER: 'user', POSTGRES_PASSWORD: 'password', POSTGRES_DB: 'app_db' }, defaultVolumes: ['postgres_data:/var/lib/postgresql/data'], selected: false },
  { id: 'mysql', name: 'MySQL', image: 'mysql:8.0', category: 'database', defaultPorts: ['3306:3306'], defaultEnv: { MYSQL_ROOT_PASSWORD: 'rootpassword', MYSQL_DATABASE: 'app_db', MYSQL_USER: 'user', MYSQL_PASSWORD: 'password' }, defaultVolumes: ['mysql_data:/var/lib/mysql'], selected: false },
  { id: 'mongo', name: 'MongoDB', image: 'mongo:6', category: 'database', defaultPorts: ['27017:27017'], defaultEnv: { MONGO_INITDB_ROOT_USERNAME: 'admin', MONGO_INITDB_ROOT_PASSWORD: 'password' }, defaultVolumes: ['mongo_data:/data/db'], selected: false },
  { id: 'redis', name: 'Redis', image: 'redis:7-alpine', category: 'cache', defaultPorts: ['6379:6379'], defaultEnv: {}, defaultVolumes: ['redis_data:/data'], selected: false },
  { id: 'node', name: 'Node.js App', image: 'node:18-alpine', category: 'backend', defaultPorts: ['3000:3000'], defaultEnv: { NODE_ENV: 'development' }, selected: false },
  { id: 'python', name: 'Python FastAPI / Flask', image: 'python:3.11-slim', category: 'backend', defaultPorts: ['8000:8000'], defaultEnv: {}, selected: false },
  { id: 'nginx', name: 'NGINX', image: 'nginx:alpine', category: 'frontend', defaultPorts: ['80:80', '443:443'], defaultEnv: {}, selected: false },
];

export default function DockerComposeGenerator() {
  const [services, setServices] = useState<ServiceOption[]>(AVAILABLE_SERVICES);
  const [copied, setCopied] = useState(false);

  const toggleService = (id: string) => {
    setServices(services.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const updatePort = (id: string, index: number, val: string) => {
    setServices(services.map(s => {
      if (s.id !== id) return s;
      const newPorts = [...s.defaultPorts];
      newPorts[index] = val;
      return { ...s, defaultPorts: newPorts };
    }));
  };

  const updateEnv = (id: string, key: string, val: string) => {
    setServices(services.map(s => {
      if (s.id !== id) return s;
      return { ...s, defaultEnv: { ...s.defaultEnv, [key]: val } };
    }));
  };

  const composeYaml = useMemo(() => {
    const selectedServices = services.filter(s => s.selected);
    if (selectedServices.length === 0) return '# Select services on the left to generate docker-compose.yml';

    let yaml = 'version: "3.8"\n\nservices:\n';
    const volumes = new Set<string>();

    selectedServices.forEach(s => {
      yaml += `  \${s.id}:\n`;
      yaml += `    image: \${s.image}\n`;
      yaml += `    container_name: \${s.id}_container\n`;
      yaml += `    restart: unless-stopped\n`;
      
      if (s.defaultPorts.length > 0) {
        yaml += `    ports:\n`;
        s.defaultPorts.forEach(p => {
          if (p.trim()) yaml += `      - "\${p}"\n`;
        });
      }
      
      const envKeys = Object.keys(s.defaultEnv);
      if (envKeys.length > 0) {
        yaml += `    environment:\n`;
        envKeys.forEach(k => {
          yaml += `      \${k}: \${s.defaultEnv[k]}\n`;
        });
      }

      if (s.defaultVolumes && s.defaultVolumes.length > 0) {
        yaml += `    volumes:\n`;
        s.defaultVolumes.forEach(v => {
          yaml += `      - \${v}\n`;
          volumes.add(v.split(':')[0]);
        });
      }
      
      if (s.category === 'backend' && selectedServices.some(db => db.category === 'database')) {
        yaml += `    depends_on:\n`;
        selectedServices.filter(db => db.category === 'database' || db.category === 'cache').forEach(db => {
          yaml += `      - \${db.id}\n`;
        });
      }
      yaml += '\n';
    });

    if (volumes.size > 0) {
      yaml += 'volumes:\n';
      volumes.forEach(v => {
        yaml += `  \${v}:\n`;
      });
    }

    return yaml;
  }, [services]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(composeYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([composeYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderIcon = (cat: string) => {
    switch (cat) {
      case 'database': return <Database className="w-5 h-5 text-blue-500" />;
      case 'cache': return <HardDrive className="w-5 h-5 text-orange-500" />;
      case 'backend': return <Cpu className="w-5 h-5 text-green-500" />;
      case 'frontend': return <Network className="w-5 h-5 text-purple-500" />;
      default: return <Server className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-6 p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Box className="w-8 h-8 text-primary" />
          Docker Compose Generator
        </h1>
        <p className="text-foreground/70 mt-1">Visually select your stack and instantly generate a perfectly formatted `docker-compose.yml`.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Side: Service Selector */}
        <div className="col-span-1 lg:col-span-5 flex flex-col border border-card-border rounded-2xl bg-white/40 backdrop-blur-md shadow-sm overflow-hidden">
          <div className="bg-white/60 px-4 py-3 border-b border-card-border font-bold">
            Select Services
          </div>
          <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
            {services.map(s => (
              <div key={s.id} className={`border rounded-xl transition-all \${s.selected ? 'border-primary bg-primary/5' : 'border-card-border bg-white/60 hover:bg-white/80'}`}>
                <div 
                  className="p-3 flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleService(s.id)}
                >
                  <input 
                    type="checkbox" 
                    checked={s.selected} 
                    readOnly 
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  {renderIcon(s.category)}
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{s.name}</h3>
                    <p className="text-xs text-foreground/50 font-mono">{s.image}</p>
                  </div>
                </div>

                {s.selected && (
                  <div className="p-3 pt-0 border-t border-primary/20 bg-white/50 mt-1">
                    
                    {s.defaultPorts.length > 0 && (
                      <div className="mt-2">
                        <label className="text-xs font-semibold text-foreground/70 mb-1 block">Ports (Host:Container)</label>
                        {s.defaultPorts.map((port, pIdx) => (
                          <input 
                            key={pIdx}
                            type="text"
                            value={port}
                            onChange={(e) => updatePort(s.id, pIdx, e.target.value)}
                            className="w-full text-sm font-mono p-1.5 border border-card-border rounded bg-white"
                          />
                        ))}
                      </div>
                    )}

                    {Object.keys(s.defaultEnv).length > 0 && (
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-foreground/70 mb-1 block">Environment Variables</label>
                        <div className="flex flex-col gap-1.5">
                          {Object.entries(s.defaultEnv).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold bg-black/5 px-1.5 py-1 rounded w-1/2 overflow-hidden text-ellipsis">{k}</span>
                              <input 
                                type="text"
                                value={v}
                                onChange={(e) => updateEnv(s.id, k, e.target.value)}
                                className="w-1/2 text-xs font-mono p-1.5 border border-card-border rounded bg-white flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Monaco Editor (YAML) */}
        <div className="col-span-1 lg:col-span-7 flex flex-col border border-card-border rounded-2xl bg-white/40 backdrop-blur-md shadow-sm overflow-hidden">
          <div className="bg-white/60 px-4 py-3 border-b border-card-border flex items-center justify-between">
            <h2 className="font-bold text-sm font-mono">docker-compose.yml</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDownload}
                className="text-xs flex items-center gap-1.5 hover:bg-black/5 px-3 py-1.5 rounded-md transition-colors font-medium text-foreground/70"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button 
                onClick={handleCopy}
                className="text-xs flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="yaml"
              value={composeYaml}
              theme="vs-light"
              options={{ minimap: { enabled: false }, readOnly: true, fontSize: 13, wordWrap: 'on', padding: { top: 16 } }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
