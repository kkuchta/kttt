import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { colors } from '../shared/constants/colors';
import { GamePage } from './components/GamePage';
import { HomePage } from './components/HomePage';

function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        lineHeight: '1.5',
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
