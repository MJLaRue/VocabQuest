# 🧪 Testing Guide - HSPT Vocabulary App

## Quick Start Testing

### 1. Setup (First Time Only)

```bash
# Install dependencies
npm install

# Create database
createdb vocab_app

# Initialize database tables
npm run init-db

# Import vocabulary (676 words)
node server/scripts/importVocab.js

# Create admin account
npm run create-admin
# Example: admin@school.edu / Admin123!

# Start development server
npm run dev
```

Server starts at: http://localhost:3000

---

## ✅ Test Scenarios

### Scenario 1: Student Registration & Login

1. **Navigate to registration**
   - Go to http://localhost:3000
   - Click "Create an account"

2. **Test .edu restriction**
   - Try: `test@gmail.com` → Should show error "Registration is restricted to .edu email addresses"
   - Try: `student@school.edu` → Should allow
   - Password: `Student123!`
   - Confirm password: `Student123!`
   - Click "Create Account"
   - Should show success message and redirect to login

3. **Test login**
   - Email: `student@school.edu`
   - Password: `Student123!`
   - Click "Log In"
   - Should redirect to `/app.html`

4. **Verify flashcards load**
   - Should see 676 vocabulary words loaded
   - XP bar shows Level 1, 0/100 XP
   - Streak shows 1 day (first visit)

---

### Scenario 2: Practice Mode

1. **View flashcard**
   - Click on flashcard → Should flip and show definition
   - Click again → Should flip back to word

2. **Navigate cards**
   - Click "Next ▶" → Should show next card
   - Click "◀ Prev" → Should go back
   - Use arrow keys (← →) → Should navigate

3. **Search functionality**
   - Type "abandon" in search box
   - Cards should filter to matching words
   - Clear search → All cards return

4. **Filter by part of speech**
   - Click "noun" chip → Should show only nouns
   - Click "verb" chip → Should show only nouns and verbs
   - Click "None" button → Should show no cards
   - Click "All" button → Should show all cards

5. **Mark as known**
   - Click "I know it" button
   - Progress pill should update: "Deck: 1 / 676 known"
   - Progress bar should fill slightly
   - XP bar should increase (+10 XP)

---

### Scenario 3: Quiz Mode

1. **Switch to quiz**
   - Click "Quiz" mode button
   - Should show word + part of speech
   - Should display 4 definition choices

2. **Answer correctly**
   - Click correct definition
   - Should show green "Nice!" feedback with word details
   - XP should increase (+15 XP for quiz)
   - Session stats should update: "1 correct"
   - Should auto-advance to next question

3. **Answer incorrectly**
   - Click wrong definition
   - Should show red "Try again" feedback
   - Streak should reset to 0
   - Should auto-advance

4. **Build streak**
   - Answer 5 questions correctly in a row
   - Should get streak bonus (+5 XP extra)
   - Answer 10 correctly → Should get +10 XP bonus per answer
   - Should see streak counter increase

---

### Scenario 4: Typing Mode

1. **Switch to typing**
   - Click "Typing" mode button
   - Should show definition
   - Should show text input field

2. **Type correct answer**
   - Read definition (e.g., "to give up completely")
   - Type: `abandon`
   - Press Enter or click "Check"
   - Should show green "Nice!" feedback
   - XP should increase (+20 XP for typing)

3. **Type incorrect answer**
   - Type wrong word
   - Press Enter
   - Should show red "Try again" feedback
   - Streak resets

---

### Scenario 5: Gamification

1. **XP and leveling**
   - Answer 10 quiz questions correctly
   - Should earn: 10 × 15 = 150 XP
   - Should level up to Level 2 (needs 100 XP)
   - Should see "🎉 Level Up!" message
   - XP bar should show progress toward Level 3 (needs 150 XP)

2. **Check achievements**
   - Click "🏆 Achievements" button
   - Should open modal
   - Should see unlocked achievements:
     - "First Step" (1 correct answer)
     - "Rising Star" (Level 2)
   - Locked achievements should be grayed out

3. **Daily streak**
   - Check streak badge: Should show "1 day streak"
   - Logout and login tomorrow → Should increment to 2
   - Skip a day → Should reset to 1

---

### Scenario 6: Admin Dashboard

1. **Login as admin**
   - Logout (click "Log Out")
   - Login with: `admin@school.edu`
   - Should redirect to `/admin.html`

2. **Overview tab**
   - Should show stats:
     - Total Users: 2 (admin + student)
     - Vocabulary Words: 676
     - Avg XP per User: varies
     - Study Sessions: varies
   - Should show leaderboard with top students

