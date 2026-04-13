"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Circle, Car, Phone, Wallet, Plus, Trash2, Home, MapPin, ListChecks, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AccessoryItem, Customer } from "@/types";
import { calculateProgress } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetail(props: PageProps) {
  const params = use(props.params);
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAccessory, setNewAccessory] = useState("");

  const fetchCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setCustomer(data as Customer);
    } catch (err) {
      console.error(err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();

    const subscription = supabase
      .channel(`customer_${params.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers', filter: `id=eq.${params.id}` }, fetchCustomer)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [params.id]);

  if (loading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const updateTask = async (field: keyof Customer, value: any) => {
    // Optimistic update
    setCustomer((prev) => prev ? { ...prev, [field]: value } : prev);
    
    // To Database
    const { error } = await supabase
      .from("customers")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", customer.id);
      
    if (error) {
      console.error("Error updating task:", error);
      fetchCustomer(); // revert
    }
  };

  const updateFinances = async (luong_xe: number, luong_ngoai: number) => {
    const tong_luong = luong_xe + luong_ngoai;
    setCustomer(prev => prev ? { ...prev, luong_xe, luong_ngoai, tong_luong } : prev);
    
    await supabase
      .from("customers")
      .update({ luong_xe, luong_ngoai, tong_luong, updated_at: new Date().toISOString() })
      .eq("id", customer.id);
  };

  const updateAccessory = async (updatedAccessories: AccessoryItem[]) => {
    updateTask('task_phu_kien', updatedAccessories);
  };

  const addAccessory = () => {
    if (!newAccessory.trim()) return;
    const item: AccessoryItem = { id: Date.now().toString(), name: newAccessory, completed: false };
    updateAccessory([...(customer.task_phu_kien || []), item]);
    setNewAccessory("");
  };

  const toggleAccessory = (id: string) => {
    const arr = customer.task_phu_kien || [];
    const updated = arr.map(a => a.id === id ? { ...a, completed: !a.completed } : a);
    updateAccessory(updated);
  };

  const removeAccessory = (id: string) => {
    const updated = (customer.task_phu_kien || []).filter(a => a.id !== id);
    updateAccessory(updated);
  };

  const TaskItem = ({ title, field }: { title: string, field: keyof Customer }) => {
    const isCompleted = customer[field] as boolean;
    return (
      <button 
        onClick={() => updateTask(field, !isCompleted)}
        className={`w-full flex items-center justify-between p-4 mb-3 rounded-2xl border-2 transition-all active:scale-[0.98]
          ${isCompleted ? 'bg-blue-50/50 border-blue-500 shadow-sm shadow-blue-100' : 'bg-white border-gray-100 hover:border-blue-200'}
        `}
      >
        <span className={`font-semibold text-lg ${isCompleted ? 'text-blue-900' : 'text-gray-700'}`}>
          {title}
        </span>
        {isCompleted ? (
          <CheckCircle2 className="w-7 h-7 text-blue-500 fill-blue-100" />
        ) : (
          <Circle className="w-7 h-7 text-gray-300" />
        )}
      </button>
    );
  };

  const deleteCustomer = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      await supabase.from("customers").delete().eq("id", customer.id);
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white px-4 py-4 sticky top-0 z-20 border-b border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex gap-2">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200">
            <Home className="w-5 h-5 text-gray-700" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {customer.customer_type === 'cash' ? 'Trả thẳng' : 'Trả góp'}
          </span>
          <button onClick={deleteCustomer} className="p-2 text-red-500 active:bg-red-50 hover:bg-red-50 rounded-full">
             <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white px-6 py-6 pb-8 border-b-2 border-gray-100 rounded-b-3xl shadow-sm relative z-10 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
          {customer.name}
        </h1>
        
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
            <Phone className="w-5 h-5 text-gray-400 shrink-0" />
            <a href={`tel:${customer.phone}`} className="font-semibold text-blue-600 text-[15px]">{customer.phone}</a>
          </div>
          
          {customer.address && (
            <div className="flex items-start gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <span className="font-medium text-[15px] leading-snug">{customer.address}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
            <Car className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-lg">{customer.car_model} • {customer.car_color}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-700">Tiến độ giao xe</h3>
            <span className="font-extrabold text-blue-600">{calculateProgress(customer).percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${calculateProgress(customer).percentage === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
              style={{ width: `${calculateProgress(customer).percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2 mb-4">Quy trình giao xe</h2>

        <TaskItem title="1. Đặt cọc" field="task_dat_coc" />
        <TaskItem title="2. Đề xuất bán hàng" field="task_de_xuat_ban_hang" />
        <TaskItem title="3. Hợp đồng" field="task_hop_dong" />
        
        {customer.customer_type === 'installment' ? (
          <>
            <TaskItem title="4. Thông báo cho vay" field="task_thong_bao_cho_vay" />
            <TaskItem title="5. Mua Bảo hiểm thân vỏ" field="task_mua_bhtv" />
            <TaskItem title="6. Bảo hiểm TN Dân sự" field="task_bh_tnds" />
            <TaskItem title="7. Trao tặng BHTV" field="task_bhtv" />
            <TaskItem title="8. Xác nhận vốn tự có" field="task_xac_nhan_von_tu_co" />
            <TaskItem title="9. Đề nghị xuất hóa đơn" field="task_de_nghi_xuat_hoa_don" />
            <TaskItem title="10. PDI" field="task_pdi" />
          </>
        ) : (
          <>
            <TaskItem title="4. Mua Bảo hiểm thân vỏ" field="task_mua_bhtv" />
            <TaskItem title="5. Bảo hiểm TN Dân sự" field="task_bh_tnds" />
            <TaskItem title="6. Đề nghị xuất hóa đơn" field="task_de_nghi_xuat_hoa_don" />
            <TaskItem title="7. PDI" field="task_pdi" />
          </>
        )}
        
        <div className="bg-white rounded-2xl p-5 mb-3 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-lg text-gray-900">{customer.customer_type === 'installment' ? '11' : '8'}. Phụ kiện</h3>
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-bold">
              {(customer.task_phu_kien || []).filter(a => a.completed).length}/{(customer.task_phu_kien || []).length}
            </span>
          </div>
          
          <div className="space-y-3 mb-4">
            {(customer.task_phu_kien || []).map((item) => (
              <div key={item.id} className="flex flex-row items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl">
                 <button 
                  onClick={() => toggleAccessory(item.id)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                  )}
                  <span className={`font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                </button>
                <button onClick={() => removeAccessory(item.id)} className="p-2 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 relative">
            <input 
              type="text" 
              value={newAccessory}
              onChange={(e) => setNewAccessory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAccessory()}
              placeholder="VD: Dán kính, Trải sàn..." 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={addAccessory}
              className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <TaskItem title={`${customer.customer_type === 'installment' ? '12' : '9'}. Giấy đề nghị quà tặng`} field="task_de_nghi_qua_tang" />
        <TaskItem title={`${customer.customer_type === 'installment' ? '13' : '10'}. Biên bản bàn giao`} field="task_bien_ban_ban_giao" />
        <TaskItem title={`${customer.customer_type === 'installment' ? '14' : '11'}. Giấy ra cổng`} field="task_giay_ra_cong" />
      </div>

      {calculateProgress(customer).percentage >= 80 && (
        <div className="max-w-md mx-auto px-4 mt-8 mb-10">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2 mb-4">Tài chính (Chỉ hiện khi >80% tiến độ)</h2>
          <div className="bg-blue-50 p-5 rounded-2xl border-2 border-blue-100 shadow-sm">
            <label className="block text-sm font-medium text-blue-900 mb-1">Lương xe (VNĐ)</label>
            <input 
              type="text" 
              inputMode="numeric"
              className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-base font-bold text-blue-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4" 
              placeholder="0" 
              value={customer.luong_xe ? customer.luong_xe.toLocaleString('vi-VN') : ""} 
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                updateTask('luong_xe', Number(val) || 0);
              }}
              onBlur={() => updateFinances(customer.luong_xe || 0, customer.luong_ngoai || 0)} 
            />
            
            <label className="block text-sm font-medium text-blue-900 mb-1">Lương ngoài (VNĐ)</label>
            <input 
              type="text"
              inputMode="numeric"
              className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-base font-bold text-blue-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
              placeholder="0" 
              value={customer.luong_ngoai ? customer.luong_ngoai.toLocaleString('vi-VN') : ""} 
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                updateTask('luong_ngoai', Number(val) || 0);
              }}
              onBlur={() => updateFinances(customer.luong_xe || 0, customer.luong_ngoai || 0)} 
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 pb-safe">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Tổng tiền nhận được</p>
              <p className="text-xl font-extrabold text-green-600">
                {customer.tong_luong?.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
