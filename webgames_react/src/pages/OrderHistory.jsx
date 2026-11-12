
import { useEffect, useState } from 'react';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    const savedOrders = JSON.parse(
      localStorage.getItem('gamekey_orders') || '[]'
    );

    setOrders(savedOrders);
  }, []);

  async function copyKey(key) {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);

      setTimeout(() => {
        setCopiedKey('');
      }, 2000);
    } catch (error) {
      alert('ไม่สามารถคัดลอกคีย์ได้ กรุณาคัดลอกด้วยตนเอง');
    }
  }

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-10 text-white">

      <div className="mx-auto max-w-5xl">

        <h1 className="text-3xl font-black">
          ประวัติการสั่งซื้อ
        </h1>

        <p className="mt-2 text-gray-400">
          รายการเกมที่คุณซื้อสำเร็จ พร้อม CD-Key ของคุณ
        </p>

        {orders.length === 0 ? (

          <div className="mt-10 rounded-2xl border border-white/10 bg-[#14141f] p-10 text-center">

            <p className="text-5xl">🛒</p>

            <h2 className="mt-4 text-xl font-bold">
              ยังไม่มีประวัติการสั่งซื้อ
            </h2>

            <p className="mt-2 text-gray-400">
              เลือกซื้อเกมที่คุณชื่นชอบได้เลย
            </p>

          </div>

        ) : (

          <div className="mt-8 space-y-6">

            {orders.map((order) => (

              <div
                key={order.orderId}
                className="rounded-2xl border border-white/10 bg-[#14141f] p-6"
              >

                <div className="flex flex-wrap justify-between gap-3 border-b border-white/10 pb-4">

                  <div>
                    <p className="text-sm text-gray-400">
                      หมายเลขคำสั่งซื้อ
                    </p>

                    <p className="font-bold">
                      {order.orderId}
                    </p>
                  </div>

                  <span className="h-fit rounded-lg bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-400">
                    {order.status}
                  </span>

                </div>

                <div className="mt-4 flex flex-wrap justify-between gap-4">

                  <div>
                    <p className="text-sm text-gray-400">
                      วันที่สั่งซื้อ
                    </p>

                    <p>{order.date}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      จำนวนคีย์
                    </p>

                    <p>{order.quantity} คีย์</p>
                  </div>

                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4">

                  <img
                    src={order.poster}
                    alt={order.title}
                    className="h-24 w-36 rounded-lg object-cover"
                  />

                  <div>
                    <h3 className="text-lg font-bold">
                      {order.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-400">
                      {order.platform} / {order.region}
                    </p>
                  </div>

                </div>

                <div className="mt-6 border-t border-white/10 pt-5">

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-purple-400">
                      🔑 CD-Key ของคุณ
                    </h3>

                    <span className="text-xs text-gray-500">
                      {order.keys?.length || 0} คีย์
                    </span>
                  </div>

                  {order.keys && order.keys.length > 0 ? (

                    <div className="mt-4 space-y-3">

                      {order.keys.map((key, index) => (

                        <div
                          key={`${order.orderId}-${index}`}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#09090f] p-4"
                        >

                          <div>
                            <p className="mb-2 text-xs text-gray-500">
                              KEY #{index + 1}
                            </p>

                            <p className="break-all font-mono text-sm font-semibold tracking-wide text-white">
                              {key}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyKey(key)}
                            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold transition hover:bg-purple-500"
                          >
                            {copiedKey === key ? '✓ คัดลอกแล้ว' : '📋 Copy'}
                          </button>

                        </div>

                      ))}

                    </div>

                  ) : (

                    <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                      <p className="text-sm text-yellow-400">
                        รายการสั่งซื้อนี้เกิดขึ้นก่อนเพิ่มระบบ CD-Key จึงไม่มีคีย์บันทึกไว้
                      </p>
                    </div>

                  )}

                </div>

                <div className="mt-6 flex justify-between border-t border-white/10 pt-4">

                  <span className="text-gray-400">
                    ยอดชำระ
                  </span>

                  <span className="text-xl font-black text-purple-400">
                    ฿{Number(order.totalPrice).toLocaleString('th-TH')}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default OrderHistory;
