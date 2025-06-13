function App() {
  const handleTestAPI = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      alert(`API Response: ${data.message}`);
    } catch (error) {
      alert('Failed to connect to API');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Kriegspiel Tic Tac Toe</h1>
      <p>Frontend is running! 🎮</p>
      <button
        onClick={handleTestAPI}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Test API Connection
      </button>
    </div>
  );
}

export default App;
