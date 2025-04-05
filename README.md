# ⚔️ HectoClash

**HectoClash** is an interactive, real-time mental math duel platform where players go head-to-head solving Hectoc puzzles under time constraints. Inspired by the Hectoc game developed by Yusnier Viera, this application combines the thrill of competition with the challenge of mental calculation.

## 🎯 Objective

Given a six-digit sequence (each digit from 1 to 9), players must insert mathematical operations—such as `+`, `-`, `×`, `÷`, `^`, and parentheses—between the digits in their original order to form an expression that evaluates to **100**.

> Example: `123456` → `1 + (2 + 3 + 4) × (5 + 6) = 100`

---

## 🚀 Features

- **🧠 Real-Time Duels:** Challenge other players to live, timed Hectoc battles.
- **🔀 Dynamic Puzzle Generation:** Every duel gets a unique, randomly generated six-digit sequence.
- **🏆 Leaderboards & Rankings:** Compete for the top spot with performance-based rankings.
- **🎯 Accuracy + Speed Matters:** Score points based on both correctness and how quickly you solve the puzzle.

---

## 🛠️ Tech Stack

**Frontend:**  
- React (Vite or Create React App)  
- Socket.IO (for real-time communication)  
- TailwindCSS (for styling, optional)

**Backend:**  
- Node.js  
- Express.js  
- Socket.IO  
- MongoDB (for user data, duels, and leaderboards)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hectoclash.git
cd hectoclash
```

### 2. Setup backend
```bash
cd server
npm install
```

Create a ``.env`` file in the ``/server`` directory:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hectoclash
```

Start the backend server:
```bash
npm start
```

### 3. Setup frontend
```bash
cd ../client
npm install
```

Start the React frontend:

```
npm run dev
```
