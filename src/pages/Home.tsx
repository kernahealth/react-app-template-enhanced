import { useExampleStore } from '../stores/exampleStore';

export function Home() {
  const { count, increment, decrement, reset } = useExampleStore();

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 My Awesome React App</h1>
        <p>Hello World with Vite + TypeScript!</p>

        <div className="card">
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <button onClick={decrement}>-</button>
            <span>Count is {count}</span>
            <button onClick={increment}>+</button>
          </div>
          <button onClick={reset} style={{ marginTop: '1rem' }}>
            Reset Counter
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
            Counter persisted with Zustand 💾
          </p>
          <p>This app is ready for deployment with the CDK template!</p>
        </div>

        <div className="features">
          <h2>✅ Features Ready:</h2>

          <p>TypeScript support</p>
          <p>ESLint + Prettier configured</p>
          <p>Vitest unit testing</p>
          <p>Playwright E2E testing</p>
          <p>Production build optimized</p>
          <p>Trivy security scanning</p>
          <p>React Router DOM</p>
          <p>TanStack Query</p>
          <p>Zustand state management</p>
          <p>MSW for API mocking</p>
        </div>
      </header>
    </div>
  );
}
