# Worker Pay

Build a small, modern, extremely easy-to-use Contractor Attendance & Worker Payment Management App.



The app is designed for small contractors who manage workers/labourers and currently use notebooks, registers or WhatsApp to track:



- Worker attendance

- Daily wages

- Overtime

- Advances

- Payments

- Pending salary



The first version must stay small, fast and simple.



CORE PRODUCT IDEA



«“Attendance mark karo → Payment automatically calculate karo → Worker ko payment do → Record save karo.”»



Do NOT build a large accounting or construction management system in this MVP.



The two primary features are:



1. Attendance



2. Worker Payments



Everything else should support these two features.



---



1. DESIGN GOAL



The app should be usable by a contractor in less than 5–10 minutes of learning.



A contractor should be able to:



1. Add worker

2. Mark today's attendance

3. See today's labour cost

4. Select a worker

5. See how much payment is due

6. Record payment

7. See remaining/pending amount



The most common actions should take only a few taps.



---



2. UI / DESIGN



Create a premium but simple mobile-first interface.



Style



Modern SaaS + Indian business app.



Use:



- Clean white/off-white background

- Dark navy/charcoal text

- Emerald/green for successful payments

- Amber/orange for pending amounts

- Red only for warnings

- Rounded cards

- Large touch-friendly buttons

- Simple icons

- Minimal shadows

- Smooth but subtle animations



Typography:



- Inter for body

- Space Grotesk for headings



Use Lucide icons.



Avoid:



- Complicated tables

- Tiny text

- Too many charts

- Too many menu items

- Enterprise-style UI

- Unnecessary animations



The application must feel like a simple Android app, not complicated accounting software.



---



3. MAIN NAVIGATION



Use only 4 main sections:



Home



Attendance



Workers



Payments



And a small:



More / Settings



Do NOT add Projects, Inventory, Suppliers, Reports etc. in the first version.



---



4. HOME DASHBOARD



The Home screen should immediately show today's important information.



Top:



Good Morning 👋



Tuesday, 11 August



Then:



Today's Overview



Card 1:



Workers Present



32 / 40



Card 2:



Today's Labour Cost



₹18,500



Card 3:



Paid Today



₹12,000



Card 4:



Pending Payments



₹42,500



---



5. QUICK ACTIONS



Large buttons:



📋 Mark Attendance



💰 Pay Worker



👷 Add Worker



These should be the most visible actions.



---



6. TODAY'S ATTENDANCE SUMMARY



Show:



Present: 32



Half Day: 3



Absent: 5



Leave: 0



Total Workers: 40



Add a button:



View Attendance



---



7. PENDING PAYMENTS



Show workers whose payment is pending.



Example:



Ramesh



₹5,600 pending



[Pay Now]



Suresh



₹3,200 pending



[Pay Now]



Amit



₹7,500 pending



[Pay Now]



Clicking Pay Now should directly open the payment screen.



---



8. WORKER MANAGEMENT



Keep worker management simple.



Worker fields:



- Full Name

- Mobile Number

- Work Type

- Daily Wage

- Overtime Rate

- Joining Date

- Active/Inactive



Work Types:



- Mason

- Helper

- Carpenter

- Electrician

- Plumber

- Painter

- Welder

- Other



---



9. ADD WORKER



Make adding a worker extremely simple.



Screen:



Add Worker



Name *



Mobile Number



Work Type



Daily Wage *



Overtime Rate



[Save Worker]



After saving:



“Worker added successfully.”



Do not require unnecessary information.



---



10. WORKER LIST



Show clean cards.



Example:



👷 Ramesh Kumar



Mason



₹800/day



Today:

✓ Present



Pending:

₹5,600



[View]



Allow:



- Search

- Filter Active/Inactive



---



11. WORKER PROFILE



Worker profile should show:



Ramesh Kumar



Mason



₹800/day



---



This Month



Attendance:



24 Present



2 Half Days



2 Absent



Total Earnings:



₹20,000



Paid:



₹14,400



Advance:



₹3,000



Pending:



₹2,600



---



Tabs:



Attendance



Payments



Advances



Keep this screen simple.



---



12. ATTENDANCE — MOST IMPORTANT FEATURE



Attendance should be extremely fast.



Screen:



Today's Attendance



Date:



11 August 2026



Select date option.



Then worker list:



Ramesh

[Present] [Half] [Absent]



Suresh

[Present] [Half] [Absent]



Amit

[Present] [Half] [Absent]



---



13. MARK ALL PRESENT



Add a prominent button:



✓ Mark All Present



Then contractor can change individual workers.



Example:



40 workers



Tap:



Mark All Present



Then change 2 workers to Absent.



This saves time.



---



14. ATTENDANCE TYPES



Support only:



Present



100% daily wage



Half Day



50% daily wage



Absent



₹0



Leave



₹0



Do not add too many attendance states.



---



