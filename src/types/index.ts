export type CustomerType = 'cash' | 'installment';

export interface AccessoryItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  address: string;
  car_model: string;
  car_color: string;
  customer_type: CustomerType;
  gia_chot_lan_banh: number;
  gia_hoa_don: number;
  phu_kien_tang: string;
  luong_xe: number;
  luong_ngoai: number;
  tong_luong: number;
  
  // Tasks depending on type
  task_dat_coc: boolean;
  task_de_xuat_ban_hang: boolean;
  task_hop_dong: boolean;
  task_thong_bao_cho_vay: boolean; // only for installment
  task_mua_bhtv: boolean;
  task_bh_tnds: boolean;
  task_de_nghi_xuat_hoa_don: boolean;
  task_pdi: boolean;
  task_phu_kien: AccessoryItem[]; // JSON array
  task_bhtv: boolean; // only for installment
  task_xac_nhan_von_tu_co: boolean; // only for installment
  task_de_nghi_qua_tang: boolean;
  task_bien_ban_ban_giao: boolean;
  task_giay_ra_cong: boolean;
}
