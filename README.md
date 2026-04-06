# 🛍️ ENGMart — Cloud-Based Retail Management Platform

**MSc Information Technology Dissertation Project**
**Student:** Oluwasegun Ezekiel Toriola | B01798984
**University:** University of the West of Scotland
**Supervisor:** Dr Graeme McRobbie

---

## 📁 Project Structure

```
engmart/
├── database/
│   ├── 01_schema.sql       ← MySQL schema (run this first)
│   └── 02_seed.sql         ← Sample data (run this second)
├── backend/                ← Node.js + Express REST API
│   ├── src/
│   │   ├── config/         ← Database connection
│   │   ├── controllers/    ← Business logic
│   │   ├── middleware/     ← JWT auth
│   │   ├── models/
│   │   └── routes/         ← API endpoints
│   ├── tests/              ← Jest unit tests
│   ├── package.json
│   └── .env.example        ← Copy to .env and configure
└── frontend/               ← React.js SPA
    ├── src/
    │   ├── components/     ← UI components
    │   ├── context/        ← Auth context
    │   ├── pages/          ← Screen pages
    │   └── services/       ← Axios API client
    └── package.json
```

---

## 🖥️ Prerequisites (Mac)

Install these if you don't have them:

```bash
# 1. Install Homebrew (Mac package manager)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js (v20 LTS)
brew install node@20
node --version    # should show v20.x.x

# 3. Install MySQL 8
brew install mysql
brew services start mysql
mysql_secure_installation    # follow the prompts to set a root password

# 4. Install MySQL Workbench (optional GUI)
brew install --cask mysqlworkbench
```

---

## ⚙️ Step 1 — Set Up the Database

Open Terminal and log into MySQL:

```bash
mysql -u root -p
```

Then run the SQL files:

```sql
-- Inside MySQL prompt:
SOURCE /path/to/engmart/database/01_schema.sql;
SOURCE /path/to/engmart/database/02_seed.sql;

-- Verify it worked:
USE engmart;
SHOW TABLES;
SELECT COUNT(*) FROM products;    -- should show 18
SELECT COUNT(*) FROM users;       -- should show 3
```

---

## ⚙️ Step 2 — Set Up the Backend

```bash
# Navigate to backend folder
cd engmart/backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env

# Edit .env with your MySQL password
nano .env
# Change: DB_PASSWORD=your_mysql_password_here
# Change JWT_SECRET to something more random
```

Your `.env` should look like:
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YourActualPasswordHere
DB_NAME=engmart
JWT_SECRET=some_long_random_string_here
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev
# You should see:
# ✅ MySQL connected successfully
# 🚀 ENGMart API running at http://localhost:5000
```

Test it works:
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok","service":"ENGMart API",...}
```

---

## ⚙️ Step 3 — Set Up the Frontend

Open a **new Terminal tab/window**:

```bash
# Navigate to frontend folder
cd engmart/frontend

# Install dependencies
npm install

# Start the React dev server
npm start
# Browser should open at http://localhost:3000
```

---

## 🔑 Demo Login Credentials

| Role  | Email                    | Password      |
|-------|--------------------------|---------------|
| Admin | [redacted] | [redacted] |
| Staff | [redacted] | [redacted] |
| Staff | [redacted] | [redacted] |

> **Note:** The seed data passwords use a placeholder hash. To create working logins, register via the API (see below) or use the register endpoint to create your own admin user.

### Create a working admin user via API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-username",
    "email": "your-email@example.com",
    "password": "your-password",
    "role": "admin"
  }'
```

---

## 🛣️ API Endpoints Reference

| Method | Endpoint                        | Auth | Description                |
|--------|---------------------------------|------|----------------------------|
| POST   | /api/auth/register              | No   | Register new user          |
| POST   | /api/auth/login                 | No   | Login, get JWT token       |
| GET    | /api/auth/me                    | Yes  | Get current user           |
| GET    | /api/products                   | Yes  | List products (paginated)  |
| POST   | /api/products                   | Admin| Create product             |
| PUT    | /api/products/:id               | Admin| Update product             |
| DELETE | /api/products/:id               | Admin| Soft-delete product        |
| GET    | /api/inventory                  | Yes  | All inventory              |
| GET    | /api/inventory/alerts           | Yes  | Low-stock items            |
| PUT    | /api/inventory/:id/adjust       | Yes  | Adjust stock level         |
| POST   | /api/sales                      | Yes  | Process new sale           |
| GET    | /api/sales                      | Yes  | Sales history              |
| GET    | /api/sales/:id                  | Yes  | Sale details               |
| GET    | /api/reports/dashboard          | Yes  | Dashboard KPIs + charts    |
| GET    | /api/reports/sales?period=      | Admin| Sales report by period     |
| GET    | /api/categories                 | Yes  | List categories            |
| POST   | /api/categories                 | Admin| Create category            |

---

## 🧪 Running Tests

```bash
# From the backend folder:
cd engmart/backend
npm test
```

---

## 🏗️ Technology Stack

| Layer    | Technology        | Version  |
|----------|-------------------|----------|
| Frontend | React.js          | 18.x     |
| Frontend | React Router      | 6.x      |
| Frontend | Chart.js          | 4.x      |
| Frontend | Axios             | 1.x      |
| Backend  | Node.js           | 20 LTS   |
| Backend  | Express.js        | 4.x      |
| Backend  | jsonwebtoken      | 9.x      |
| Backend  | bcrypt            | 5.x      |
| Database | MySQL             | 8.x      |
| Testing  | Jest + Supertest  | 29.x     |
| Cloud    | AWS (EC2, RDS, S3, CloudFront) | — |

---

## 🔒 Security Features

- JWT stateless authentication on all protected routes
- bcrypt password hashing (cost factor 12)
- Role-Based Access Control (Admin vs Staff)
- HTTPS enforced via CloudFront (production)
- Helmet.js security headers
- SQL injection prevention via parameterised queries
- No real customer PII stored in demo

---

## 📦 AWS Deployment (Production)

1. **Frontend:** Build with `npm run build`, upload `build/` to S3, create CloudFront distribution
2. **Backend:** Deploy to AWS Elastic Beanstalk (Node.js platform)
3. **Database:** Create AWS RDS MySQL 8 instance in private subnet
4. **DNS:** Configure Route 53 for your domain
5. **Environment:** Set production env variables in Elastic Beanstalk console

---

*ENGMart — MSc IT Dissertation | University of the West of Scotland | 2026*
