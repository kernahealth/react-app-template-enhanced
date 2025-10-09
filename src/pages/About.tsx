export function About() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>📖 About</h1>
        <p>This is the enhanced React template with additional features.</p>

        <div className="card">
          <h2>Enhanced Features:</h2>
          <ul style={{ textAlign: 'left', maxWidth: '400px' }}>
            <li>React Router DOM for routing</li>
            <li>TanStack Query for server state management</li>
            <li>Zustand for client state management</li>
            <li>MSW for API mocking in development and testing</li>
            <li>Axios HTTP client</li>
            <li>Sonner toast notifications</li>
            <li>React Hook Form + Zod for type-safe form validation</li>
          </ul>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Project Structure:</h2>
          <ul
            style={{ textAlign: 'left', maxWidth: '400px', fontSize: '0.9rem' }}
          >
            <li>
              <strong>Pages:</strong> Home, Users, Contact, About
            </li>
            <li>
              <strong>Services:</strong> apiClient, userService
            </li>
            <li>
              <strong>Stores:</strong> Zustand example store
            </li>
            <li>
              <strong>Mocks:</strong> Full CRUD API for users and orders
            </li>
            <li>
              <strong>Forms:</strong> React Hook Form with Zod validation
            </li>
            <li>
              <strong>Types:</strong> TypeScript definitions
            </li>
          </ul>
        </div>
      </header>
    </div>
  );
}
