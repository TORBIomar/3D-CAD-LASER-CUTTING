import React from 'react';
import { useCadStore } from './store/useCadStore';
import { HeaderNav } from './components/HeaderNav';
import { SidebarParameters } from './components/SidebarParameters';
import { SidebarReadouts } from './components/SidebarReadouts';
import { CadCanvas } from './components/canvas/CadCanvas';
import { Blueprint2DView } from './components/canvas/Blueprint2DView';
import { StatusBar } from './components/StatusBar';

export function App() {
  const { viewMode } = useCadStore();

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      <HeaderNav />

      <main className="flex flex-1 relative overflow-hidden">
        <SidebarParameters />

        <section className="flex-1 h-full relative">
          {viewMode === 'blueprint' ? <Blueprint2DView /> : <CadCanvas />}
        </section>

        <SidebarReadouts />
      </main>

      <StatusBar />
    </div>
  );
}

export default App;
