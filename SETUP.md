# ENGMart Setup Guide

## Step 1 — Database
```bash
mysql -u root -p
```
Then inside MySQL:
```sql
SOURCE /path/to/engmart/database/01_schema.sql;
SOURCE /path/to/engmart/database/02_seed.sql;
```

## Step 2 — Backend
```bash
cd engmart/backend
npm install
cp .env.example .env
# Edit .env with your MySQL password and Resend API key
npm run dev
```

## Step 3 — Frontend
Open a new terminal tab:
```bash
cd engmart/frontend
npm install
npm start
```

## Step 4 — Create admin user
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"segun","email":"seguntoriola25@gmail.com","password":"Password123!","role":"staff"}'
```
Then update the role to admin in MySQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'seguntoriola25@gmail.com';
```

## Demo credentials (from seed data)
- Admin: sarah@engmart.co.uk / Password123!
- Staff: james@engmart.co.uk / Password123!
