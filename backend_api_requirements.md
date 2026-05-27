# Gaualla Milk App - Backend API Requirements (Wallet, Subscriptions, and Cashback)

This document details the backend requirements for the Gaualla Milk App to support **Calendar-Based Custom Subscriptions**, a **Virtual Wallet Payment System**, and a **Cashback/Bonus Rules Engine**.

---

## 1. Calendar-Based Subscription (Alternative/Specific Days)

### Background
Currently, the app supports `one_time`, `daily` (30 days), and `alternative` (alt days). We are introducing a calendar date selector where users can choose specific dates for their product delivery:
- **Constraints**: Minimum 1 day, Maximum 30 days.
- **Selection**: Any combination of future dates.
- **Integration**: The client will pass these dates to the backend to schedule deliveries only on the chosen days.

### API Changes

#### Update: Create Order / Verification API
`POST /api/user/order/verify` (or a dedicated `/api/user/subscription/create` endpoint)

When a customer checks out a custom-date subscription, the request payload must accept the custom delivery dates array.

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body** (Example):
```json
{
  "razorpay_order_id": "order_OrhG123456",     // Null if paid via Wallet
  "razorpay_payment_id": "pay_OrhG789012",     // Null if paid via Wallet
  "razorpay_signature": "sig_1234567890",      // Null if paid via Wallet
  "payment_method": "razorpay",                // "razorpay" or "wallet"
  "address_id": 12,
  "total_amount": 1020.00,
  "type": "custom_dates",                      // Type must be "custom_dates"
  "custom_delivery_dates": [                   // Array of selected dates (YYYY-MM-DD)
    "2026-05-20",
    "2026-05-22",
    "2026-05-25",
    "2026-05-26",
    "2026-05-28"
  ],
  "cart_items": [
    {
      "product_id": 5,
      "quantity": 2,
      "price": 85.00
    }
  ]
}
```

**Validation Rules**:
- Ensure all dates in `custom_delivery_dates` are in the future.
- The length of `custom_delivery_dates` must be between `1` and `30` (inclusive).
- Ensure the total payable amount matches: `(price * quantity) * number_of_selected_dates`.

**Response** (Success - `200 OK`):
```json
{
  "success": true,
  "message": "Order verified and custom date subscription created successfully.",
  "order_id": 104
}
```

---

## 2. Virtual Wallet Management System

A persistent virtual wallet enables quick checkouts, avoids payment gateway friction for daily transactions, and provides structured refunds.

### Proposed Database Schema

#### `wallets` Table
Tracks user balances.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment | Unique Wallet ID |
| `user_id` | INT | Foreign Key, Unique | References `users.id` |
| `main_balance` | DECIMAL(10,2) | Default: 0.00, Not Null | Deposited money (refundable) |
| `cashback_balance`| DECIMAL(10,2) | Default: 0.00, Not Null | Promotional cashback (non-refundable) |
| `status` | VARCHAR(20) | Default: 'active' | `active`, `suspended` |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | Date wallet was activated |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last updated |

#### `wallet_transactions` Table
Logs all credit and debit activities.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment | Unique transaction ID |
| `wallet_id` | INT | Foreign Key | References `wallets.id` |
| `type` | ENUM | 'credit', 'debit' | Direction of transaction |
| `source` | ENUM | 'topup', 'cashback', 'order_payment', 'subscription_deduction', 'refund', 'admin_adjustment' | Category of transaction |
| `amount` | DECIMAL(10,2) | Not Null | Total transaction amount |
| `main_amount` | DECIMAL(10,2) | Default: 0.00 | Portion deducted/credited from `main_balance` |
| `cashback_amount`| DECIMAL(10,2) | Default: 0.00 | Portion deducted/credited from `cashback_balance` |
| `reference_id` | VARCHAR(100) | Nullable | Order ID, Subscription ID, or Razorpay payment ID |
| `title` | VARCHAR(255) | Not Null | User-friendly title (e.g. "Daily Milk Subscription") |
| `description` | VARCHAR(500) | Nullable | Detail summary |
| `status` | ENUM | 'pending', 'success', 'failed' | Transaction execution state |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | Transaction time |

---

### Wallet API Endpoints

### 2.1 Fetch Wallet Balance
`GET /api/user/wallet/info`

Fetches current available balance for the authenticated user.

