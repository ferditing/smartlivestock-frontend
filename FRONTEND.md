# SmartLivestock Connect – Frontend

This repository contains the **React + TypeScript frontend** for the SmartLivestock Connect system.  
It provides role-based dashboards for **Farmers, Veterinarians, and Agro-vets**, and integrates with the backend API and ML service.

---

## 🚀 Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS v3
- React Router DOM
- Axios
- Leaflet (Geo-location maps)

---

## 🧩 Features

### Farmer Dashboard
- View nearby veterinarians and agrovets on a map (GPS-based)
- Submit animal symptom reports
- View service availability

### Veterinarian Dashboard
- View incoming disease cases
- Inspect animal details and reported symptoms
- Respond to farmer requests

### Agro-vet Dashboard
- Manage product catalog (drugs, feeds, vaccines)
- Publish products for farmers to view

---

## 📂 Project Structure

```txt
src/
├── api/              # API clients
├── auth/             # Role-based route protection
├── dashboards/       # Farmer, Vet, Agro dashboards
├── pages/            # Login & Register
├── components/       # Shared UI components
├── App.tsx
└── main.tsx
🔧 Setup Instructions
1. Install dependencies
bash
Copy code
npm install
2. Configure API base URL
Edit:

ts
Copy code
src/api/axios.ts
ts
Copy code
baseURL: "http://localhost:4000/api"
3. Run development server
bash
Copy code
npm run dev
Open:

bash
Copy code
http://localhost:5173/login
🔐 Authentication
JWT-based authentication

User roles:

farmer

vet

agro

Role is stored in localStorage and enforced via route guards

🌍 Geo-location
Uses browser GPS (navigator.geolocation)

Displays nearby services using Leaflet + OpenStreetMap

Data fetched from backend /services/nearby endpoint

📦 Deployment Notes
Build command:

bash
Copy code
npm run build
Output directory: dist/

Can be deployed to:

Netlify

Vercel

GitHub Pages (with configuration)

📌 Related Repositories

Backend API: smartlivestock-backend

ML Service: smartlivestock-ml-service