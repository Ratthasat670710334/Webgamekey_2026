
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGames from './pages/admin/AdminGames';
import AdminKeys from './pages/admin/AdminKeys';
import AdminMembers from './pages/admin/AdminMembers';

import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
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

          <Route path="/game/:id" element={<MovieDetail />} />

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
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
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
