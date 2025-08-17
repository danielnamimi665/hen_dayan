# הוראות הגדרת Firebase לסנכרון תמונות בין מכשירים

## מטרה
הגדרת Firebase כדי שתמונות החשבוניות יסתנכרנו בין כל המכשירים שמתחברים לאתר.

## שלבים להגדרה

### 1. יצירת פרויקט Firebase
1. היכנס ל-[Firebase Console](https://console.firebase.google.com/)
2. לחץ על "Create a project" או "צור פרויקט"
3. תן שם לפרויקט (למשל: `hen-dayan-invoices`)
4. בחר אם להפעיל Google Analytics (אופציונלי)
5. לחץ על "Create project" או "צור פרויקט"

### 2. הפעלת Firebase Storage
1. בתפריט השמאלי, לחץ על "Storage"
2. לחץ על "Get started" או "התחל"
3. בחר "Start in test mode" או "התחל במצב בדיקה"
4. בחר מיקום (למשל: `us-central1`)
5. לחץ על "Done" או "סיום"

### 3. הפעלת Firestore Database
1. בתפריט השמאלי, לחץ על "Firestore Database"
2. לחץ על "Create database" או "צור מסד נתונים"
3. בחר "Start in test mode" או "התחל במצב בדיקה"
4. בחר מיקום (אותו מיקום שבחרת ב-Storage)
5. לחץ על "Done" או "סיום"

### 4. קבלת פרטי הגדרה
1. בתפריט השמאלי, לחץ על "Project settings" (סמל גלגל שיניים)
2. גלול למטה לחלק "Your apps"
3. לחץ על "Web" (סמל </>)
4. תן שם לאפליקציה (למשל: `hen-dayan-web`)
5. לחץ על "Register app" או "רשום אפליקציה"
6. העתק את פרטי ההגדרה

### 5. יצירת קובץ .env.local
צור קובץ `.env.local` בתיקיית הפרויקט עם התוכן הבא:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 6. עדכון firebase/config.ts
הקובץ כבר מוגדר לקרוא מהמשתנים הסביבה. אם תרצה להגדיר ישירות, עדכן את `src/app/firebase/config.ts`.

### 7. הפעלת האפליקציה
1. הפעל מחדש את שרת הפיתוח: `npm run dev`
2. האפליקציה תנסה להתחבר ל-Firebase
3. אם הכל מוגדר נכון, התמונות יישמרו בענן ויסתנכרנו בין מכשירים

## בדיקת הסנכרון

### בדיקה בין מכשירים:
1. העלה תמונה ממכשיר אחד
2. פתח את האתר במכשיר אחר
3. התמונה אמורה להופיע באלבום

### בדיקת Console:
פתח את Developer Tools ובדוק את ה-Console:
- אם Firebase עובד: תראה "Loaded X invoices from Firebase"
- אם Firebase לא עובד: תראה "Firebase error, trying IndexedDB fallback"

## פתרון בעיות

### שגיאה: "Firebase: Error (auth/unauthorized)"
- בדוק שהפרטים ב-.env.local נכונים
- וודא שהפרויקט מופעל ב-Firebase Console

### שגיאה: "Firebase: Error (storage/unauthorized)"
- בדוק ש-Firebase Storage מופעל
- וודא שהכללים מאפשרים קריאה וכתיבה

### שגיאה: "Firebase: Error (firestore/unauthorized)"
- בדוק ש-Firestore Database מופעל
- וודא שהכללים מאפשרים קריאה וכתיבה

## הערות חשובות

1. **מצב בדיקה**: Firebase מוגדר במצב בדיקה, כלומר כל אחד יכול לקרוא ולכתוב. לפרודקשן, יש להגדיר כללי אבטחה.

2. **עלות**: Firebase Storage ו-Firestore הם שירותים בתשלום אחרי שימוש חינמי מסוים. בדוק את התעריפים.

3. **גיבוי**: התמונות נשמרות בענן של Google, כך שהן בטוחות יותר מאשר במכשיר המקומי בלבד.

4. **סנכרון אוטומטי**: כל שינוי (הוספה/מחיקה) יסתנכרן אוטומטית בין כל המכשירים.

## תמיכה

אם יש בעיות, בדוק:
1. Console של הדפדפן
2. Firebase Console > Logs
3. Network tab ב-Developer Tools
