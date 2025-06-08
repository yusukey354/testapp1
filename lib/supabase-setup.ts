// このファイルはSupabaseのテーブル構造をセットアップするためのものです
// 実際の環境では、マイグレーションツールを使用することをお勧めします

export const setupSupabaseTables = `
-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT 'user',
  store_id UUID REFERENCES public.stores(id)
);

-- 店舗テーブル
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スタッフテーブル
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  join_date DATE NOT NULL,
  store_id UUID NOT NULL REFERENCES public.stores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- スタッフトレーニングテーブル
CREATE TABLE IF NOT EXISTS public.staff_training (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  certified BOOLEAN DEFAULT FALSE,
  certified_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 日次データテーブル
CREATE TABLE IF NOT EXISTS public.daily_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  store_id UUID NOT NULL REFERENCES public.stores(id),
  sales INTEGER NOT NULL,
  cost INTEGER NOT NULL,
  labor_cost INTEGER NOT NULL,
  customer_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, store_id)
);

-- 月次データテーブル
CREATE TABLE IF NOT EXISTS public.monthly_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_month TEXT NOT NULL, -- 'YYYY-MM' 形式
  store_id UUID NOT NULL REFERENCES public.stores(id),
  total_sales INTEGER NOT NULL,
  total_cost INTEGER NOT NULL,
  total_labor_cost INTEGER NOT NULL,
  total_customer_count INTEGER NOT NULL,
  fixed_cost INTEGER NOT NULL,
  target_sales INTEGER NOT NULL,
  target_cost_ratio NUMERIC(5,2) NOT NULL,
  target_labor_cost_ratio NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year_month, store_id)
);

-- RLSポリシーの設定
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_data ENABLE ROW LEVEL SECURITY;

-- ユーザーポリシー
CREATE POLICY "ユーザーは自分自身のデータを読み取れる" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 店舗ポリシー
CREATE POLICY "認証されたユーザーは店舗データを読み取れる" ON public.stores
  FOR SELECT USING (auth.role() = 'authenticated');

-- スタッフポリシー
CREATE POLICY "ユーザーは自分の店舗のスタッフデータを読み取れる" ON public.staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.store_id = staff.store_id
    )
  );

CREATE POLICY "ユーザーは自分の店舗のスタッフデータを追加できる" ON public.staff
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.store_id = staff.store_id
    )
  );

CREATE POLICY "ユーザーは自分の店舗のスタッフデータを更新できる" ON public.staff
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.store_id = staff.store_id
    )
  );

CREATE POLICY "ユーザーは自分の店舗のスタッフデータを削除できる" ON public.staff
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.store_id = staff.store_id
    )
  );

-- 同様のポリシーを他のテーブルにも適用
`
