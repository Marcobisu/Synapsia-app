import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profilo from './pages/Profilo';
import Archivio from './pages/Archivio';
import Sessione from './pages/Sessione';
import SynapsiaMap from './pages/SynapsiaMap';
import Mappa2D from './pages/Mappa2D';
import SplashScreen from './components/SplashScreen';
import './App.css';

function App() {
  const [splashLoading, setSplashLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (splashLoading) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="synapsia" element={<SynapsiaMap />} />
          <Route path="mappa-2d" element={<Mappa2D />} />
          <Route path="sessione" element={<Sessione />} />
          <Route path="archivio" element={<Archivio />} />
          <Route path="profilo" element={<Profilo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
