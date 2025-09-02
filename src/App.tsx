import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 My Awesome React App</h1>
        <p>Hello World with Vite + TypeScript!</p>

        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>
          <p>This app is ready for deployment with the CDK template!</p>
        </div>

        <div className="features">
          <h2>✅ Features Ready:</h2>

          <p>TypeScript support</p>
          <p>ESLint + Prettier configured</p>
          <p>Jest unit testing</p>
          <p>Playwright E2E testing</p>
          <p>Production build optimized</p>
          <p>Trivy security scanning</p>
        </div>
      </header>
    </div>
  );
}

export default App;
