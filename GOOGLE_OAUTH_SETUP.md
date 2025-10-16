# Google OAuth Redirect URI Configuration Guide# Google OAuth Redirect URI Configuration Guide



## Current Setup## ✅ Current Status

- Server: **http://localhost:3000**- Server running on: **http://localhost:3000**

- Required redirect URI: **http://localhost:3000/api/auth/callback/google**- NEXTAUTH_URL: **http://localhost:3000**

- Required redirect URI: **http://localhost:3000/api/auth/callback/google**

## Add Redirect URI to Google Cloud Console

## Error You're Seeing

### Step-by-Step Instructions```

You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.

1. **Go to Google Cloud Console**: https://console.cloud.google.com/Request details: redirect_uri=http://localhost:3001/api/auth/callback/google

2. Navigate to **APIs & Services** → **Credentials**```

3. Find your OAuth 2.0 Client ID (check `.env` for GOOGLE_CLIENT_ID)

4. Click **Edit** (pencil icon)## Solution: Add Redirect URI to Google Cloud Console

5. Under **"Authorized redirect URIs"**, add:

   ```### Step-by-Step Instructions

   http://localhost:3000/api/auth/callback/google

   ```#### 1. Go to Google Cloud Console

6. **Optional** - Add these for development flexibility:🔗 https://console.cloud.google.com/

   ```

   http://localhost:3001/api/auth/callback/google#### 2. Select Your Project

   http://localhost:3002/api/auth/callback/google- Look for your project name in the top navigation bar

   http://127.0.0.1:3000/api/auth/callback/google- Click the dropdown to select the correct project

   ```

7. Add **Authorized JavaScript origins**:#### 3. Navigate to OAuth Consent Screen & Credentials

   ``````

   http://localhost:3000Left Menu → APIs & Services → Credentials

   http://127.0.0.1:3000```

   ```

8. Click **SAVE**#### 4. Find Your OAuth 2.0 Client ID

9. Wait 5-10 seconds for changes to propagate- Look for your Google OAuth client in the credentials list

- Click the pencil/edit icon next to it

### Test the Login

1. Clear browser cache/cookies for localhost#### 5. Add Authorized Redirect URIs

2. Go to: **http://localhost:3000**In the **"Authorized redirect URIs"** section, add:

3. Click "Sign in with Google"

4. Should now work! ✅**Required URI:**

```

## Production Setup (When Deploying)http://localhost:3000/api/auth/callback/google

```

Add your production domain:

```**Optional (for flexibility during development):**

https://yourdomain.com/api/auth/callback/google```

```http://localhost:3001/api/auth/callback/google

http://localhost:3002/api/auth/callback/google

And update `.env`:http://127.0.0.1:3000/api/auth/callback/google

```env```

NEXTAUTH_URL=https://yourdomain.com

```#### 6. Add Authorized JavaScript Origins (Optional but Recommended)

```

## Troubleshootinghttp://localhost:3000

http://localhost:3001

- **Still seeing error?** Clear browser cache and wait 10 minuteshttp://localhost:3002

- **Different port?** Make sure `.env` has `NEXTAUTH_URL=http://localhost:3000`http://127.0.0.1:3000

- **Not saving?** Check you clicked "SAVE" and have edit permissions```



## Quick Checklist#### 7. Save Changes

- Click **"SAVE"** at the bottom

- [ ] Google Cloud Console accessed- Wait 5-10 seconds for changes to propagate

- [ ] OAuth 2.0 Client ID found

- [ ] Added redirect URI#### 8. Test the Login

- [ ] Clicked SAVE1. Clear browser cache/cookies for localhost

- [ ] Cleared browser cache2. Go to: **http://localhost:3000**

- [ ] Tested login at http://localhost:30003. Click "Sign in with Google"

4. Should now work! ✅

---

## Visual Guide

**Note**: Your OAuth credentials are in the `.env` file (never commit this file to Git!)

```
Google Cloud Console
├── Select Project
├── APIs & Services
│   └── Credentials
│       └── OAuth 2.0 Client IDs
│           └── Your Client ID
│               ├── Authorized JavaScript origins
│               │   └── http://localhost:3000
│               └── Authorized redirect URIs
│                   └── http://localhost:3000/api/auth/callback/google ← ADD THIS
```

## Your OAuth Credentials

**Client ID:** Check your `.env` file for `GOOGLE_CLIENT_ID`

**Client Secret:** Check your `.env` file for `GOOGLE_CLIENT_SECRET`

⚠️ **Important**: Never commit your `.env` file to Git! It's already in `.gitignore`.

## Production Setup (When Deploying)

When you deploy to production (e.g., Vercel, Netlify), add:

```
https://yourdomain.com/api/auth/callback/google
```

And update your `.env` file:
```env
NEXTAUTH_URL=https://yourdomain.com
```

## Troubleshooting

### Issue: Still seeing the error after updating
**Solution:** 
- Clear browser cache and cookies
- Wait 5-10 minutes for Google's servers to propagate changes
- Try in incognito/private browsing mode

### Issue: Different port showing in error
**Solution:**
- Make sure `.env` has `NEXTAUTH_URL=http://localhost:3000`
- Restart the dev server: `npm run dev`
- Check that port 3000 is not in use by another app

### Issue: Changes not saving in Google Cloud Console
**Solution:**
- Make sure you clicked "SAVE" at the bottom
- Check you're editing the correct OAuth client
- Verify you have permission to edit the project

## Quick Checklist

- [ ] Google Cloud Console opened
- [ ] Correct project selected
- [ ] Navigated to APIs & Services → Credentials
- [ ] Found OAuth 2.0 Client ID
- [ ] Added `http://localhost:3000/api/auth/callback/google` to redirect URIs
- [ ] Clicked SAVE
- [ ] Waited 10 seconds
- [ ] Cleared browser cache
- [ ] Tested login at http://localhost:3000

## After Fixing

Once you've added the redirect URI in Google Cloud Console:

✅ Google OAuth login will work
✅ User will be created in MongoDB
✅ Session will be established
✅ Dashboard will load with user data
✅ All API routes will be accessible
✅ Receipt upload feature will work

## Alternative: Use Credentials Login (Temporary Workaround)

If you can't access Google Cloud Console right now, you can still test the app:

1. Go to: **http://localhost:3000/register**
2. Create an account with email/password
3. Login with credentials
4. Test all features including receipt upload

The Google OAuth can be configured later.

---

**Current Server Status:** 🟢 Running on http://localhost:3000
**MongoDB:** 🟢 Connected
**Features Ready:** 🟢 Expenses, Budgets, Goals, OCR Receipt Upload

Need help? The app is ready - just need to update Google Cloud Console! 🚀