**Headers**:
- `Authorization: Bearer <token>`

**Response** (Success - `200 OK`):
```json
{
  "success": true,
  "wallet": {
    "main_balance": 1500.00,
    "cashback_balance": 250.00,
    "total_balance": 1750.00,
    "status": "active"
  }
}
```

---

### 2.2 Create Wallet Top-up Order (Razorpay)
`POST /api/user/wallet/topup/create`

Generates a Razorpay Order ID to initiate transaction flow.

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "amount": 1000.00
}
```

**Response** (Success - `200 OK`):
```json
{
  "success": true,
  "razorpay_order": {
    "id": "order_WltTop8899",
    "amount": 100000,           // Amount in paise (1000 * 100)
    "currency": "INR"
  }
}
```

---

### 2.3 Verify Wallet Top-up & Award Cashback
`POST /api/user/wallet/topup/verify`

Verifies Razorpay payment signature, updates the wallet, applies promotional cashback, and logs transaction details.

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "razorpay_order_id": "order_WltTop8899",
  "razorpay_payment_id": "pay_WltTop7766",
  "razorpay_signature": "sig_WltTop1122",
  "amount": 1000.00
}
```

**Response** (Success - `200 OK`):
```json
{
  "success": true,
  "message": "Top-up verified and credited to wallet.",
  "credited_amount": 1000.00,
  "cashback_awarded": 100.00,
  "wallet": {
    "main_balance": 2500.00,     // Previous balance + 1000
    "cashback_balance": 350.00,   // Previous cashback + 100
    "total_balance": 2850.00
  }
}
```

---

### 2.4 Pay via Wallet (Checkout Integration)
`POST /api/user/order/pay-wallet`

Instructs the system to deduct payment directly from the user's wallet instead of loading Razorpay.

**Business Logic / Deduction Priority**:
1. Check if user's `total_balance` (`main_balance` + `cashback_balance`) is greater than or equal to the order amount.
2. Deduct from `cashback_balance` first (subject to rules, e.g. up to 100% of order value or a fixed percentage capping if decided).
3. Deduct any remaining amount from `main_balance`.
4. Log transaction entry under `wallet_transactions` as a `debit` with source `order_payment` (or `subscription_deduction`).

**Request Body**:
```json
{
  "address_id": 12,
  "total_amount": 170.00,
  "type": "custom_dates",                      // 'one_time', 'daily', 'alternative', or 'custom_dates'
  "custom_delivery_dates": [                   // If type is custom_dates
    "2026-05-20",
    "2026-05-22"
  ],
  "cart_items": [
    {
      "product_id": 3,
      "quantity": 1,
      "price": 85.00
    }
  ]
}
```

**Response** (Success - `200 OK`):
```json
{
  "success": true,
  "message": "Payment successful. Order processed via Wallet.",
  "order_id": 105,
  "deduction_summary": {
    "deducted_from_main": 120.00,
    "deducted_from_cashback": 50.00,
    "remaining_wallet_balance": 2680.00
  }
}
```

**Response** (Error - `400 Bad Request` or `402 Payment Required`):
```json
{
  "success": false,
  "error_code": "INSUFFICIENT_WALLET_BALANCE",
  "message": "Insufficient wallet balance (₹150.00) to complete this payment of ₹170.00. Please top up your wallet."
}
```

---

## 3. Transaction & Subscription Deduction History API

### 3.1 Get Transaction History
`GET /api/user/wallet/transactions`

Fetches transaction logs including top-ups, purchases, and subscription auto-deductions.

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters** (Optional):
- `page`: Page number (default: `1`)
- `limit`: Records per page (default: `10`)
- `type`: Filter by direction (`credit`, `debit`)
- `source`: Filter by category (`topup`, `cashback`, `subscription_deduction`, etc.)

**Response** (Success - `200 OK`):
```json
{
  "success": true,
  "current_page": 1,
  "total_pages": 3,
  "transactions": [
    {
      "id": "TXN_77665",
      "type": "debit",
      "source": "subscription_deduction",
      "title": "Daily Milk Subscription (1L)",
      "amount": 68.00,
      "date": "2026-05-18T06:45:00Z",
      "status": "Success"
    },
    {
      "id": "TXN_77664",
      "type": "credit",
      "source": "topup",
      "title": "Wallet Top-up (UPI)",
      "amount": 2000.00,
      "date": "2026-05-17T20:30:00Z",
      "status": "Success"
    },
    {
      "id": "TXN_77663",
      "type": "credit",
      "source": "cashback",
      "title": "Top-up Cashback Bonus",
      "amount": 300.00,
      "date": "2026-05-17T20:30:01Z",
      "status": "Success"
    }
  ]
}
```

