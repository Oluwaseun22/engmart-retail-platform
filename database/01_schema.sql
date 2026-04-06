-- ============================================================
-- ENGMart Retail Management Platform
-- Database Schema — MySQL 8.x
-- Author: Oluwasegun Ezekiel Toriola | B01798984 | UWS MSc IT
-- ============================================================

CREATE DATABASE IF NOT EXISTS engmart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE engmart;

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  category_id   INT           NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL UNIQUE,
  description   TEXT,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id         INT           NOT NULL AUTO_INCREMENT,
  username        VARCHAR(100)  NOT NULL UNIQUE,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  role            ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  is_active             BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login            DATETIME,
  reset_token           VARCHAR(255)  NULL,
  reset_token_expires   DATETIME      NULL,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  product_id    INT             NOT NULL AUTO_INCREMENT,
  name          VARCHAR(200)    NOT NULL,
  sku           VARCHAR(100)    NOT NULL UNIQUE,
  description   TEXT,
  price         DECIMAL(10,2)   NOT NULL,
  category_id   INT             NOT NULL,
  is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: inventory
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  inventory_id    INT     NOT NULL AUTO_INCREMENT,
  product_id      INT     NOT NULL UNIQUE,
  quantity        INT     NOT NULL DEFAULT 0,
  reorder_level   INT     NOT NULL DEFAULT 10,
  last_updated    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by      INT,
  PRIMARY KEY (inventory_id),
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id)  REFERENCES products(product_id),
  CONSTRAINT fk_inventory_user    FOREIGN KEY (updated_by)  REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: sales
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  sale_id         INT             NOT NULL AUTO_INCREMENT,
  user_id         INT             NOT NULL,
  total_amount    DECIMAL(10,2)   NOT NULL,
  payment_method  ENUM('cash','card','bank_transfer') NOT NULL DEFAULT 'cash',
  status          ENUM('completed','pending','refunded') NOT NULL DEFAULT 'completed',
  notes           TEXT,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (sale_id),
  CONSTRAINT fk_sale_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: sale_items
-- ============================================================
CREATE TABLE IF NOT EXISTS sale_items (
  sale_item_id  INT           NOT NULL AUTO_INCREMENT,
  sale_id       INT           NOT NULL,
  product_id    INT           NOT NULL,
  quantity      INT           NOT NULL,
  unit_price    DECIMAL(10,2) NOT NULL,
  subtotal      DECIMAL(10,2) NOT NULL,
  discount      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (sale_item_id),
  CONSTRAINT fk_saleitem_sale    FOREIGN KEY (sale_id)    REFERENCES sales(sale_id),
  CONSTRAINT fk_saleitem_product FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_products_category  ON products(category_id);
CREATE INDEX idx_products_sku       ON products(sku);
CREATE INDEX idx_sales_user         ON sales(user_id);
CREATE INDEX idx_sales_created_at   ON sales(created_at);
CREATE INDEX idx_sale_items_sale    ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_inventory_product  ON inventory(product_id);
