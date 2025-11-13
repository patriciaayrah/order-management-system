# Setup Instructions

## Overview
This guide will help you set up the **Laravel + Next.js Inventory & Order Management System** from scratch, including database creation, environment configuration, and sample data installation.

---

## 🗄️ Database Setup

### 1. Create the Database
You’ll need **MySQL** installed locally or remotely.

Run the following SQL command in your MySQL client (e.g., phpMyAdmin, TablePlus, or terminal):

CREATE DATABASE db_oms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

### 2. Configure Database User

Ensure you have a MySQL user with permissions to access the new database:

CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON inventory_system.* TO 'inventory_user'@'localhost';
FLUSH PRIVILEGES;


Replace 'inventory_user' and 'password123' with your desired username and password.

## Environment Configuration (Laravel)
1. Duplicate the Example Environment File

In the Laravel root directory:

cp .env.example .env

2. Update the Environment Variables

Open .env in your text editor and modify the following lines:

APP_NAME="Inventory and Order Management System"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_oms
DB_USERNAME=inventory_user
DB_PASSWORD=password123

# Frontend (Next.js) API URL
FRONTEND_URL=http://localhost:3000

3. Generate Laravel App Key
php artisan key:generate

4. Run Database Migrations
php artisan migrate

### Sample Data Instructions
1. Seed the Database

You can populate the system with sample data for testing:

php artisan db:seed

If you only want to run one specific seeder:

php artisan db:seed --class=ProductSeeder
php artisan db:seed --class=InventoryLogSeeder

2. If you want to re-run the seeder with a clean database:

php artisan migrate:fresh --seed


## Running the Application
Backend (Laravel):
php artisan serve

Laravel backend will run on:

http://localhost:8000

Frontend (Next.js):
cd ../frontend
npm install
npm run dev

Next.js frontend will run on:

http://localhost:3000