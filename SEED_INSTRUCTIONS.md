# 🌱 Database Seeding Instructions

## Quick Seed (Idempotent)

If you just want to add the seed data without clearing existing data:

```bash
npm run db:seed
```

This is **safe to run multiple times** - it will skip records that already exist.

---

## Fresh Start (Reset + Seed)

If you want to completely reset the database and start fresh:

```bash
# This will:
# 1. Drop all tables
# 2. Re-run all migrations
# 3. Run the seed script
npx prisma migrate reset
```

**⚠️ Warning:** This will delete ALL data in your database!

---

## What Gets Seeded

### Admin User
- **Email:** admin@gmail.com
- **Password:** admin@123
- **Role:** SCHOOL_ADMIN

### School
- **Name:** Blink Academy
- **Code:** BA001
- **Region:** Kigali, Rwanda

### Teachers (8)
All with password: `Password123!`
- john.smith@blinkacademy.com
- sarah.johnson@blinkacademy.com
- michael.brown@blinkacademy.com
- emily.davis@blinkacademy.com
- david.wilson@blinkacademy.com
- lisa.anderson@blinkacademy.com
- james.taylor@blinkacademy.com
- maria.garcia@blinkacademy.com

### Students (15)
All with password: `Password123!`
- alice.williams@student.com
- bob.martinez@student.com
- carol.rodriguez@student.com
- daniel.lee@student.com
- emma.white@student.com
- frank.harris@student.com
- grace.clark@student.com
- henry.lewis@student.com
- ivy.walker@student.com
- jack.hall@student.com
- kate.allen@student.com
- leo.young@student.com
- mia.king@student.com
- noah.scott@student.com
- olivia.green@student.com

### Classes (3)
- Senior 1 (Stream A)
- Senior 2 (Stream B)
- Senior 3 (Stream A)

### Subjects (5)
- Mathematics (MATH101)
- Physics (PHY101)
- Chemistry (CHEM101)
- Biology (BIO101)
- English (ENG101)

### Academic Term
- Term 1 - 2024 (Jan 15 - Apr 15)

---

## Troubleshooting

### Error: "Unique constraint failed"

This means some records already exist. You have two options:

**Option 1: Continue with existing data**
```bash
# The seed script will skip existing records
npm run db:seed
```

**Option 2: Reset everything**
```bash
# ⚠️ This deletes all data!
npx prisma migrate reset
```

### Error: "Database connection failed"

Make sure:
1. PostgreSQL is running
2. Database exists
3. `.env` has correct `DATABASE_URL`

```bash
# Check if database exists
psql -U postgres -l

# Create database if needed
createdb blink_campus_db
```

### Error: "Migration not found"

Run migrations first:
```bash
npm run db:migrate
npm run db:generate
npm run db:seed
```

---

## Verify Seeding

After seeding, verify the data:

```bash
# Open Prisma Studio
npm run db:studio
```

Or check directly:
```bash
psql -U postgres -d blink_campus_db -c "SELECT email FROM users WHERE email = 'admin@gmail.com';"
```

---

## Login After Seeding

Use these credentials to login:

```
Email: admin@gmail.com
Password: admin@123
```

Then navigate to:
- Students: http://localhost:3000/admin/students
- Teachers: http://localhost:3000/admin/teachers

---

## Notes

- The seed script is **idempotent** - safe to run multiple times
- Existing records are skipped, not updated
- If you need to update existing records, reset the database first
- All passwords are hashed with bcrypt (12 rounds)
