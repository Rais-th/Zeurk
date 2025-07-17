📱 **NOTIFICATION SETUP GUIDE**
================================

## 🔍 **ISSUE IDENTIFIED**
Your app is not receiving notifications because you haven't registered as a driver yet. The app requires manual driver registration.

## 📋 **STEP-BY-STEP SOLUTION**

### **Step 1: Open the Driver Dashboard**
1. Open your Zeurk app in Expo Go
2. Navigate to the **Driver Dashboard** screen
3. Look for the **Settings** section

### **Step 2: Enable SMS Notifications**
1. In the Settings panel, find **"Notifications SMS"**
2. Toggle the switch to **ON** (it should turn orange)
3. When prompted, allow notification permissions
4. You should see a success message: "Notifications SMS activées"

### **Step 3: Verify Registration**
1. Check the console logs for: "Driver registered with token: ExponentPushToken[...]"
2. The app will automatically send your push token to the backend
3. You should now be registered as an active driver

### **Step 4: Test the Workflow**
1. Send an SMS to: **+18447904199**
2. Message: **"Course Bandal vers Gombe 18h"**
3. You should receive a push notification on your device!

## 🔧 **TROUBLESHOOTING**

### **If notifications still don't work:**

1. **Check Device Settings:**
   - Go to iOS Settings > Notifications > Expo Go
   - Ensure notifications are enabled
   - Check that "Allow Notifications" is ON

2. **Verify Driver Registration:**
   - In the app, check that "Notifications SMS" toggle is ON
   - Look for the green checkmark or enabled state

3. **Test with the Test Button:**
   - In Driver Dashboard Settings
   - Tap "Tester une notification" 
   - This should show a local test notification

4. **Check Console Logs:**
   - Look for: "🔔 App initialisé avec token: ExponentPushToken[...]"
   - Look for: "Driver registered with token: ..."

## 🎯 **EXPECTED WORKFLOW**
1. ✅ SMS received at +18447904199
2. ✅ AI parses the ride request
3. ✅ Ride request created with ID
4. ✅ Push notification sent to your registered device
5. ✅ Notification appears on your phone
6. ✅ Tap notification to open ride details

## 📞 **SUPPORT**
If you're still having issues after following these steps, the problem might be:
- Device permissions
- Expo Go app settings
- Network connectivity
- Push token registration failure

Try the manual registration script if needed:
```bash
node register-real-token.js
```

## 🚀 **SUCCESS INDICATORS**
- ✅ "Notifications SMS" toggle is ON in Driver Dashboard
- ✅ Console shows driver registration success
- ✅ Test notification works
- ✅ SMS to +18447904199 triggers notification