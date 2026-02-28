import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Round1 from './pages/Round1';
import Round2 from './pages/Round2';
import Round3 from './pages/Round3';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/round1" element={<Round1 />} />
          <Route path="/round2" element={<Round2 />} />
          <Route path="/round3" element={<Round3 />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}
