# SpecBaker Demo Scenario

## Demo Overview

This document outlines a compelling demo scenario for the IBM Bob Hackathon that showcases how SpecBaker transforms vague ideas into structured, Bob-ready specifications.

---

## Demo Story: "The Coffee Shop Owner"

### Persona
**Sarah** - A coffee shop owner who wants to digitize her business but has limited technical knowledge.

### Initial Goal (Vague)
> "I want an app for my coffee shop where customers can order ahead and earn rewards."

---

## Demo Flow

### Part 1: Initial Input (30 seconds)

```bash
$ specbaker generate "I want an app for my coffee shop where customers can order ahead and earn rewards"

🔍 Analyzing your goal...
✓ Goal analyzed successfully

📊 Analysis Summary:
   Domain: Mobile/Web Application
   Complexity: Moderate
   Key Features Detected: Ordering, Rewards System
   Ambiguities Found: 7 areas need clarification

Let's clarify your requirements with a few questions...
```

---

### Part 2: Interactive Questions (2-3 minutes)

#### Question 1: User Roles
```bash
❓ Question 1 of 8

Who will be the primary users of this application?

  1. Customers only
  2. Customers and staff
  3. Customers, staff, and managers
  4. Other (please specify)

Your answer: 2

✓ Answer recorded
```

#### Question 2: Access Method
```bash
❓ Question 2 of 8

How should customers access the ordering system?

  1. Mobile app (iOS/Android)
  2. Web browser
  3. Both mobile app and web
  4. In-store kiosk

Your answer: 3

✓ Answer recorded
```

#### Question 3: Core Ordering Features
```bash
❓ Question 3 of 8

What ordering features are most important? (Select all that apply)

  ☑ Browse menu with photos
  ☑ Customize orders (size, milk type, etc.)
  ☑ Schedule pickup time
  ☑ Save favorite orders
  ☐ Group orders
  ☐ Delivery option

Your selections: 1, 2, 3, 4

✓ Answer recorded
```

#### Question 4: Rewards System
```bash
❓ Question 4 of 8

How should the rewards system work?

  1. Points per dollar spent
  2. Stamp card (buy 10, get 1 free)
  3. Tiered membership levels
  4. Custom rewards program

Your answer: 2

✓ Answer recorded

Follow-up: How many purchases should earn a free item?

Your answer: 10

✓ Answer recorded
```

#### Question 5: Payment
```bash
❓ Question 5 of 8

What payment methods should be supported?

  ☑ Credit/Debit cards
  ☑ Mobile wallets (Apple Pay, Google Pay)
  ☐ Cash (pay at pickup)
  ☐ Store credit/gift cards

Your selections: 1, 2

✓ Answer recorded
```

#### Question 6: Staff Features
```bash
❓ Question 6 of 8

What features do staff members need?

  ☑ View incoming orders
  ☑ Mark orders as ready
  ☑ Manage menu items
  ☐ View sales reports
  ☐ Manage customer accounts

Your selections: 1, 2, 3

✓ Answer recorded
```

#### Question 7: Success Criteria
```bash
❓ Question 7 of 8

How will you measure success for this application?

Your answer: Reduce wait times, increase repeat customers, and make ordering more convenient

✓ Answer recorded
```

#### Question 8: Priority
```bash
❓ Question 8 of 8

What should be built first?

  1. Basic ordering system
  2. Rewards program
  3. Staff management
  4. All features at once

Your answer: 1

✓ Answer recorded

📝 All questions answered!
```

---

### Part 3: Specification Generation (1 minute)

```bash
🎯 Generating your specification...

✓ Product summary created
✓ User roles defined
✓ Core requirements documented
✓ Important decisions captured
✓ User journey mapped
✓ Data model outlined
✓ UI screens designed
✓ Test scenarios created
✓ Implementation plan prepared
✓ Bob-ready prompt generated

✨ Specification complete!

📄 Saved to: coffee-shop-app-spec.md
📊 Sections: 11
📏 Length: 3,247 words
⏱️  Time: 3m 42s

Next steps:
  1. Review the specification
  2. Make any adjustments
  3. Hand off to IBM Bob for implementation

Run: specbaker validate coffee-shop-app-spec.md
```

---

### Part 4: Generated Specification Preview