15. OVERTIME



Allow optional overtime.



Example:



Ramesh



Daily Wage:

₹800



Today:

Present



Overtime:

2 hours



OT Rate:

₹100/hour



OT Amount:

₹200



Today's total:



₹1,000



Keep overtime optional.



---



16. AUTOMATIC PAYMENT CALCULATION



This is a critical feature.



The app must automatically calculate worker earnings.



Example:



Ramesh



Daily Wage:

₹800



Attendance:



20 Present

2 Half Day



Calculation:



20 × ₹800 = ₹16,000



2 × ₹400 = ₹800



Base Earnings:



₹16,800



Overtime:



₹1,200



Gross Earnings:



₹18,000



Advance:



₹3,000



Already Paid:



₹10,000



Remaining:



₹5,000



Show this calculation clearly.



---



17. PAYMENT SCREEN



When contractor clicks:



Pay Worker



Show:



Ramesh Kumar



Total Earnings:

₹18,000



Advance:

₹3,000



Already Paid:

₹10,000



Amount Due



₹5,000



Payment amount field:



₹5,000



Payment method:



○ Cash



○ UPI



○ Bank



○ Other



Date



Notes



[Confirm Payment]



---



18. PARTIAL PAYMENT



Do NOT force the contractor to pay the full amount.



Example:



Amount Due:



₹5,000



Contractor enters:



₹2,000



After payment:



Paid:

₹12,000



Remaining:



₹3,000



Show:



Partial Payment Recorded ✓



---



19. ADVANCE PAYMENT



Contractor often gives workers money before salary.



Create a simple:



Give Advance



Worker:



Ramesh



Amount:



₹2,000



Payment Method:



Cash / UPI / Bank



Date



Notes



[Give Advance]



Automatically add the advance to the worker's account.



Example:



Monthly Earnings:

₹18,000



Advance:

₹2,000



Payment Due:

₹16,000



---



20. PAYMENT HISTORY



Show all payments.



Example:



11 Aug



Ramesh



₹2,000



Cash



Advance



---



10 Aug



Suresh



₹5,000



UPI



Salary



---



Allow filters:



- Today

- This Week

- This Month

- Worker

- Payment Type



Payment types:



- Salary

- Advance

- Partial Payment

- Final Payment



---



21. PAYMENT RECEIPT



After payment:



Show:



Payment Successful ✓



Worker:

Ramesh Kumar



Amount:

₹5,000



Payment Type:

Salary



Method:

UPI



Date:

11 Aug 2026



Remaining:

₹0



Buttons:



Share on WhatsApp



Download Receipt



The receipt should be clean and professional.



---



22. WHATSAPP SHARING



This is important for Indian contractors.



Generate a simple shareable message:



“Payment received/paid”



Example:



Worker: Ramesh Kumar



Payment: ₹5,000



Type: Salary



Date: 11 August 2026



Remaining: ₹0



Allow sharing through WhatsApp.



Do not build complicated WhatsApp automation in the MVP.



Just use the phone's native share functionality / WhatsApp share intent where supported.



---



23. ATTENDANCE HISTORY



Contractor should be able to view previous dates.



Example:



11 August



32 Present

3 Half Day

5 Absent



10 August



35 Present

2 Half Day

3 Absent



9 August



30 Present

5 Half Day

5 Absent



Click date:



Show complete worker attendance.



---



24. MONTHLY SUMMARY



Keep only one simple report.



August 2026



Total Workers:

40



Working Days:

11



Total Labour Cost:

₹2,15,000



Total Paid:

₹1,70,000



Total Pending:

₹45,000



Total Advances:

₹25,000



Attendance:

92%



Use simple cards, NOT complicated graphs.



---



25. SEARCH



Global worker search.



Search:



“Ramesh”



Show:



Ramesh Kumar



Mason



₹800/day



Present Today



₹5,000 Pending



[View]



---



26. NOTIFICATIONS / REMINDERS



Keep notifications minimal.



Examples:



“5 workers haven't been marked today.”



“₹25,000 worker payments are pending.”



“Ramesh has ₹5,000 pending.”



Do not spam the contractor.



---



27. SETTINGS



Only include necessary settings:



Business Profile



Business Name



Contractor Name



Mobile Number



App Settings



Language



Currency



Notifications



Data



Backup



Export Data



Account



Logout



---



28. LANGUAGE



Support:



1. English — Default

2. Hinglish

3. Marathi



All UI text must use a translation system.



Do NOT hardcode text directly into components.



Language switching should update the entire app.



---



29. DATABASE



Use a simple scalable structure.



Tables:



users



id



name



phone



email



created_at



workers



id



user_id



name



phone



work_type



daily_wage



overtime_rate



joining_date



status



created_at



attendance



id



worker_id



date



status



overtime_hours



overtime_amount



daily_earning



created_at



payments



id



worker_id



amount



payment_type



