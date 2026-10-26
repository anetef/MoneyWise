-- Acelera a listagem paginada quando categoria e período são combinados.
CREATE INDEX idx_transactions_user_category_date
    ON transactions (user_id, category, date DESC, id DESC);
