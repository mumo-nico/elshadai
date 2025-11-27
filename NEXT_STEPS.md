# Next Steps - Development Roadmap

## 🎯 Immediate Next Steps

### 1. Setup Database (Prisma + PostgreSQL)

#### Install Dependencies
```bash
npm install prisma @prisma/client
npm install -D prisma
```

#### Initialize Prisma
```bash
npx prisma init
```

#### Create Schema
Edit `prisma/schema.prisma` with the models from the PRD:
- User (landlords and tenants)
- Apartment
- Unit (with types: shop, single_room, double_room, bedsitter, 1_bedroom, 2_bedroom, 3_bedroom)
- Lease
- Payment
- Complaint
- ComplaintComment
- AuditLog

#### Run Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### 2. Setup Authentication (NextAuth.js)

#### Install Dependencies
```bash
npm install next-auth @auth/prisma-adapter bcrypt
npm install -D @types/bcrypt
```

#### Create Auth Configuration
- Create `app/api/auth/[...nextauth]/route.ts`
- Setup credentials provider
- Add role-based access control (landlord vs tenant)
- Protect dashboard routes

#### Connect Auth Modal
- Update `components/auth/auth-modal.tsx` to use real authentication
- Add form validation
- Handle login/signup errors
- Redirect to dashboard on success

---

### 3. Create Dashboard Pages

#### Properties Page (`app/dashboard/properties/page.tsx`)
- List all properties
- Create new property form
- Edit property
- Delete property
- View property details with units

#### Units Page (`app/dashboard/units/page.tsx`)
- List all units (filterable by property)
- Create new unit
- Edit unit details
- Change unit status (available, occupied, maintenance)
- Assign tenant to unit

#### Tenants Page (`app/dashboard/tenants/page.tsx`)
- List all tenants
- View tenant profile
- Create/edit tenant
- View lease history
- View payment history

#### Payments Page (`app/dashboard/payments/page.tsx`)
- List all payments
- Record new payment
- Filter by date, tenant, property
- Generate receipts
- Mark payment status

#### Reports Page (`app/dashboard/reports/page.tsx`)
- Income report (by period)
- Occupancy report
- Outstanding rent report
- Export to CSV
- Charts and graphs

#### Complaints Page (`app/dashboard/complaints/page.tsx`)
- List all complaints/tickets
- Create new complaint
- View complaint details
- Add comments
- Update status
- Resolve complaints

---

### 4. Create API Routes

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user

#### Apartments
- `GET /api/apartments` - List all apartments
- `POST /api/apartments` - Create apartment
- `GET /api/apartments/[id]` - Get apartment details
- `PUT /api/apartments/[id]` - Update apartment
- `DELETE /api/apartments/[id]` - Delete apartment

#### Units
- `GET /api/units` - List all units
- `POST /api/units` - Create unit
- `GET /api/units/[id]` - Get unit details
- `PUT /api/units/[id]` - Update unit
- `DELETE /api/units/[id]` - Delete unit

#### Tenants
- `GET /api/tenants` - List all tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/[id]` - Get tenant details
- `PUT /api/tenants/[id]` - Update tenant

#### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Create payment
- `GET /api/payments/[id]` - Get payment details
- `POST /api/payments/webhook` - Payment gateway webhook

#### Complaints
- `GET /api/complaints` - List all complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/[id]` - Get complaint details
- `PUT /api/complaints/[id]` - Update complaint status
- `POST /api/complaints/[id]/comments` - Add comment

#### Reports
- `GET /api/reports/income` - Income report
- `GET /api/reports/occupancy` - Occupancy report
- `GET /api/reports/outstanding` - Outstanding rent report

---

### 5. Payment Integration

#### Choose Payment Gateway
- **Stripe** (International)
- **M-Pesa** (Kenya - recommended)
- **Flutterwave** (Africa)

#### Setup
```bash
npm install stripe
# or
npm install flutterwave-node-v3
```

#### Implement
- Payment form
- Webhook handling
- Receipt generation
- Payment confirmation emails

---

### 6. Additional Features

#### Email Notifications
```bash
npm install nodemailer
```
- Payment confirmations
- Rent reminders
- Complaint updates

#### File Uploads
```bash
npm install uploadthing
```
- Property images
- Payment receipts
- Tenant documents

#### Charts & Analytics
```bash
npm install recharts
```
- Revenue charts
- Occupancy trends
- Payment analytics

---

## 📋 Development Checklist

### Phase 1: Backend Setup
- [ ] Setup PostgreSQL database
- [ ] Create Prisma schema
- [ ] Run migrations
- [ ] Create seed data
- [ ] Setup NextAuth.js
- [ ] Create API routes

### Phase 2: Dashboard Pages
- [ ] Properties page
- [ ] Units page
- [ ] Tenants page
- [ ] Payments page
- [ ] Reports page
- [ ] Complaints page
- [ ] Settings page

### Phase 3: Features
- [ ] Payment integration
- [ ] Email notifications
- [ ] File uploads
- [ ] Charts and analytics
- [ ] Export functionality

### Phase 4: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Form validation
- [ ] Responsive design testing
- [ ] Performance optimization

### Phase 5: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Setup monitoring

---

## 🚀 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Prisma commands
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Run migrations
npx prisma generate        # Generate Prisma Client
npx prisma db seed         # Seed database

# Linting
npm run lint
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion)

