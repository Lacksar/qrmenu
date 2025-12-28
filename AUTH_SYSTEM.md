# Unified Login System

## Overview

Single login form that automatically detects user type and redirects to the appropriate dashboard.

## User Roles

### Admin

- Login with phone number: `9800000000` (from .env)
- Automatically redirected to `/admin`
- Full access to admin panel
- Can create/manage Chef and Waiter accounts

### Chef

- Login with username/password
- Automatically redirected to `/chef`
- View and manage kitchen orders
- Update order status

### Waiter

- Login with username/password
- Automatically redirected to `/waiter`
- View orders and reservations
- Manage customer interactions

## How to Use

### 1. Login (All Users)

- Go to `/login`
- Enter username/phone in the first field:
  - **Admin**: Enter phone number `9800000000`
  - **Staff**: Enter your username
- Enter password
- Click "Sign In"
- System automatically redirects you to your dashboard

### 2. Admin: Create Staff Users

- Login as Admin
- Navigate to `/admin/users`
- Click "Add New User"
- Enter username, password, and select role (Chef or Waiter)
- Click "Create User"

### 3. Staff Login

- Go to `/login`
- Enter your username and password
- Automatically redirected to your role-specific dashboard

## Automatic Redirects

- **Admin** → `/admin` (Admin Panel)
- **Chef** → `/chef` (Kitchen Dashboard)
- **Waiter** → `/waiter` (Service Dashboard)

## Example Credentials

### Admin

- Username/Phone: `9800000000`
- Password: `9800000000`

### Staff (After Admin Creates)

- Username: `chef1` or `waiter1` (example)
- Password: Set by admin during creation
