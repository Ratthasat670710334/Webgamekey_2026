
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';

import AdminLayout from './pages/admin/AdminLayout';
import AdminGames from './pages/admin/AdminGames';
import AdminKeys from './pages/admin/AdminKeys';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembers from './pages/admin/AdminMembers';

import Home from './pages/Home';
import GameDetail from './pages/GameDetail';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import Payment from './pages/Payment';
import NotFound from './pages/NotFound';
import About from './pages/About';

function App() {
  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />

          <Route path="/game/:id" element={<GameDetail />} />

          <Route
            path="/payment"
            element={
              <ProtectedRoute role="member">
                <Payment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute role="member">
                <OrderHistory />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminLayout />
              </RequireRole>
            }
          >
            <Route index element={<Navigate to="games" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="members" element={<AdminMembers />} />
            <Route path="games" element={<AdminGames />} />
            <Route path="keys" element={<AdminKeys />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
