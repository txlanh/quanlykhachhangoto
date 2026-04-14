-- Copy and paste this into Supabase SQL Editor

DO $$ BEGIN
    CREATE TYPE customer_type AS ENUM ('cash', 'installment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  car_model TEXT NOT NULL,
  car_color TEXT,
  customer_type customer_type NOT NULL DEFAULT 'cash',
  
  -- Finance
  gia_chot_lan_banh BIGINT DEFAULT 0,
  gia_hoa_don BIGINT DEFAULT 0,
  phu_kien_tang TEXT,
  luong_xe BIGINT DEFAULT 0,
  luong_ngoai BIGINT DEFAULT 0,
  tong_luong BIGINT DEFAULT 0,
  
  -- Tasks (Boolean)
  task_dat_coc BOOLEAN DEFAULT false,
  task_de_xuat_ban_hang BOOLEAN DEFAULT false,
  task_hop_dong BOOLEAN DEFAULT false,
  task_thong_bao_cho_vay BOOLEAN DEFAULT false,
  task_bhtv BOOLEAN DEFAULT false,
  task_xac_nhan_von_tu_co BOOLEAN DEFAULT false,
  task_de_nghi_xuat_hoa_don BOOLEAN DEFAULT false,
  task_pdi BOOLEAN DEFAULT false,
  task_de_nghi_qua_tang BOOLEAN DEFAULT false,
  task_bien_ban_ban_giao BOOLEAN DEFAULT false,
  task_giay_ra_cong BOOLEAN DEFAULT false,
  
  -- Task Phụ kiện (JSON)
  task_phu_kien JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS task_mua_bhtv BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS task_bh_tnds BOOLEAN DEFAULT false;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS gia_chot_lan_banh BIGINT DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gia_hoa_don BIGINT DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phu_kien_tang TEXT;

ALTER TABLE customers ALTER COLUMN luong_xe TYPE BIGINT;
ALTER TABLE customers ALTER COLUMN luong_ngoai TYPE BIGINT;
ALTER TABLE customers ALTER COLUMN tong_luong TYPE BIGINT;

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS gia_chot_lan_banh BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS gia_hoa_don BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS phu_kien_tang TEXT;

-- Disable RLS
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Turn on Realtime for the customers table!
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'customers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE customers;
  END IF;
END $$;
