# MongoDB Log Analyzer 📊

This Node.js script helps you analyze MongoDB logs by:

- ✅ Counting successful user logins
- 🌐 Identifying top 5 IP addresses with most logins
- 🐢 Extracting and exporting slow queries (over 1 second) to a CSV file

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/DhirenkumarR/mongodb-log-analyzer.git
cd mongodb-log-analyzer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Prepare Your Log File

- Rename your MongoDB log file to: `MONGODB.log`
- Place the file in the **root directory** of this project (same folder as `index.js`)

### 4. Run the Script
```bash
npm start
```

---

## 📁 Output

- A CSV file named `slow_queries.csv` will be generated with:
  - `timestamp`
  - `durationMillis`
  - `nreturned`
  - `docsExamined`
  - `command`

---

## 📦 Dependencies

- [cli-progress](https://www.npmjs.com/package/cli-progress) — for terminal progress bar

---

## 📌 Note

- Only log entries with `"Authentication succeeded"` or `"Slow query"` are processed.
- Only slow queries with `durationMillis > 1000` (i.e., > 1s) are written to CSV.

---

## 🛠 Author

Made with ❤️ by [Dhirenkumar Rathod](https://github.com/DhirenkumarR)