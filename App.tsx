import React, { useState } from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-cyan-400 p-10 font-mono">
      <h1 className="text-4xl font-bold mb-4">VIZUAL-X SYSTEM ONLINE</h1>
      <p className="text-xl mb-8 text-white">
        If you see this, the React core is functional.
      </p>
      
      <div className="border border-cyan-800 p-6 rounded bg-black/50">
        <h2 className="text-2xl mb-4">Diagnostic Panel</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>System Time: {new Date().toLocaleTimeString()}</li>
          <li>Environment: Local Dev</li>
          <li>Status: <span className="text-green-500">OPERATIONAL</span></li>
        </ul>
      </div>
    </div>
  );
};

export default App;