payment_method



date



notes



created_at



businesses



id



user_id



business_name



phone



created_at



Make sure one contractor cannot access another contractor's workers or payments.



---



30. AUTOMATIC CALCULATIONS



The system must automatically calculate:



Daily earning



Monthly earning



Overtime



Advance



Total paid



Remaining payment



Monthly labour cost



Attendance percentage



Never make the contractor calculate these manually.



---



31. IMPORTANT EDGE CASES



Handle these correctly:



Worker joins in middle of month



Only calculate from joining date.



Worker leaves



Keep historical attendance/payment records.



Daily wage changes



Do not change historical earnings.



Example:



Old wage:

₹700



New wage:

₹800



Old attendance must remain ₹700.



Partial payment



Keep remaining balance.



Multiple advances



All advances must be tracked.



Multiple payments



Worker can receive multiple payments.



Half day



Calculate exactly 50% of daily wage.



---



32. HOME SCREEN UX



The home screen should answer these questions immediately:



How many workers are present today?



How much labour cost today?



How much have I paid?



How much is pending?



Then provide:



[Mark Attendance]



[Pay Worker]



[Add Worker]



Nothing unnecessary.



---



33. APP STRUCTURE



Use this simple structure:



Home



Attendance



Workers



Payments



More



Do NOT create unnecessary modules.



---



34. FIRST-TIME USER EXPERIENCE



After signup:



Step 1:



“Let's set up your workers.”



[Add First Worker]



Step 2:



Add 3–5 workers.



Step 3:



“Mark today's attendance.”



Step 4:



Dashboard becomes active.



Show a short tooltip:



“That's it! Your worker earnings will now be calculated automatically.”



---



35. DEMO DATA



Include realistic demo data.



Business:



“Shubham Construction”



Workers:



Ramesh — Mason — ₹800/day



Suresh — Helper — ₹600/day



Amit — Carpenter — ₹1,000/day



Ravi — Electrician — ₹900/day



Mahesh — Plumber — ₹850/day



Include:



- Previous attendance

- Current attendance

- Payments

- Advances

- Pending balances



The app should look realistic immediately.



---



36. RESPONSIVENESS



Primary target:



Android mobile.



Also support:



Tablet



Desktop



But prioritize mobile.



Buttons must be easy to tap.



Minimum touch target:



44px+



---



37. PERFORMANCE



The app must be fast.



Use:



- Efficient database queries

- Local caching where useful

- Loading skeletons

- Optimized components

- Pagination for long payment history

- Debounced search



Attendance screen should load quickly even with 100+ workers.



---



38. ERROR HANDLING



Use simple human-friendly messages.



Bad:



“Error 500”



Good:



“Something went wrong. Please try again.”



Validation:



“Please enter worker name.”



“Please enter daily wage.”



“Payment amount cannot be greater than the pending amount.”



---



39. CONFIRMATION



For payment:



“Confirm payment of ₹5,000 to Ramesh?”



[Cancel]



[Confirm Payment]



For deleting worker:



“Are you sure? Attendance and payment history will be preserved.”



Prefer soft-delete instead of permanently deleting historical records.



---



40. WHAT NOT TO BUILD NOW



Do NOT implement these in MVP:



❌ Inventory



❌ Material management



❌ Supplier management



❌ Client management



❌ Complex invoices



❌ GST accounting



❌ Project management



❌ GPS tracking



❌ Face recognition



❌ AI analytics



❌ Complex charts



❌ Payroll taxation



❌ Complex admin panel



Keep them for future versions.



---



41. FUTURE ROADMAP



Design the architecture so these can be added later:



V2



Projects/Sites



Site-wise attendance



Client payments



Expenses

 

Daily site reports



V3



GPS attendance



Supervisor accounts



Worker app



WhatsApp automation



Advanced reports



V4



AI insights



Voice attendance



Bill OCR



Payroll



Advanced accounting



---



42. MVP SUCCESS CRITERIA



The app is successful if a contractor can do this in under 1 minute:



Add worker



Name → Wage → Save



Attendance



Open Attendance → Mark All Present → Save



Payment



Open Worker → Amount Due → Pay → Save



The contractor should never need a calculator for normal salary calculations.



---



43. FINAL PRODUCT FEEL



The final app should feel:



Simple

Fast

Professional

Reliable

Indian contractor-friendly



Not:



“Accounting software”



Instead:



“Contractor ka Attendance aur Payment Manager.”



The primary value proposition:



«“Worker ki attendance se lekar payment tak — sab automatic.”»



Build this MVP with production-quality UI, reusable components, proper validation, realistic demo data, responsive mobile design, reliable calculations and no fake buttons.



Every button that appears in the UI must work.



Every calculation must be accurate.



Keep the first version intentionally small.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://kiraya-kaam-app.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5f0e5ec4-88d6-428c-a9cb-fd86dfa04d6f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
