
# Customizing Supabase Email Templates

This document provides instructions for customizing the email templates used by Supabase Auth.

## How to Customize Email Templates

1. Navigate to your Supabase dashboard (https://app.supabase.com/)
2. Select your project
3. Go to Authentication → Email Templates
4. Customize each template as needed

## Custom Email Template for Confirmation

### Subject:
```
Welcome to PeoplePeeper - Please Confirm Your Email
```

### Content:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PeoplePeeper</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #3b82f6;
      padding: 20px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      background-color: #f9fafb;
    }
    .button {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PeoplePeeper</div>
    </div>
    <div class="content">
      <h2>Welcome to PeoplePeeper!</h2>
      <p>Thank you for signing up. To complete your registration and start discovering social media profiles, please confirm your email address.</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirm My Email</a>
      </div>
      
      <p>If you didn't create an account with us, you can safely ignore this email.</p>
      
      <p>The confirmation link will expire in 24 hours.</p>
      
      <p>Need help? Contact our support team at support@peoplepeeper.com</p>
    </div>
    <div class="footer">
      <p>© 2025 PeoplePeeper. All rights reserved.</p>
      <p>123 Search Street, San Francisco, CA 94105</p>
    </div>
  </div>
</body>
</html>
```

## Custom Email Template for Magic Link

### Subject:
```
Your Login Link for PeoplePeeper
```

### Content:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your PeoplePeeper Login Link</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #3b82f6;
      padding: 20px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      background-color: #f9fafb;
    }
    .button {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PeoplePeeper</div>
    </div>
    <div class="content">
      <h2>Your Login Link</h2>
      <p>Click the button below to securely log in to your PeoplePeeper account. No password required!</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Log In to PeoplePeeper</a>
      </div>
      
      <p>If you didn't request this link, you can safely ignore this email.</p>
      
      <p>This login link will expire in 24 hours.</p>
      
      <p>Need help? Contact our support team at support@peoplepeeper.com</p>
    </div>
    <div class="footer">
      <p>© 2025 PeoplePeeper. All rights reserved.</p>
      <p>123 Search Street, San Francisco, CA 94105</p>
    </div>
  </div>
</body>
</html>
```

## Custom Email Template for Reset Password

### Subject:
```
Reset Your PeoplePeeper Password
```

### Content:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your PeoplePeeper Password</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #3b82f6;
      padding: 20px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      background-color: #f9fafb;
    }
    .button {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PeoplePeeper</div>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>You recently requested to reset your password for your PeoplePeeper account. Click the button below to reset it.</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Reset My Password</a>
      </div>
      
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      
      <p>This password reset link will expire in 24 hours.</p>
      
      <p>Need help? Contact our support team at support@peoplepeeper.com</p>
    </div>
    <div class="footer">
      <p>© 2025 PeoplePeeper. All rights reserved.</p>
      <p>123 Search Street, San Francisco, CA 94105</p>
    </div>
  </div>
</body>
</html>
```

## Important Notes on Email Configuration

1. **Site URL Configuration**: 
   - Go to Authentication → URL Configuration
   - Set the Site URL to your deployed app URL (not localhost)
   - Add all your redirect URLs (including local development URLs for testing)

2. **Email Provider**: 
   - For production use, set up a custom SMTP provider in Authentication → Email Settings
   - This will improve email deliverability and allow for custom email domains

3. **Testing**: 
   - Always test your email templates with real email addresses to ensure they display correctly
   - Check both desktop and mobile email clients