3. **Users tab**
   - Click "Users" tab
   - Should see table with both users
   - Search "student" → Should filter to student user
   - Click "Delete" → Confirm → User deleted (be careful!)

4. **Add new user**
   - Click "+ Add User"
   - Enter email: `teacher@school.edu`
   - Enter password: `Teacher123!`
   - Choose role: Cancel (student) or OK (admin)
   - User should appear in table

5. **Vocabulary tab**
   - Click "Vocabulary" tab
   - Should see all 676 words in table
   - Search "abandon" → Should filter results

6. **Upload CSV**
   - Create test CSV:
     ```csv
     word,part_of_speech,definition
     testword,noun,a test definition
     ```
   - Click "Choose File"
   - Select CSV
   - Confirm upload
   - Should see success message
   - Word should appear in table

7. **Download CSV**
   - Click "📥 Download CSV"
   - CSV file should download
   - Open in spreadsheet → Should have all words

8. **Add single word**
   - Click "+ Add Word"
   - Word: `newword`
   - Part of speech: `noun`
   - Definition: `a new word for testing`
   - Should appear in table

9. **Delete word**
   - Find test word in table
   - Click "Delete" button
   - Confirm
   - Word removed from table

10. **Analytics tab**
    - Click "Analytics" tab
    - Should show aggregate stats
    - Charts placeholder visible

11. **Navigate to app**
    - Click "📚 App" button
    - Should redirect to `/app.html`

---

### Scenario 7: Security Tests

1. **Unauthorized access**
   - Logout
   - Try to visit: http://localhost:3000/app.html
   - Should redirect to login page

2. **Non-admin access to dashboard**
   - Login as student
   - Try to visit: http://localhost:3000/admin.html
   - Should redirect to `/app.html`

3. **API security**
   - Open DevTools → Network tab
   - Try API call without auth:
     ```bash
     curl http://localhost:3000/api/progress
     ```
   - Should return 401 Unauthorized

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
brew services restart postgresql  # macOS
sudo service postgresql restart   # Linux

# Verify database exists
psql -l | grep vocab_app
```

---

### Issue: "Session table does not exist"
**Solution:**
```bash
# Run database initialization
npm run init-db
```

---

### Issue: "No vocabulary loaded"
**Solution:**
```bash
# Import vocabulary CSV
node server/scripts/importVocab.js
```

---

### Issue: "Admin user can't login"
**Solution:**
```bash
# Check admin exists in database
psql vocab_app
SELECT email, role FROM "Users";

# Update role if needed
UPDATE "Users" SET role = 'admin' WHERE email = 'admin@school.edu';
```

---

### Issue: "XP not updating"
**Solution:**
- Check browser console for errors
- Verify API call succeeds (Network tab)
- Check server logs for errors

---

### Issue: "CSS not loading"
**Solution:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check browser console for 404 errors
- Verify `client/public/css/styles.css` exists

---

## 🧪 Automated Testing (Future)

### Unit Tests
```bash
# Install Jest
npm install --save-dev jest supertest

# Run tests
npm test
```

### Integration Tests
```javascript
// Example test
test('POST /api/auth/login with valid credentials', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student@school.edu', password: 'Student123!' });
  
  expect(response.status).toBe(200);
  expect(response.body.user.email).toBe('student@school.edu');
});
```

---

## ✨ Performance Testing

### Load Testing with Apache Bench
```bash
# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json http://localhost:3000/api/auth/login

# login.json:
# {"email":"student@school.edu","password":"Student123!"}
```

---

## 📊 Expected Results Summary

| Test | Expected Outcome |
|------|------------------|
| Register with .edu | Account created |
| Register without .edu | Error message |
| Login valid user | Redirect to /app.html |
| Flashcards load | 676 words displayed |
| Answer correctly | +10-20 XP, green feedback |
| Level up | Modal or notification |
| Daily streak | Increments on consecutive days |
| Admin dashboard | All tabs functional |
| CSV upload | Words imported to database |
| Unauthorized access | Redirect to login |

---

## 🎉 Success Criteria

✅ **All test scenarios pass**  
✅ **No console errors**  
✅ **Database correctly stores data**  
✅ **Session persists across page reloads**  
✅ **XP/levels sync between frontend and backend**  
✅ **Admin can manage users and vocabulary**  
✅ **Security protections work**  

---

**Ready to test! 🚀**
