
import { useEffect, useState } from 'react';
import games from '../../data/games';

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
  });
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    gameCount: 0,
    memberCount: 0,
    orderCount: 0,
    sales: 0,
    availableKeys: 0,
    pendingOrders: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const users = readStorage('gamekey_users');
    const orders = readStorage('gamekey_orders');

    let inventory = {};

    try {
      inventory = JSON.parse(
        localStorage.getItem('gamekey_inventory') || '{}'
      );
    } catch {
      inventory = {};
    }

    const availableKeys = Object.values(inventory).reduce(
      (total, keys) => total + (Array.isArray(keys) ? keys.length : 0),
      0
    );

    const completedOrders = orders.filter(
      (order) =>
        order.status === 'ชำระเงินสำเร็จ' ||
        order.status === 'ซื้อสำเร็จ'
    );

    const sales = completedOrders.reduce(
      (total, order) => total + Number(order.totalPrice || 0),
      0
    );

    const pendingOrders = orders.filter(
      (order) =>
        order.status !== 'ชำระเงินสำเร็จ' &&
        order.status !== 'ซื้อสำเร็จ'
    ).length;

    setStats({
      gameCount: Array.isArray(games) ? games.length : 0,
      memberCount: users.length + 1,
      orderCount: orders.length,
      sales,
      availableKeys,
      pendingOrders
    });

    setRecentOrders(
      [...orders].reverse().slice(0, 5)
    );
  }, []);

  const cards = [
    {
      title: 'เกมทั้งหมด',
      value: stats.gameCount.toLocaleString('th-TH'),
      icon: '🎮',
      detail: 'เกมในระบบร้านค้า'
    },
    {
      title: 'สมาชิกทั้งหมด',
      value: stats.memberCount.toLocaleString('th-TH'),
      icon: '👥',
      detail: 'รวมบัญชี Demo Member'
    },
    {
      title: 'คำสั่งซื้อทั้งหมด',
      value: stats.orderCount.toLocaleString('th-TH'),
      icon: '📦',
      detail: 'รายการสั่งซื้อในระบบ'
    },
    {
      title: 'ยอดขายรวม',
      value: formatMoney(stats.sales),
      icon: '💰',
      detail: 'นับเฉพาะรายการที่ชำระสำเร็จ'
    },
    {
      title: 'CD-Key คงเหลือ',
      value: stats.availableKeys.toLocaleString('th-TH'),
      icon: '🔑',
      detail: 'คีย์ที่ถูกสร้างและยังไม่ถูกใช้'
    },
    {
      title: 'รายการรอดำเนินการ',
      value: stats.pendingOrders.toLocaleString('th-TH'),
      icon: '⏳',
      detail: 'รายการที่ยังไม่ใช่สถานะชำระสำเร็จ'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="mt-2 text-sm text-gray-400">
          ภาพรวมข้อมูลร้านค้า GAMEKEY STORE
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-white/10 bg-[#12121d] p-5 transition hover:border-purple-500/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{card.title}</p>
              <span className="text-2xl">{card.icon}</span>
            </div>

            <p className="mt-5 break-words text-2xl font-bold text-white">
              {card.value}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {card.detail}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#12121d]">
        <div className="border-b border-white/10 px-5 py-5">
          <h3 className="text-lg font-bold">คำสั่งซื้อล่าสุด</h3>
          <p className="mt-1 text-sm text-gray-500">
            แสดงรายการล่าสุดไม่เกิน 5 รายการ
          </p>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-3xl">📭</p>
            <p className="mt-3 text-sm text-gray-400">
              ยังไม่มีคำสั่งซื้อ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="px-5 py-4 font-medium">เลขที่คำสั่งซื้อ</th>
                  <th className="px-5 py-4 font-medium">เกม</th>
                  <th className="px-5 py-4 font-medium">จำนวน</th>
                  <th className="px-5 py-4 font-medium">ยอดรวม</th>
                  <th className="px-5 py-4 font-medium">สถานะ</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={order.orderId || index}
                    className="border-t border-white/5"
                  >
                    <td className="px-5 py-4 text-gray-300">
                      {order.orderId || '-'}
                    </td>
                    <td className="px-5 py-4 text-white">
                      {order.game?.title || order.title || '-'}
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {order.quantity || 0}
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {formatMoney(order.totalPrice)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          order.status === 'ชำระเงินสำเร็จ' ||
                          order.status === 'ซื้อสำเร็จ'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {order.status || 'ไม่ระบุสถานะ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-5 text-xs text-gray-600">
        หมายเหตุ: ข้อมูลในหน้านี้อ่านจาก localStorage ของเบราว์เซอร์เครื่องนี้
        จึงเป็นข้อมูลสำหรับระบบจำลองเท่านั้น
      </p>
    </div>
  );
}

export default AdminDashboard;
