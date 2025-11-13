# Inventory & Order Management System

## Project Description
This is a full-stack inventory and order management system built with **Laravel** (backend) and **Next.js** (frontend), using **MySQL** as the database. The system allows businesses to manage products, track inventory, process orders, handle cancellations, log activities, and generate basic reports.  

---

## Core Requirements

### 1. Product / Inventory Management
- Add, edit, and delete products.
- Track inventory quantities in real-time.
- Display current stock levels for all products.

### 2. Order Processing System
- Create new orders.
- Add products to orders with specific quantities.
- Automatically deduct inventory when an order is confirmed.
- Calculate order totals based on product pricing.

### 3. Order Cancellation
- Cancel orders fully or partially.
- Restore inventory when items are cancelled.
- Update order status accordingly.

### 4. Activity Logging
- Log all inventory changes (additions, deductions, restores).
- Log all order activities (created, confirmed, cancelled).
- Display activity timeline/history for auditing purposes.

### 5. Basic Reporting
- Summary of total orders.
- Inventory status overview.
- Revenue calculations.

---

## Technology Stack
- **Backend:** Laravel
- **Frontend:** Next.js
- **Database:** MySQL
- **API:** RESTful endpoints for frontend-backend communication

---

## Setup / Installation Instructions

### Backend (Laravel)
1. Clone the repository:
git clone https://github.com/patriciaayrah/order-management-system.git
cd <backend-folder>

2. Install PHP dependencies:
composer install

3. Copy .env.example to .env and configure database credentials:
cp .env.example .env

4. Generate application key:
php artisan key:generate

5. Run migrations and seeders:
php artisan migrate

6. Start the Laravel server:
php artisan serve

### Frontend (Next.js)

Navigate to the frontend folder:
cd ../frontend

1. Install Node dependencies:
npm install

2. Start the development server:
npm run dev

3. Open the application at:

http://localhost:3000


## How to Use

Products: Add, edit, or delete products. Track stock levels in real-time.

Orders: Create new orders, add products, confirm, or cancel them.

Inventory: Automatic deduction/restoration upon order confirmation or cancellation.

Activity Logs: View all inventory and order activity history.

Reports: Check overall inventory status, total orders, and revenue summaries.

## Key Features

Real-time inventory management.

Automatic inventory updates with order processing.

Activity logging for transparency.

Simple, interactive reporting for stock and revenue.

Clean REST API integration between Laravel backend and Next.js frontend.

## Challenges & Solutions

1. Inventory synchronization

Challenge: Ensuring stock levels remain accurate during multiple order updates.

Solution: Implemented database transactions in Laravel to handle order confirmations and cancellations.

2. Reporting calculations

Challenge: Calculating total revenue and order summaries dynamically.

Solution: Used optimized Laravel queries and eager loading to reduce database load.

## API Notes

Base URL: /api

Endpoints include:

/products → CRUD for products

/orders → Create, view, update, cancel orders

/inventory-logs → View all inventory activities, Create inventory log, view specific product inventory log

/reports → Generate summary data

All API responses follow JSON format.