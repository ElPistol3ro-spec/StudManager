# StudManager
**StudManager**
- A role-based Student & Academic Records Managemnt System 

---
## Features
### Authentication $ Role-Based Access
* **Institutional Email Sign-In:** Role-based login (`admin` and `student`)
* **First-Time Student Password Setup:** New students registered by the administrator can set their own unique passwords.
* **Social OAuth Authentication:** Support Google and GitHub sign-in.

### Administrator Dashboard
* **Student Directory Management:** Register new students with auto-generated registration IDs, academic programs, and year levels.
* **Course & Enrollment Management:** View all acative courses, enroll students into courses and record grades.
* **Academic Transcripts:** View and manage academic performance.

### Student Dashboard
* **Assigned Courses View:** Displays only the courses logged-in student is enrollled in.
* **Academic Transcripts:** Allows students to view their academic performance

---

## Tech Stack

* **Frontend:** React, Tailwind CSS, Lucide Icons, JavaScript
* **Backend:** JSON Server, (`db-json`)
* **Build & Deployment:** Vite, GitHub Pages (`gh-pages`)

## Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/ElPistol3ro-spec/StudManager.git
   cd StudManager
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the JSON Server backend:**
   ```bash
   npx json-server --watch db.json --port 4000
   ```
4. **Start the Vite development server:**
   ```bash
   npm run dev
   ```

## Running Tests & Coverage

```bash
# Run all tests
npx vitest run

# Run tests with code coverage report
npx vitest run --coverage
```

---

## Deployment

Deploy updates to GitHub Pages using:

```bash
npm run deploy
```

---

## Live Demo Link

View the live deployed appliaction:
[https://elpistol3ro-spec.github.io/StudManager/]

----

