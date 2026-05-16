import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from '@/hooks/useGame';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import QuestsPage from '@/pages/QuestsPage';
import ShopPage from '@/pages/ShopPage';
import CharacterPage from '@/pages/CharacterPage';

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quests" element={<QuestsPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/character" element={<CharacterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </GameProvider>
    </BrowserRouter>
  );
}
