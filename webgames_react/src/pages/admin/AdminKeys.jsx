function AdminKeys() {
  return (
    <div>
      <h2 className="text-2xl font-bold">จัดการคลังคูปอง</h2>
      <p className="mt-2 text-sm text-gray-400">
        คลังโค้ดถูกจัดการโดยระบบ Go API และจะถูกตัดอัตโนมัติเมื่อมีการซื้อ
      </p>
      <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 text-yellow-200">
        API ปัจจุบันยังไม่มี endpoint สำหรับเพิ่ม ดู หรือถอนโค้ดในคลัง
        จึงไม่แสดงข้อมูลจำลองจาก localStorage เพื่อป้องกันยอดคงเหลือไม่ตรงกับฐานข้อมูล
      </div>
    </div>
  );
}

export default AdminKeys;