```markdown
# Coffee Shop Ordering & Rewards App - Implementation Specification

**Generated:** 2026-05-15
**Version:** 1.0
**Status:** Ready for Implementation

---

## 1. Product Summary

### Goal
Create a mobile and web application that allows coffee shop customers to order ahead and earn rewards, while providing staff with tools to manage orders and menu items.

### Problem Being Solved
- Customers wait in long lines during peak hours
- No system to reward loyal customers
- Manual order taking is time-consuming
- No way to order ahead for pickup

### Success Criteria
- Reduce average wait time by 50%
- Increase repeat customer rate by 30%
- Process 80% of orders through the app within 3 months
- Achieve 4.5+ star rating in app stores

---

## 2. User Roles

### Primary Users

**Customer**
- Browse menu and place orders
- Customize drinks and food items
- Schedule pickup times
- Track rewards progress
- Save favorite orders
- Receive order notifications

**Staff Member**
- View incoming orders in real-time
- Mark orders as ready
- Update menu items and availability
- Handle order issues

**Manager** (Future Phase)
- View sales reports
- Manage staff accounts
- Configure rewards program
- Analyze customer data

---

## 3. Access & Deployment

### Customer Access
- **Mobile App:** Native iOS and Android apps
- **Web App:** Responsive web application
- **Account Required:** Yes, with email/phone verification

### Staff Access
- **Web Dashboard:** Desktop/tablet browser
- **Authentication:** Staff login credentials
- **Location:** In-store only (IP restricted)

### Technical Requirements
- Internet connection required
- iOS 14+ / Android 8+
- Modern web browsers (Chrome, Safari, Firefox)

---

## 4. Core Requirements

### Functional Requirements

**Ordering System**
- FR-1: Display menu with categories, items, photos, and prices
- FR-2: Allow customization (size, milk type, sweetness, extras)
- FR-3: Support scheduling pickup time (15-min intervals)
- FR-4: Calculate total with tax
- FR-5: Process payment securely
- FR-6: Send order confirmation
- FR-7: Notify when order is ready
- FR-8: Allow saving favorite orders

**Rewards System**
- FR-9: Track purchases (stamp card: 10 purchases = 1 free item)
- FR-10: Display progress toward next reward
- FR-11: Allow redeeming rewards at checkout
- FR-12: Send notifications for earned rewards

**Staff Features**
- FR-13: Display order queue in real-time
- FR-14: Show order details and customizations
- FR-15: Mark orders as "in progress" and "ready"
- FR-16: Update menu item availability
- FR-17: Add/edit menu items and prices

### Non-Functional Requirements

**Performance**
- NFR-1: Order placement completes in <3 seconds
- NFR-2: Menu loads in <2 seconds
- NFR-3: Support 100 concurrent users

**Security**
- NFR-4: PCI DSS compliant payment processing
- NFR-5: Encrypted data transmission (HTTPS)
- NFR-6: Secure password storage (bcrypt)
- NFR-7: Session timeout after 30 minutes

**Usability**
- NFR-8: Intuitive interface (no training required)
- NFR-9: Accessible (WCAG 2.1 Level AA)
- NFR-10: Mobile-first design

**Reliability**
- NFR-11: 99.5% uptime during business hours
- NFR-12: Graceful degradation if payment fails
- NFR-13: Order data persisted reliably

---

## 5. Important Decisions

### Technology Decisions
- **Mobile:** React Native (single codebase for iOS/Android)
- **Web:** React.js with responsive design
- **Backend:** Node.js with Express
- **Database:** PostgreSQL for relational data
- **Payment:** Stripe for payment processing
- **Hosting:** Cloud platform (AWS/GCP/Azure)
- **Notifications:** Firebase Cloud Messaging

### Business Decisions
- Start with ordering system (Phase 1)
- Add rewards in Phase 2
- Manager features in Phase 3
- No delivery in initial version
- No cash payment option
- 10 purchases = 1 free item (any size)

### Design Decisions
- Mobile-first approach
- Simple, clean interface
- Coffee shop branding colors
- Large touch targets for easy ordering
- Minimal text entry required

---

## 6. User Journey / Workflow

### Customer Journey: First Order

```
1. Download app / Visit website
   ↓
2. Create account (email + password)
   ↓
3. Verify email
   ↓
4. Browse menu
   ↓
5. Select item
   ↓
6. Customize order
   ↓
7. Add to cart
   ↓
8. Review cart
   ↓
