# 🔥 Firebase Setup - הגדרת Firebase

## 📋 מה זה Firebase?
Firebase הוא שירות ענן של Google שמאפשר:
- **שמירת תמונות בענן** - התמונות יופיעו בכל המכשירים
- **סנכרון אוטומטי** - שינויים מתעדכנים מיד
- **חינמי עד 5GB** - מספיק לפרויקט קטן

## 🚀 שלב 1: יצירת פרויקט Firebase

### 1.1 היכנס ל-Firebase Console
```
https://console.firebase.google.com/
```

### 1.2 צור פרויקט חדש
- לחץ על "Create a project" או "צור פרויקט"
- תן שם לפרויקט: `hen-dayan-invoices` (או שם אחר)
- לחץ "Continue" או "המשך"

### 1.3 הגדר Google Analytics (אופציונלי)
- אפשר להשאיר מופעל או לכבות
- לחץ "Continue" או "המשך"

### 1.4 לחץ "Create project" או "צור פרויקט"

## 🔧 שלב 2: הגדרת Authentication

### 2.1 היכנס לפרויקט
- לחץ על הפרויקט שיצרת

### 2.2 הוסף Authentication
- בתפריט השמאלי, לחץ על "Authentication"
- לחץ על "Get started" או "התחל"
- בחר "Email/Password" או "אימייל/סיסמה"
- לחץ "Enable" או "הפעל"
- לחץ "Save" או "שמור"

## 💾 שלב 3: הגדרת Firestore Database

### 3.1 הוסף Firestore
- בתפריט השמאלי, לחץ על "Firestore Database"
- לחץ על "Create database" או "צור מסד נתונים"
- בחר "Start in test mode" או "התחל במצב בדיקה"
- בחר מיקום: `europe-west1` (אירופה) או `us-central1` (ארה"ב)
- לחץ "Enable" או "הפעל"

## 🖼️ שלב 4: הגדרת Storage

### 4.1 הוסף Storage
- בתפריט השמאלי, לחץ על "Storage"
- לחץ על "Get started" או "התחל"
- בחר "Start in test mode" או "התחל במצב בדיקה"
- בחר מיקום: `europe-west1` (אירופה) או `us-central1` (ארה"ב)
- לחץ "Done" או "סיום"

## 🔑 שלב 5: קבלת מפתחות API

### 5.1 הוסף אפליקציית Web
- בתפריט השמאלי, לחץ על "Project settings" (⚙️)
- בחר "General" או "כללי"
- גלול למטה ל-"Your apps" או "האפליקציות שלך"
- לחץ על סמל ה-Web (</>)
- תן שם: `hen-dayan-web`
- לחץ "Register app" או "רשום אפליקציה"

### 5.2 העתק את הקונפיגורציה
תקבל קוד שנראה כך:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 📝 שלב 6: עדכון הקוד

### 6.1 עדכן את הקובץ `src/app/firebase/config.ts`
החלף את הערכים ב-`firebaseConfig` עם הערכים שקיבלת:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // העתק מכאן
  authDomain: "your-project.firebaseapp.com", // העתק מכאן
  projectId: "your-project-id", // העתק מכאן
  storageBucket: "your-project.appspot.com", // העתק מכאן
  messagingSenderId: "123456789", // העתק מכאן
  appId: "1:123456789:web:abc123" // העתק מכאן
};
```

## 🔒 שלב 7: הגדרת כללי אבטחה

### 7.1 Firestore Rules
- בתפריט השמאלי, לחץ על "Firestore Database"
- לחץ על "Rules" או "כללים"
- החלף את הכללים עם:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 7.2 Storage Rules
- בתפריט השמאלי, לחץ על "Storage"
- לחץ על "Rules" או "כללים"
- החלף את הכללים עם:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## ✅ שלב 8: בדיקה

### 8.1 הפעל את האפליקציה
```bash
npm run dev
```

### 8.2 נסה להוסיף תמונה
- היכנס לקטגוריית "חשבוניות"
- הוסף תמונה מהמובייל או מהמחשב
- התמונה אמורה להישמר בענן

### 8.3 בדוק במכשיר אחר
- פתח את האפליקציה במכשיר אחר
- התמונה אמורה להופיע שם גם

## 🚨 בעיות נפוצות

### בעיה: "Firebase App named '[DEFAULT]' already exists"
**פתרון**: וודא שיש רק קובץ config אחד

### בעיה: "Permission denied"
**פתרון**: וודא שכללי האבטחה מוגדרים נכון

### בעיה: תמונות לא נטענות
**פתרון**: וודא שה-URL נכון ב-Firebase Console

## 📞 תמיכה

אם יש בעיות:
1. בדוק את Console בדפדפן (F12)
2. וודא שכל הערכים ב-config נכונים
3. בדוק שכל השירותים מופעלים ב-Firebase Console

## 🎉 סיום!

עכשיו התמונות יישמרו בענן ויופיעו בכל המכשירים! 🚀
