# Movie Ticket System (MERN Stack)

A movie booking and ticket management system built with the MERN stack (MongoDB, Express.js, React, Node.js).

---
## Features

- Browse a catalog of movies (fetched from **TMDB API**).
- Select showtimes and seats.
- Secure login and registration using **Clerk**.
- Book tickets and manage reservations.
- Online payments powered by **Stripe**.
- Email confirmations via **Brevo**.
- Event-driven workflows using **Inngest** (e.g., notifications).
- Admin panel for managing movies, shows, and bookings.
- Responsive and user-friendly UI.

---

## Tech Stack

| Layer              | Technology                          |
|--------------------|-------------------------------------|
| Frontend           | React, Tailwind CSS                 |
| Backend            | Node.js, Express                    |
| Database           | MongoDB Atlas                       |
| Authentication     | Clerk                               |
| Email/Notifications| Brevo (Transactional Emails), Inngest (Event-driven Functions) |
| Payments           | Stripe (Checkout & Webhooks)        |
| Movie Data API     | TMDB (The Movie Database API)       |
| Hosting            | Vercel (Frontend + Backend)         |

---

## Live Demo

🎬 [**CinemaSnap – Live Ticket Booking App**](https://cinemasnap.vercel.app)

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v16 or newer recommended)
- npm or yarn
- MongoDB Atlas account (or local MongoDB setup)

---

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/Umer-Jahangir/Movie_Ticket_System_MERN.git
   cd Movie_Ticket_System_MERN


2. Install dependencies for both server and client:
   ```bash
   cd  client
   npm install
   
   cd server
   npm install
   ```
3. Configuration / Environment Variables
   
   Client (.env):
   
   ```bash
   VITE_CURRENCY = '$' (same)
   VITE_CLERK_PUBLISHABLE_KEY = .......
   VITE_BASE_URL = http://localhost:3000 (same or your port)
   VITE_TMDB_IMAGE_BASE_URL = https://image.tmdb.org/t/p/original
   ```
   
   Server (.env):
   
   ```bash
   MONGODB_URI:add your key for mongo db
   
   CLERK_PUBLISHABLE_KEY: your key for clerk
   CLERK_SECRET_KEY: .....

   INNGEST_EVENT_KEY: ...
   INNGEST_SIGNING_KEY: ...

   TMDB_API_KEY:...

   STRIPE_PUBLISHABLE_KEY = .......
   STRIPE_SECRET_KEY = ......
   STRIPE_WEBHOOK_SECRET = .....

   SENDER_EMAIL = your brevo login (email )
   SMTP_USER = your brevo key 
   SMTP_PASS = ...
   ```
   
4.`Deploy on Vercel through github`


5. Running the Project
      
      ```bash
      # In one terminal
      cd server
      npm run server   

      # In another terminal
      cd client
      npm run dev
      ```
---
### Folder Structure

```text
.
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── ...
│   └── vercel.json
│
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── inngest/
│   ├── middleware/
│   ├── server.js
│   └── vercel.json
│   └── ...
│
├── .gitignore
└── README.md

  ```
---

### Contributing

- Fork the repo.

- Create a feature branch: git checkout -b feature/YourFeature

- Commit your changes: git commit -m 'Add some feature'

- Push to your branch: git push origin feature/YourFeature

- Open a Pull Request—I'll review it!

- Please follow standard Git conventions and maintain consistent coding style
  
- ## Need Help:

  - [Resource](https://www.youtube.com/watch?v=Pez37wmUaQM)

---

### License

Distributed under the MIT License. See `LICENSE` for details.

---
## Contact

- **Author**: Umer Jahangir  
- **GitHub**: [@Umer-Jahangir](https://github.com/Umer-Jahangir)  
- **Live App**: [CinemaSnap](https://cinemasnap.vercel.app)  
</br>
