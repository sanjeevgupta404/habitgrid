# Iron Log — Training Ledger

**Iron Log** is a premium, full-stack gym workout tracker web application designed for lifters who appreciate simplicity, focus, and structural order. Modeled after a physical leather-and-paper training logbook, it strips away social feeds and generic fitness gamification, leaving only what matters: sets, reps, weight, and consistency.

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS v3
- **Database:** Firebase Cloud Firestore (real-time cross-device synchronization)
- **Authentication:** Firebase Auth (Google Sign-In)
- **Drag-and-Drop:** `@dnd-kit` (core + sortable + utilities)
- **Testing:** Vitest + React Testing Library

---

## Visual Identity & Design Direction

Iron Log features a dark, heavyweight **"training ledger"** aesthetic:
- **Warm Charcoal Background:** Premium dark theme mimicking leather binder paper (`#181715`).
- **Chalk-White Text:** High-contrast, clean chalk-white typography for high readability in high-glare gym environments.
- **Brass / Gold Accents:** Classic raw gold/brass indicators (`#d4af37`) highlighting active states, numeric values, and save statuses.
- **Typography:**
  - **Headings:** Bold, condensed display font (**Oswald**) for a raw, heavy-duty feel.
  - **Body:** Clean, legible sans (**Inter**).
  - **Numeric Data:** Highly legible monospace (**JetBrains Mono**) to make sets, reps, and weights read like entries in a physical ledger.
- **Ledger Elements:** Each exercise row features a small monospace numbered index (e.g., `01.`, `02.`), emphasizing structured tracking.

---

## Core Features

1. **Day-of-Week Navigation:** Easily plan your training week by switching between **Mon–Sun** tab views.
2. **Reorder via Drag-and-Drop:** Seamlessly drag and drop exercises within a day to rearrange the execution order of your workout.
3. **Exercise Library & Custom Addition:**
   - Quick search and filter from a built-in library categorized by movement patterns: **Push, Pull, Legs, Core, Cardio**.
   - Direct addition of custom movements with instant integration.
4. **Inline Statistics Editing:** Modify exercise name, sets, reps, and weights instantly directly within the row.
5. **Real-time Synchronized Autosave:**
   - Changes are automatically debounced and saved to Cloud Firestore under the user's specific document.
   - Listens to real-time updates so your workout plan stays perfectly in sync across multiple devices (e.g., phone and laptop) without interrupting active text editing.
6. **Save-Status Indicator:** Clear visual feedback showing `"Saving..."`, `"Synced"`, or `"Sync Error"`.

---

## Setup & Installation

Follow these steps to set up and run Iron Log locally:

### 1. Install Dependencies
Clone the repository and install the npm packages:
```bash
npm install
```

### 2. Set Up a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `iron-log`.
3. Create a **Web App** within the project to retrieve your Firebase SDK configuration credentials.

### 3. Enable Google Authentication
1. In the left-hand navigation, click **Authentication** and then click **Get Started**.
2. Under the **Sign-in method** tab, click **Add new provider** and select **Google**.
3. Enable it, select your project support email, and click **Save**.

### 4. Create a Firestore Database
1. Click **Firestore Database** in the left sidebar and click **Create Database**.
2. Select your location and choose either **Production Mode** or **Test Mode**.
3. Create the database.

### 5. Configure Security Rules
Deploy the Firestore security rules to protect user privacy. Users are authorized to only read or write their own documents matching their authenticated UID.
Copy the content of the `firestore.rules` file in the root of this project into the **Rules** tab of your Cloud Firestore Console, then click **Publish**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Fill In Local Environment Variables
Copy `.env.example` to a new file named `.env` and fill in your actual Firebase project settings:
```bash
cp .env.example .env
```
Open `.env` and supply the keys retrieved in Step 2:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 7. Run the Development Server
Start the local server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/` to log in and start tracking your workouts!

---

## Development & Test Commands

### Run Unit Tests (Vitest)
Executes all unit tests (including data structures and component rendering tests):
```bash
npm run test
```

### Build for Production
Compiles TypeScript and bundles the assets for static production hosting:
```bash
npm run build
```

### Run ESLint & Format
Lint and format source files:
```bash
npm run lint
npm run format
```

---

## Data Model (Firestore Document)

Each user's training plan is stored in a self-contained document in the `users` collection:
- **Collection:** `users`
- **Document ID:** Firebase Auth `uid`
- **Document Shape:**
```json
{
  "plan": {
    "Mon": [
      {
        "id": "e8321204-e3cc-4f81-ba9f-4318c89b27fd",
        "name": "Bench Press",
        "sets": 4,
        "reps": 8,
        "weight": 225
      },
      {
        "id": "3bb8e411-bdc1-4b14-8710-8b172a819b10",
        "name": "Overhead Press",
        "sets": 3,
        "reps": 10,
        "weight": 135
      }
    ],
    "Tue": [],
    "Wed": [],
    "Thu": [],
    "Fri": [],
    "Sat": [],
    "Sun": []
  }
}
```
Each entry in a day's list tracks:
- `id`: Unique identifier (UUID).
- `name`: Exercise name (editable inline).
- `sets`: Planned sets (editable inline).
- `reps`: Planned reps (editable inline).
- `weight`: Planned weight in lbs (editable inline).