9. Select pickup time
   ↓
10. Enter payment info
    ↓
11. Place order
    ↓
12. Receive confirmation
    ↓
13. Get "ready" notification
    ↓
14. Pick up order
    ↓
15. Earn stamp on rewards card
```

### Staff Journey: Processing Order

```
1. New order appears in queue
   ↓
2. Staff views order details
   ↓
3. Staff marks "in progress"
   ↓
4. Prepare order
   ↓
5. Staff marks "ready"
   ↓
6. Customer receives notification
   ↓
7. Customer picks up
   ↓
8. Order marked complete
```

---

## 7. Data Model

### Core Entities

**User**
- id (UUID)
- email (unique)
- phone
- password_hash
- first_name
- last_name
- role (customer/staff/manager)
- created_at
- rewards_stamps (integer)

**MenuItem**
- id (UUID)
- name
- description
- category
- base_price
- image_url
- available (boolean)
- customization_options (JSON)

**Order**
- id (UUID)
- user_id (FK)
- status (pending/in_progress/ready/completed/cancelled)
- items (JSON array)
- total_amount
- pickup_time
- payment_id
- created_at
- completed_at

**OrderItem**
- id (UUID)
- order_id (FK)
- menu_item_id (FK)
- quantity
- customizations (JSON)
- price

**Reward**
- id (UUID)
- user_id (FK)
- type (free_item)
- earned_at
- redeemed_at
- status (available/redeemed/expired)

### Relationships
- User has many Orders
- Order has many OrderItems
- OrderItem references MenuItem
- User has many Rewards

---

## 8. UI Screen Outline

### Customer App Screens

**1. Authentication**
- Login screen
- Sign up screen
- Password reset

**2. Menu**
- Category tabs
- Item cards (photo, name, price)
- Search/filter

**3. Item Detail**
- Large photo
- Description
- Size selection
- Customization options
- Add to cart button

**4. Cart**
- Item list with customizations
- Edit/remove items
- Pickup time selector
- Total calculation
- Checkout button

**5. Checkout**
- Payment method selection
- Apply rewards toggle
- Place order button

**6. Order Status**
- Order details
- Status indicator
- Estimated ready time
- Cancel option (if pending)

**7. Rewards**
- Stamp card visual (10 circles)
- Progress indicator
- Available rewards list
- Rewards history

**8. Profile**
- Account info
- Favorite orders
- Order history
- Settings

### Staff Dashboard Screens

**1. Order Queue**
- List of pending orders
- Order cards with details
- Status update buttons
- Filter by status

**2. Order Detail**
- Full order information
- Customer name
- Items and customizations
- Pickup time
- Action buttons

**3. Menu Management**
- Item list
- Add/edit/delete items
- Toggle availability
- Update prices

---

## 9. Test Scenarios

### Critical Test Cases

**TC-1: Place Basic Order**
- Given: Customer is logged in
- When: Select item, customize, checkout
- Then: Order created, payment processed, confirmation sent

**TC-2: Earn Reward**
- Given: Customer has 9 stamps
- When: Complete 10th order
- Then: Reward earned, notification sent

**TC-3: Redeem Reward**
- Given: Customer has available reward
- When: Apply reward at checkout
- Then: Free item added, reward marked redeemed

**TC-4: Staff Process Order**
- Given: New order in queue
- When: Staff marks in progress, then ready
- Then: Customer receives notification

**TC-5: Schedule Pickup**
- Given: Customer selecting pickup time
- When: Choose time 30 minutes ahead
- Then: Order scheduled correctly

**TC-6: Payment Failure**
- Given: Invalid payment method
- When: Attempt checkout
- Then: Error shown, order not created

**TC-7: Update Menu Item**
- Given: Staff logged in
- When: Edit item price
- Then: Price updated for new orders

**TC-8: Concurrent Orders**
- Given: Multiple customers ordering
- When: Orders placed simultaneously
- Then: All orders processed correctly

---

## 10. Implementation Plan

### Phase 1: Core Ordering (Weeks 1-4)

**Week 1: Foundation**
- Set up project structure
- Configure database
- Implement authentication
- Create basic UI components

**Week 2: Menu System**
- Build menu data model
- Implement menu display
- Add item customization
- Create cart functionality

**Week 3: Ordering**
- Implement checkout flow
- Integrate payment (Stripe)
- Add order confirmation
- Build order status tracking

**Week 4: Staff Dashboard**
- Create order queue view
- Implement status updates
- Add menu management
- Testing and bug fixes

### Phase 2: Rewards System (Weeks 5-6)

**Week 5: Rewards Logic**
- Implement stamp tracking
- Create reward generation
- Build rewards display
- Add redemption flow

**Week 6: Polish**
- Notifications
- UI refinements
- Performance optimization
- User testing

### Phase 3: Launch Preparation (Week 7)

- Security audit
- Load testing
- App store submission
- Staff training
- Soft launch

---

## 11. Bob-Ready Prompt

```
Build a coffee shop ordering and rewards application with the following specifications:

