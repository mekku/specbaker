# Coffee Shop App Example

This is an example scenario for demonstrating SpecBaker.

## Initial Goal

"I want an app for my coffee shop where customers can order ahead and earn rewards"

## Expected Questions

SpecBaker will ask clarifying questions such as:

1. **Who are the primary users?**
   - Coffee shop customers
   - Coffee shop staff/baristas
   - Shop managers

2. **How will users access this application?**
   - Mobile app (iOS and Android)
   - Web browser for staff

3. **What are the top 3 most important features?**
   - Mobile ordering with pickup time selection
   - Loyalty rewards program
   - Order history and favorites

4. **What is the expected number of users?**
   - 1,000-10,000 users

5. **What is the preferred deployment model?**
   - Cloud-based (AWS/Azure/GCP)

6. **Are there any existing systems to integrate with?**
   - Payment processing (Stripe/Square)
   - POS system integration

7. **How will you measure success?**
   - Number of mobile orders per day
   - Customer retention rate
   - Average order value

8. **Are there any specific technical constraints?**
   - Must support offline mode for order queue
   - Real-time order status updates
   - Secure payment processing

9. **What is the target timeline?**
   - 3-6 months for MVP

10. **What is more important: speed to market or feature completeness?**
    - Balanced approach with MVP first

## Expected Output Sections

The generated specification will include:

1. **Product Summary** - Coffee shop mobile ordering and rewards system
2. **User Roles** - Customers, Baristas, Managers
3. **Access & Deployment** - Mobile apps + web dashboard, cloud deployment
4. **Core Requirements** - Ordering, payments, rewards, notifications
5. **Important Decisions** - Tech stack, payment provider, cloud platform
6. **User Journey** - Order placement, pickup, rewards earning
7. **Data Model** - Users, Orders, Products, Rewards, Transactions
8. **UI Screens** - Home, Menu, Cart, Checkout, Order Status, Rewards, Profile
9. **Test Scenarios** - Order flow, payment processing, rewards calculation
10. **Implementation Plan** - Phase 1: Core ordering, Phase 2: Rewards, Phase 3: Analytics
11. **Bob-Ready Prompt** - Complete prompt for IBM Bob to implement

## Demo Script

1. Run: `specbaker generate "I want an app for my coffee shop where customers can order ahead and earn rewards"`
2. Answer the clarifying questions interactively
3. Wait for specification generation (~2 minutes)
4. Review the generated `specification.md` file
5. Show the Bob-Ready Prompt section
6. Demonstrate how to use it with IBM Bob

## Key Talking Points

- **Problem**: Vague idea → Clear specification
- **Solution**: AI-powered clarification + structured output
- **Technology**: IBM watsonx.ai for intelligence
- **Integration**: Output ready for IBM Bob
- **Value**: Faster, more accurate development