"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CustomerType } from "@/types";

export default function NewCustomer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    car_model: "",
    car_color: "",
    customer_type: "cash" as CustomerType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.from("customers").insert([
        {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          car_model: formData.car_model,
          car_color: formData.car_color,
          customer_type: formData.customer_type,
          luong_xe: 0,
          luong_ngoai: 0,
          tong_luong: 0,
          
          task_dat_coc: false,
          task_de_xuat_ban_hang: false,
          task_hop_dong: false,
          task_mua_bhtv: false,
          task_bh_tnds: false,
          task_thong_bao_cho_vay: false,
          task_de_nghi_xuat_hoa_don: false,
          task_pdi: false,
          task_phu_kien: [],
          task_bhtv: false,
          task_xac_nhan_von_tu_co: false,
          task_de_nghi_qua_tang: false,
          task_bien_ban_ban_giao: false,
          task_giay_ra_cong: false,
        }
      ]).select();

      if (error) throw error;

      if (data && data[0]) {
        router.push(`/customer/${data[0].id}`);
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Error creating customer:", error);
      const errMsg = error?.message || error?.error_description || error?.code || JSON.stringify(error, Object.getOwnPropertyNames(error));
      alert(`Lưu thất bại. Chi tiết lỗi: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">Thêm Khách Hàng</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-32">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Loại khách hàng (*)</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, customer_type: 'cash'})}
                className={`py-3 px-4 rounded-xl font-semibold border-2 transition-all ${formData.customer_type === 'cash' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
              >
                Trả thẳng
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, customer_type: 'installment'})}
                className={`py-3 px-4 rounded-xl font-semibold border-2 transition-all ${formData.customer_type === 'installment' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
              >
                Trả góp
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Thông tin chung</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên (*)</label>
              <input required type="text" className={inputClass} placeholder="Vd: Nguyễn Văn A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại (*)</label>
              <input required type="tel" className={inputClass} placeholder="Vd: 0912345678" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input type="text" className={inputClass} placeholder="Vd: Quận 1, TP.HCM" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu xe (*)</label>
                <input required type="text" className={inputClass} placeholder="Vd: CX-5" value={formData.car_model} onChange={e => setFormData({...formData, car_model: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Màu xe</label>
                <input type="text" className={inputClass} placeholder="Vd: Đỏ" value={formData.car_color} onChange={e => setFormData({...formData, car_color: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-10 pb-safe">
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Lưu Khách Hàng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