OVERVIEW:
Create a mobile (React Native) and web (React.js) application for a coffee shop that allows customers to order ahead and earn rewards. Include a staff dashboard for order management.

USER ROLES:
1. Customer - Browse menu, place orders, track rewards
2. Staff - View orders, update status, manage menu

CORE FEATURES:

Customer App:
- User authentication (email/password)
- Menu browsing with categories and photos
- Order customization (size, milk type, sweetness, extras)
- Pickup time scheduling (15-min intervals)
- Shopping cart with order review
- Stripe payment integration
- Order status tracking with notifications
- Stamp card rewards (10 purchases = 1 free item)
- Favorite orders
- Order history

Staff Dashboard:
- Real-time order queue
- Order detail view
- Status updates (pending → in progress → ready)
- Menu item management (add/edit/toggle availability)

TECHNICAL REQUIREMENTS:
- Backend: Node.js + Express + PostgreSQL
- Mobile: React Native (iOS/Android)
- Web: React.js (responsive)
- Payment: Stripe
- Notifications: Firebase Cloud Messaging
- Authentication: JWT
- Security: HTTPS, bcrypt passwords, PCI compliance

DATA MODEL:
- Users (id, email, password_hash, role, rewards_stamps)
- MenuItems (id, name, category, price, customization_options, available)
- Orders (id, user_id, status, items, total, pickup_time, payment_id)
- OrderItems (id, order_id, menu_item_id, customizations, price)
- Rewards (id, user_id, type, status, earned_at, redeemed_at)

IMPLEMENTATION PRIORITY:
1. Authentication and user management
2. Menu display and browsing
3. Order customization and cart
4. Checkout and payment
5. Order status tracking
6. Staff order queue
7. Rewards system
8. Menu management

SUCCESS CRITERIA:
- Orders complete in <3 seconds
- Menu loads in <2 seconds
- Mobile-first, intuitive UI
- 99.5% uptime
- WCAG 2.1 Level AA accessible

Start with the backend API and database schema, then build the customer mobile app, followed by the web dashboard for staff.
```

---

## Demo Talking Points

### Opening (30 seconds)
"Meet Sarah, a coffee shop owner who wants to modernize her business. She has a vision but doesn't know how to communicate it to developers. Watch how SpecBaker helps her."

### During Questions (2 minutes)
"SpecBaker asks intelligent questions powered by watsonx.ai, adapting based on Sarah's answers. Notice how it clarifies ambiguities and captures decisions."

### During Generation (1 minute)
"Now SpecBaker uses watsonx.ai to generate a complete, structured specification. This isn't just a document—it's a blueprint for implementation."

### Showing Output (1 minute)
"Look at what we got: user roles, requirements, data model, UI screens, test scenarios, and most importantly—a Bob-ready prompt that can be fed directly to IBM Bob."

### Closing (30 seconds)
"SpecBaker bridges the gap between vague ideas and clear specifications. watsonx.ai provides the intelligence, SpecBaker provides the structure, and IBM Bob builds the solution. Together, they accelerate software development."

---

## Demo Tips

1. **Prepare the environment:**
   - Pre-configure API keys
   - Test the full flow beforehand
   - Have backup recordings

2. **Timing:**
   - Keep total demo under 5 minutes
   - Practice transitions
   - Have a timer visible

3. **Engagement:**
   - Ask audience questions
   - Show relatable scenario
   - Highlight IBM technologies

4. **Backup plan:**
   - Have pre-generated spec ready
   - Screenshots of each step
   - Video recording as fallback

5. **Key messages:**
   - Reduces ambiguity
   - Saves time
   - Improves Bob's output
   - Powered by watsonx.ai
