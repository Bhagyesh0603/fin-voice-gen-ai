# MongoDB IP Whitelist Setup Guide

## Current Error
```
MongoServerError: bad auth : authentication failed
Code: 8000
CodeName: AtlasError
```

## This error means one of two things:
1. **Incorrect MongoDB credentials** (username/password)
2. **IP address not whitelisted** in MongoDB Atlas

## Solution Steps

### Option 1: Verify MongoDB Credentials

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Login** to your account
3. Go to **Database Access** (left sidebar)
4. Check your database user: `joshibhagyesh06_db_user`
5. If needed, click **"Edit"** and reset the password
6. **Copy the new password** (or confirm the current one)
7. Update `.env` file with the correct password (URL-encoded if it has special characters)

### Option 2: Add Your IP to Whitelist

#### Quick Fix - Allow All IPs (Development Only)
1. Go to **MongoDB Atlas** → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Enter: `0.0.0.0/0`
5. Click **"Confirm"**
6. Wait 1-2 minutes for changes to propagate

#### Secure Fix - Add Specific IP
1. Get your current IP:
   ```powershell
   curl ifconfig.me
   ```
2. Go to **MongoDB Atlas** → **Network Access**
3. Click **"Add IP Address"**
4. Click **"Add Current IP Address"**
5. Or manually enter your IP
6. Click **"Confirm"**

### Option 3: Reset MongoDB Password

If you're not sure about the password:

1. **MongoDB Atlas** → **Database Access**
2. Find user: `joshibhagyesh06_db_user`
3. Click **"Edit"**
4. Click **"Edit Password"**
5. Choose **"Autogenerate Secure Password"** OR set your own
6. **Copy the password** immediately!
7. If password has special characters, URL-encode them:
   - `%` → `%25`
   - `@` → `%40`
   - `:` → `%3A`
   - `/` → `%2F`

8. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://joshibhagyesh06_db_user:YOUR_NEW_PASSWORD@cluster0.neeg76q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

### Option 4: Get Fresh Connection String

1. **MongoDB Atlas** → **Database** → **Connect**
2. Choose **"Connect your application"**
3. Select **Driver**: Node.js, **Version**: 5.5 or later
4. **Copy** the connection string
5. Replace `<password>` with your actual password
6. Update `.env` with the new connection string

## After Fixing

1. Restart the development server:
   ```powershell
   npm run dev
   ```

2. Test the connection:
   - Go to http://localhost:3000
   - Login with Google
   - Dashboard should load with data

## Current Connection String Format

```
mongodb+srv://USERNAME:PASSWORD@cluster0.neeg76q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

Your current:
- **Username**: `joshibhagyesh06_db_user`
- **Cluster**: `cluster0.neeg76q.mongodb.net`
- **Database**: Default (test/admin)

## Troubleshooting

### Test Connection (Optional)
Create a test file `test-mongo.js`:
```javascript
const mongoose = require('mongoose');

const MONGODB_URI = 'your-connection-string-here';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
```

Run: `node test-mongo.js`

## Quick Checklist

- [ ] MongoDB Atlas account accessible
- [ ] User `joshibhagyesh06_db_user` exists in Database Access
- [ ] Password is correct
- [ ] Password is URL-encoded in connection string
- [ ] IP address added to Network Access whitelist
- [ ] Waited 1-2 minutes after making changes
- [ ] Restarted dev server
- [ ] Tested login

---

**Note**: The current password in your `.env` is: `G3AbqrD4iSNXib91`

If this is correct, the issue is likely the **IP whitelist**. Add `0.0.0.0/0` for development.
