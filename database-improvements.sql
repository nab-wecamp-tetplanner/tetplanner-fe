-- TetPlanner Database Schema Improvements
-- Apply these changes to fix design issues

-- 1. Remove redundant category_id from budget_transactions
-- (Category can be derived from todo_item.category_id)
ALTER TABLE budget_transactions 
  DROP COLUMN IF EXISTS category_id;

-- 2. Add constraints to prevent invalid data
ALTER TABLE todo_items 
  ADD CONSTRAINT check_quantity CHECK (quantity >= 1);

ALTER TABLE timeline_phases 
  ADD CONSTRAINT check_dates CHECK (start_date < end_date);

-- 3. Prevent duplicate configs for same user/year
ALTER TABLE tet_configs 
  ADD CONSTRAINT unique_owner_year UNIQUE (owner_id, year);

-- 4. Add constraint: shopping items must have category
ALTER TABLE todo_items 
  ADD CONSTRAINT check_shopping_category 
  CHECK (is_shopping = false OR category_id IS NOT NULL);

-- 5. Add constraint: shopping items must have estimated_price
ALTER TABLE todo_items 
  ADD CONSTRAINT check_shopping_price 
  CHECK (is_shopping = false OR estimated_price IS NOT NULL);

-- 6. Create function to auto-create budget transaction when item purchased
CREATE OR REPLACE FUNCTION create_budget_transaction_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for shopping items that change from not purchased to purchased
  IF NEW.is_shopping = true 
     AND OLD.purchased = false 
     AND NEW.purchased = true THEN
    
    INSERT INTO budget_transactions (
      amount,
      type,
      note,
      transaction_date,
      tet_config_id,
      todo_item_id,
      recorded_by
    ) VALUES (
      NEW.estimated_price * NEW.quantity,
      'expense',
      'Auto-generated from shopping item: ' || NEW.title,
      NOW(),
      NEW.tet_config_id,
      NEW.id,
      NEW.assigned_to
    );
  END IF;
  
  -- If item unpurchased, delete the transaction
  IF NEW.is_shopping = true 
     AND OLD.purchased = true 
     AND NEW.purchased = false THEN
    
    DELETE FROM budget_transactions 
    WHERE todo_item_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger
DROP TRIGGER IF EXISTS trigger_budget_transaction ON todo_items;
CREATE TRIGGER trigger_budget_transaction
  AFTER UPDATE OF purchased ON todo_items
  FOR EACH ROW
  EXECUTE FUNCTION create_budget_transaction_on_purchase();

-- 8. Create view for easy budget calculation
CREATE OR REPLACE VIEW budget_summary AS
SELECT 
  tc.id AS tet_config_id,
  tc.name AS config_name,
  tc.year,
  tc.total_budget,
  COALESCE(SUM(bt.amount) FILTER (WHERE bt.type = 'expense'), 0) AS used_budget,
  tc.total_budget - COALESCE(SUM(bt.amount) FILTER (WHERE bt.type = 'expense'), 0) AS remaining_budget
FROM tet_configs tc
LEFT JOIN budget_transactions bt ON bt.tet_config_id = tc.id
WHERE tc.deleted_at IS NULL
GROUP BY tc.id, tc.name, tc.year, tc.total_budget;

-- 9. Create view for category spending
CREATE OR REPLACE VIEW category_spending AS
SELECT 
  c.id AS category_id,
  c.name AS category_name,
  c.tet_config_id,
  c.allocated_budget,
  COALESCE(SUM(bt.amount), 0) AS spent,
  c.allocated_budget - COALESCE(SUM(bt.amount), 0) AS remaining
FROM categories c
LEFT JOIN todo_items ti ON ti.category_id = c.id AND ti.deleted_at IS NULL
LEFT JOIN budget_transactions bt ON bt.todo_item_id = ti.id AND bt.type = 'expense'
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name, c.tet_config_id, c.allocated_budget;

-- 10. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_budget_transactions_tet_config 
  ON budget_transactions(tet_config_id) WHERE tet_config_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_budget_transactions_type 
  ON budget_transactions(type);

CREATE INDEX IF NOT EXISTS idx_todo_items_tet_config_shopping 
  ON todo_items(tet_config_id, is_shopping) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_categories_tet_config 
  ON categories(tet_config_id) WHERE deleted_at IS NULL;
