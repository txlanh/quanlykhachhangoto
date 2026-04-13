import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Customer } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateProgress(customer: Customer) {
  let tasks = [
    customer.task_dat_coc,
    customer.task_de_xuat_ban_hang,
    customer.task_hop_dong,
    customer.task_mua_bhtv,
    customer.task_bh_tnds,
    customer.task_de_nghi_xuat_hoa_don,
    customer.task_pdi,
    customer.task_de_nghi_qua_tang,
    customer.task_bien_ban_ban_giao,
    customer.task_giay_ra_cong,
  ];

  // Phu kien counts as 1 task.
  // We consider it "completed" if there is at least 1 item and all are completed, OR if we mark it completed via an overarching way.
  // Actually, let's treat "phu kien" as 1 task. We'll say it's completed if all sub-items are completed, and there is at least 1.
  // If there are 0 sub-items, maybe it's not completed? Or maybe we should add a separate boolean for "Phụ kiện completed".
  // To keep it simple: If customer has task_phu_kien arrays, and every item is completed, it's true. If empty, it's false.
  // But wait, what if they don't buy accessories? Then it should be skippable.
  // Let's modify the type to include `task_phu_kien_done`? No, let's evaluate based on the array:
  let phuKienDone = customer.task_phu_kien && customer.task_phu_kien.length > 0 && customer.task_phu_kien.every(a => a.completed);
  // Wait, if length is 0, they might not need accessories. Should it count as 1 total task always?
  // Let's assume it's 1 task. We will add a main checkbox for it in the UI and allow sub-tasks.
  // For now, let's just count the boolean tasks and the phuKien status.
  
  tasks.push(phuKienDone);

  if (customer.customer_type === 'installment') {
    tasks.push(
      customer.task_thong_bao_cho_vay,
      customer.task_bhtv,
      customer.task_xac_nhan_von_tu_co
    );
  }

  const completed = tasks.filter(Boolean).length;
  const total = tasks.length;
  return { completed, total, percentage: Math.round((completed / total) * 100) };
}
