# Healthcare Appointment System 🏥

A full-stack web application designed to streamline medical appointments. This system allows **Patients** to find hospitals and book slots, and **Doctors** to manage their schedules and profiles.

## ✨ Features

- **User Authentication**: Secure Login and Registration for both Doctors and Patients.
- **Doctor Dashboard**: Manage appointment slots (Create, Edit, Delete).
- **Patient Dashboard**:
  - Browse hospitals and doctors.
  - View available time slots.
  - Book and manage personal appointments.
- **Profile Management**: Update professional (Doctor) or personal (Patient) information.
- **Hospital Directory**: View detailed hospital profiles and their associated doctors.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router, Axios.
- **Backend**: Django, Django REST Framework.
- **Database**: MySQL.
- **Authentication**: JWT (JSON Web Tokens).

## 🚀 Getting Started

To run this project locally, follow these simple steps:

### 1. Prerequisites
- Python installed
- Node.js installed
- MySQL installed and running

### 2. Backend Setup (Django)
1. Navigate to the backend folder: `cd backend`
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Run migrations: `python manage.py migrate`
4. Start the server: `python manage.py runserver`

### 3. Frontend Setup (React)
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## 👤 Author

- **Luffy Dev** - [luffy-dev24](https://github.com/luffy-dev24)

---
*Developed as a part of my healthcare appointment system project.*
