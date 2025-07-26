# Dreams Built: Construction Management Revolution

A full-stack web application that eliminated paper-based timesheet collection and transformed job costing processes for a construction business, saving hours of administrative work weekly while providing unprecedented visibility into project profitability.


## The Problem

Watching my father run his construction business was like watching someone try to juggle while riding a unicycle—impressive, but unsustainable. Every Wednesday became a frantic treasure hunt across Hamilton, driving from site to site collecting crumpled paper timesheets from muddy trucks and toolboxes. By the time he'd gathered everyone's hours, half the day was gone, and he'd spend the evening hunched over a calculator, trying to piece together which jobs were making money and which were bleeding cash.

The mental toll was what really got to me. Here was someone who could build anything, solve complex construction challenges, and manage teams of skilled tradies, but he was drowning in paperwork. Late nights were spent staring at spreadsheets, trying to remember if that job in Te Awamutu was supposed to take two days or three, and whether the cost overrun was due to weather delays or poor planning. The business was successful, but it was consuming him, and I knew there had to be a better way.

## Technical Solution

### Version 1.0: Rapid MVP Development
**Tech Stack:** React, MongoDB, Node.js + Express, Auth0, Redux, AWS Elastic Beanstalk

Built initial version during my studies at Developers Institute, focusing on core functionality:
- Digital timesheet submission with job assignment
- Basic job tracking and reporting
- Simple scheduling interface

### Version 2.0: Complete Redesign & Enhancement
**Upgraded Tech Stack:** TypeScript, TRPC, PostgreSQL, enhanced AWS infrastructure

Rebuilt from the ground up with lessons learned and modern technologies.

## Key Features & Impact

### Digital Timesheet Revolution

The transformation started with something deceptively simple: replacing paper timesheets with a mobile-optimised web interface. But the impact was profound. Instead of my father burning entire afternoons driving around Hamilton collecting pieces of paper, his employees could now submit their hours from wherever they were working. The change was immediate and dramatic.

What amazed me most was watching the ripple effects. Payroll processing, which used to stretch across three days of careful calculation and double-checking, suddenly became a same-day affair. Errors virtually disappeared because the system validated entries in real-time, catching impossible hour combinations or missing job codes before they could cause problems. The eight hours per week my father had been spending on timesheet collection became eight hours he could spend actually running his business, visiting sites, or—revolutionary concept—going home at a reasonable time.

### 📊 Real-Time Job Costing
**Before:** Mental estimates and end-of-project surprises
**After:** Real-time job profitability tracking

**Features Delivered:**
- Automatic labor cost calculation based on employee rates and hours


### 📅 Intelligent Scheduling System

**Before:** Phone calls and confusion about daily assignments
**After:** Centralised calendar with automatic notifications

**Functionality:**
- Drag-and-drop job assignment interface
- Employee availability tracking


## Technical Highlights

### Database Architecture Evolution
**MongoDB → PostgreSQL Migration:**
- Improved data consistency with relational constraints
- Better performance for complex reporting queries
- ACID compliance for financial calculations

### Authentication & Security
- Role-based permissions (Owner, Foreman, Employee)
- Audit trails for all timesheet and job modifications

### File Management System
Integrated document storage for:
- Construction plans and blueprints
- Progress photos with automatic compression

## Business Transformation

### Administrative Efficiency
- **85% reduction** in timesheet-related administrative tasks
- **Same-day payroll processing** versus previous 3-day cycle
- **Eliminated paper costs** and storage requirements

### Financial Visibility
- **Real-time job profitability** enabling mid-project corrections
- **15% improvement** in overall job margins through better cost control
- **Faster invoicing** with automated time compilation

### Employee Satisfaction
- **Simplified timesheet submission** via mobile devices
- **Clear schedule visibility** reducing confusion and conflicts
- **Transparent pay calculation** with detailed hour breakdowns

## Technical Evolution

### Deployment Strategy
- **Version 1.0:** AWS Elastic Beanstalk with automated scaling
- **Version 2.0:** Dockerised deployment on Railway with CI/CD pipeline
- **Database:** PostgreSQL with automated backups
- **Storage:** AWS S3 for file management with CloudFront CDN

### Code Quality Improvements
- Migrated from JavaScript to TypeScript for better type safety
- Implemented TRPC for end-to-end type safety
- Established ESLint and Prettier for consistent code formatting

## Links

- 🌐 **Live Application:** [dreamsbuilt.co.nz](https://dreamsbuilt.co.nz)
- 🔐 **Demo Access:** Available upon request

---

*This project demonstrates the transformative power of custom software solutions for small businesses, turning manual processes into automated workflows that save time and increase profitability.*