---

## 4. Cashback & Top-up Bonus Configuration

To encourage wallet transactions, the backend should implement an automated rules engine.

### 4.1 Deposit Tier Rules
The system must dynamically resolve bonuses. Store active rules in a `topup_offers` database table or environment configurations:
- **Top-up ₹500**: Bonus/Cashback = **₹0**
- **Top-up ₹1,000**: Bonus/Cashback = **₹100** (10% benefit)
- **Top-up ₹2,000**: Bonus/Cashback = **₹300** (15% benefit)
- **Top-up ₹5,000**: Bonus/Cashback = **₹1,000** (20% benefit)

*Note: For manual inputs (e.g. custom amount input), the system should automatically apply the reward of the highest completed tier, or a generic % rate (e.g. 5% on non-tiered amounts over ₹500).*

---

## 5. Daily Subscription Execution Scheduler (Cron Job)

Subscriptions require a backend cron scheduler to execute deductions automatically.

### Process Flow (e.g., Running daily at 12:00 AM)
1. **Identify Deliveries**: Find all subscriptions (`daily`, `alternative`, or `custom_dates`) scheduled for delivery today.
2. **Verify Balance**: Check if user has sufficient total wallet balance.
   - *If Balance is Sufficient*: Deduct the amount, update wallet balances, create a `subscription_deduction` wallet transaction, and mark delivery as `dispatched`.
   - *If Balance is Insufficient*: Pause delivery, update subscription status to `on_hold_insufficient_funds`, and trigger a push notification: *"Your Gaualla subscription is paused due to low balance. Top up now to resume tomorrow's delivery!"*

---

## 6. Order Details & Delivery Executive API Requirements

To provide customers transparency regarding their deliveries, the order details response must contain complete information about assigned delivery personnel and subscription scheduling.

### API Endpoint Enhancement: Fetch Single Order Details
`GET /api/user/order/getsingleorder/:id`

**Headers**:
- `Authorization: Bearer <token>`

**Response Body (Example containing custom scheduling & delivery executive details)**:
```json
{
  "success": true,
  "order": {
    "id": 104,
    "first_name": "John",
    "last_name": "Doe",
    "street": "123 Green Valley Lane",
    "city": "Pune",
    "state": "Maharashtra",
    "zip_code": "411001",
    "country": "India",
    "phone": "+91-9876543210",
    "status": "processing",                       // "processing", "shipped", "delivered", "cancelled"
    "payment_status": "paid",                     // "paid", "pending", "failed"
    "total_amount": 850.00,
    "type": "alternative",                        // "one_time", "daily", "alternative"
    "created_at": "2026-05-19T13:00:00Z",
    "custom_delivery_dates": [                    // JSON Array or stringified array of YYYY-MM-DD strings
      "2026-05-20",
      "2026-05-22",
      "2026-05-24",
      "2026-05-26",
      "2026-05-28"
    ],
    "delivery_man_name": "Rajesh Kumar",          // Assigned courier name (null if not assigned yet)
    "delivery_man_phone": "+91-9988776655",       // Assigned courier contact (null if not assigned yet)
    "delivery_man_vehicle": "Honda Activa MH-12-XX-1234", // Vehicle info
    "items": [
      {
        "product_id": 5,
        "product_name": "Premium Buffalo Milk 1L",
        "product_image": "[\"buffalo_milk.jpg\"]",
        "quantity": 2,
        "price": 85.00,
        "start_date": "2026-05-20"
      }
    ]
  }
}
```

#### Fields to Implement:
1. **`custom_delivery_dates`**: Stores the date checklist for `'alternative'` schedule types. Returns the full date selection list so the client can display the delivery grid.
2. **`delivery_man_name`, `delivery_man_phone`, `delivery_man_vehicle`**: Details of the delivery agent. If the backend relies on an external table/relation, resolve these fields in the order serializer or include a nested `delivery_man` object containing these properties.

