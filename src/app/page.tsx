"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, AlertCircle, ChevronRight, Car, Search, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";
import { differenceInDays } from "date-fns";
import { calculateProgress } from "@/lib/utils";

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'attention' | 'all' | 'referencing' | 'processing' | 'completed'>('attention');
  const [searchQuery, setSearchQuery] = useState('');
  // --- LOGIC XỬ LÝ VUỐT (SWIPE) ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const tabs = ['attention', 'all', 'referencing', 'processing', 'completed'] as const;
      const currentIndex = tabs.indexOf(filter);

      if (isLeftSwipe && currentIndex < tabs.length - 1) {
        setFilter(tabs[currentIndex + 1]);
      }
      if (isRightSwipe && currentIndex > 0) {
        setFilter(tabs[currentIndex - 1]);
      }
    }
  };
  // --- KẾT THÚC LOGIC XỬ LÝ VUỐT ---

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching customers:", error);
      } else if (data) {
        setCustomers(data as Customer[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('customers_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, fetchCustomers)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const isNeedsAttention = (customer: Customer, progress: number) => {
    const isOverdue = differenceInDays(new Date(), new Date(customer.updated_at)) > 2;
    return isOverdue && progress < 100;
  };

  return (
    <main
      className="min-h-screen bg-gray-50 pb-24"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Danh sách khách hàng</h1>
        </div>
        <div className="max-w-md mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm tên, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 pb-0">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3">
            <button onClick={() => setFilter('attention')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'attention' ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-gray-100 text-gray-600'}`}>Nhắc nhở</button>
            <button onClick={() => setFilter('all')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-600'}`}>Tất cả</button>
            <button onClick={() => setFilter('referencing')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'referencing' ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-gray-100 text-gray-600'}`}>Đang tham khảo</button>
            <button onClick={() => setFilter('processing')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'processing' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-600'}`}>Đang thủ tục</button>
            <button onClick={() => setFilter('completed')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'completed' ? 'bg-green-500 text-white shadow-md shadow-green-200' : 'bg-gray-100 text-gray-600'}`}>Đã giao xe</button>
          </div>
        </div>
      </div>

      <div
        className="max-w-md mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (() => {
          const filteredCustomers = customers.filter(customer => {
            // Search filter
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              if (!customer.name.toLowerCase().includes(query) && !customer.phone.includes(query)) {
                return false;
              }
            }

            // Tab filter
            const { percentage } = calculateProgress(customer);
            const needsAttention = isNeedsAttention(customer, percentage);

            if (filter === 'attention') return needsAttention;
            if (filter === 'all') return true;
            if (filter === 'referencing') return percentage === 0;
            if (filter === 'processing') return percentage > 0 && percentage < 100;
            if (filter === 'completed') return percentage === 100;
            return true;
          });

          if (filteredCustomers.length === 0) {
            return (
              <div className="text-center py-20 flex flex-col items-center">
                <Car className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">{searchQuery || filter !== 'all' ? 'Không tìm thấy hồ sơ nào phù hợp' : 'Chưa có khách hàng nào'}</p>
                {!(searchQuery || filter !== 'all') && <p className="text-sm text-gray-400 mt-1">Bấm vào dấu + để thêm mới</p>}
              </div>
            );
          }

          return filteredCustomers.map((customer) => {
            const { percentage } = calculateProgress(customer);
            const needsAttention = isNeedsAttention(customer, percentage);

            return (
              <Link key={customer.id} href={`/customer/${customer.id}`}>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-500">{customer.car_model} • {customer.car_color}</p>
                    </div>
                    {needsAttention && (
                      <div className="flex items-center bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Cần chăm sóc</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className={`font-semibold px-2 py-0.5 rounded-md ${customer.customer_type === 'cash' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                      {customer.customer_type === 'cash' ? 'Trả thẳng' : 'Trả góp'}
                    </span>
                    <span className="font-bold text-blue-600">{percentage}%</span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${percentage === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
            );
          });
        })()}
      </div>

      <Link
        href="/new"
        className="fixed p-4 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200 bottom-8 right-6 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </main>
  );
}
