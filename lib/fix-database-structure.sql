-- 既存のテーブル構造を確認し、不足しているカラムを追加
-- staffテーブルをusersテーブルに変更したことに対応

-- daily_dataテーブルの構造確認と修正
ALTER TABLE daily_data 
ADD COLUMN IF NOT EXISTS food_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS beverage_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS food_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS beverage_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_cost INTEGER DEFAULT 0;

-- monthly_dataテーブルの構造確認と修正
ALTER TABLE monthly_data 
ADD COLUMN IF NOT EXISTS food_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS beverage_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS customer_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_food_cost_ratio DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_beverage_cost_ratio DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_labor_cost_ratio DECIMAL(5,2) DEFAULT 0;

-- usersテーブル（旧staffテーブル）の構造確認と修正
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS position TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff',
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hourly_rate INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS store_id UUID DEFAULT NULL;

-- staff_trainingテーブルの構造確認と修正
-- user_idカラムが正しく設定されているか確認
ALTER TABLE staff_training 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS certification_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- 外部キー制約の確認と修正（必要に応じて）
-- staff_trainingテーブルのuser_idがusersテーブルのidを参照していることを確認
DO $$
BEGIN
    -- 古い外部キー制約を削除（存在する場合）
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'staff_training_staff_id_fkey'
    ) THEN
        ALTER TABLE staff_training DROP CONSTRAINT staff_training_staff_id_fkey;
    END IF;
    
    -- 新しい外部キー制約を追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'staff_training_user_id_fkey'
    ) THEN
        ALTER TABLE staff_training 
        ADD CONSTRAINT staff_training_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- storesテーブルの構造確認（基本的な構造は問題ないはず）

-- サンプルデータの投入（テーブルが空の場合）
INSERT INTO stores (id, name, created_at, updated_at) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'サンプル店舗',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- daily_dataのサンプルデータ
INSERT INTO daily_data (
  id, store_id, date, sales, food_sales, beverage_sales, 
  food_cost, beverage_cost, labor_cost, other_cost, customer_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  CURRENT_DATE,
  150000,
  105000,
  45000,
  30000,
  15000,
  30000,
  10000,
  120,
  NOW(),
  NOW()
) ON CONFLICT (store_id, date) DO UPDATE SET
  sales = EXCLUDED.sales,
  food_sales = EXCLUDED.food_sales,
  beverage_sales = EXCLUDED.beverage_sales,
  food_cost = EXCLUDED.food_cost,
  beverage_cost = EXCLUDED.beverage_cost,
  labor_cost = EXCLUDED.labor_cost,
  other_cost = EXCLUDED.other_cost,
  customer_count = EXCLUDED.customer_count,
  updated_at = NOW();

-- monthly_dataのサンプルデータ
INSERT INTO monthly_data (
  id, store_id, year, month, sales, food_cost, beverage_cost,
  labor_cost, other_cost, customer_count, target_sales,
  target_food_cost_ratio, target_beverage_cost_ratio, target_labor_cost_ratio,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  EXTRACT(YEAR FROM CURRENT_DATE),
  EXTRACT(MONTH FROM CURRENT_DATE),
  4500000,
  1350000,
  450000,
  900000,
  300000,
  3600,
  5000000,
  30.0,
  10.0,
  20.0,
  NOW(),
  NOW()
) ON CONFLICT (store_id, year, month) DO UPDATE SET
  sales = EXCLUDED.sales,
  food_cost = EXCLUDED.food_cost,
  beverage_cost = EXCLUDED.beverage_cost,
  labor_cost = EXCLUDED.labor_cost,
  other_cost = EXCLUDED.other_cost,
  customer_count = EXCLUDED.customer_count,
  updated_at = NOW();

-- usersのサンプルデータ（旧staffテーブル）
INSERT INTO users (
  id, store_id, name, position, email, phone, join_date,
  status, role, skills, hourly_rate, notes, created_at, updated_at
) VALUES 
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  '田中太郎',
  'シェフ',
  'tanaka@example.com',
  '090-1234-5678',
  '2023-01-15',
  'active',
  'chef',
  ARRAY['料理', '食材管理', 'メニュー開発'],
  1500,
  'ベテランシェフ',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  '佐藤花子',
  'ホールスタッフ',
  'sato@example.com',
  '090-2345-6789',
  '2023-03-01',
  'active',
  'hall',
  ARRAY['接客', 'レジ操作', '清掃'],
  1200,
  '接客スキルが高い',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  '鈴木一郎',
  'マネージャー',
  'suzuki@example.com',
  '090-3456-7890',
  '2022-06-01',
  'active',
  'manager',
  ARRAY['管理', '売上分析', 'スタッフ指導'],
  2000,
  '店舗運営責任者',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- staff_trainingのサンプルデータ
WITH user_ids AS (
  SELECT id, name FROM users WHERE store_id = '550e8400-e29b-41d4-a716-446655440000'
)
INSERT INTO staff_training (
  id, user_id, skill_name, progress, certified, certification_date, notes, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  skill,
  CASE 
    WHEN u.name = '田中太郎' THEN 85
    WHEN u.name = '佐藤花子' THEN 92
    WHEN u.name = '鈴木一郎' THEN 78
    ELSE 70
  END,
  CASE 
    WHEN u.name = '田中太郎' THEN true
    WHEN u.name = '佐藤花子' THEN true
    ELSE false
  END,
  CASE 
    WHEN u.name = '田中太郎' THEN '2023-06-01'::date
    WHEN u.name = '佐藤花子' THEN '2023-08-01'::date
    ELSE NULL
  END,
  'トレーニング進行中',
  NOW(),
  NOW()
FROM user_ids u
CROSS JOIN (
  VALUES 
    ('基本接客'),
    ('食品衛生'),
    ('安全管理'),
    ('チームワーク')
) AS skills(skill)
ON CONFLICT DO NOTHING;
