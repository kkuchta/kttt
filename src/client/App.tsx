import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { GamePage } from './components/GamePage';
import { HomePage } from './components/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

export default App;
