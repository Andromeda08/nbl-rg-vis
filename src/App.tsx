import g1 from './assets/compiled_Cull_Graph.json';
import g2 from './assets/compiled_RG_DefaultPipeline.json';

import { type FC, useState } from 'react';

import { Footer } from './components/Footer.tsx';
import { Header } from './components/Header.tsx';
import { Visualization } from './components/Visualization.tsx';

const App: FC = () => {
  const graphs = [g1, g2];
  const [activeGraph, setActiveGraph] = useState(graphs[0]);

  return (
    <div className="h-screen max-h-screen w-screen flex flex-col">
      <Header graphs={graphs} activeGraphName={activeGraph.inputGraphName} setActiveGraph={setActiveGraph} resourceCount={activeGraph.resourceTemplates.length} />
      <main className="h-full px-16 py-4">
        <Visualization data={activeGraph} />
      </main>
      <Footer data={activeGraph} />
    </div>
  );
};

export default App;
