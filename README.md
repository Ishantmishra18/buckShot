# 🎰 Buckshot Roulette - Real-time Multiplayer Luck & Strategy Game

![Socket.IO](https://img.shields.io/badge/Socket.IO-RealTime-blue)
![MERN Stack](https://img.shields.io/badge/MERN-FullStack-green)
![Live](https://img.shields.io/badge/Live-Online-brightgreen)

**Buckshot Roulette** is a high-stakes online multiplayer game built using the MERN stack and Socket.IO. It's a deadly game of chance and strategy where players take turns firing a shotgun at themselves or their opponent, not knowing whether the next chamber is loaded or empty.

---

## 🚀 Live Demo

- 🔗 **Frontend**: [https://buckshot-1-frontend.onrender.com](https://buckshot-1-frontend.onrender.com)  


---

## 🕹️ How to Play

1. **Start the game**: random player being assinged as your opponent.
2. **Bullet Preview**: At the start of each round, see the bullet sequence briefly

3. **Take Your Shot**:

🔫 Shoot Yourself: Risk a life - empty chamber keeps your turn

🎯 Shoot Opponent: Try to take their life - but you lose your turn either way

4.**Survive**: Last player standing wins!

📋 Game instructions and rules are displayed on the homepage of the application.

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO Server
- **Database**: MongoDB Atlas
- **Hosting**: Render

---

## 📦 Installation (For Local Development)

### ⚙️ Prerequisites

- Node.js and npm installed
- MongoDB running locally or via Atlas
- Git installed

---

### 🔧 Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/Ishantmishra18/buckShot.git
cd buckShot

# 2. Run Backend
cd server
npm install
npx nodemon server.js

# (in a new terminal)
# 3. Run Frontend
cd client
npm install
npm run dev
