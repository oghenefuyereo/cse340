CREATE TABLE favorites (
  favorite_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL,
  inv_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account(account_id),
  FOREIGN KEY (inv_id) REFERENCES inventory(inv_id),
  UNIQUE (account_id, inv_id)
);
