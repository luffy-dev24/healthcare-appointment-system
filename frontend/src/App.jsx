import RegisterComponent from './Components/RegisterComponent';
import LoginComponent from './Components/LoginComponent';
import MainLayout from './Components/MainLayout';
import DoctorProfileComponent from './Components/DoctorProfileComponent';
import PatientProfileComponent from './Components/PatientProfileComponent';
import CreateApointmentComponent from './Components/CreateAppointmentComponent';
import DeleteAppointmentComponent from './Components/DeleteAppointmentComponent';
import DoctorAppointmentsComponent from './Components/DoctorAppointmentsComponent';
import ManageAppointmentComponent from './Components/ManageAppointmentComponent';
import DoctorMenuComponent from './Components/DoctorMenuComponent';
import EditAppointmentComponent from './Components/EditAppointmentComponent';
import EditDoctorProfileComponent from './Components/EditDoctorProfileComponent';
import EditPatientProfileComponent from './Components/EditPatientProfileComponent';
import HospitalComponent from './Components/HospitalComponent';
import SlotBookingsComponent from './Components/Slotbookingscomponent';
import HospitalsListComponent from './Components/HospitalsListComponent';
import HospitalDetailComponent from './Components/HospitalDetailComponent';
import BookingsOfPatientComponent from './Components/BookingsOfPatientComponent';
import DoctorAppointmentBookingstatusComponent from './Components/DoctorAppointmentBookingStatusComponent';
import ViewDoctors from './Components/ViewDoctors';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
import { createContext } from 'react';


export const MyContext = createContext();


function App() {
  const [userLogin, setUserLogin] = useState(false);

  // refresh token function
  const RefreshTokenFunction = async () => {
    try {
      const refresh_token = localStorage.getItem("refreshToken");

      const response = await axios.post(
        "http://127.0.0.1:8000/users/refresh/",
        { refresh: refresh_token }
      );

      localStorage.setItem("access_token", response.data.access);
      return response.data.access;

    } catch (err) {
      localStorage.clear();
      navigate("/login");
      return null;
    }
  };

  return (
    <div>
      <MyContext.Provider value={[ userLogin, setUserLogin , RefreshTokenFunction ]}>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterComponent />} />
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/main" element={<MainLayout />} />
          <Route path="/doctor-profile/:pk" element={<DoctorProfileComponent />} />
          <Route path="/patient-profile/:pk" element={<PatientProfileComponent />} />

          <Route path="/doctor-edit-profile/:pk" element={<EditDoctorProfileComponent />} />
          <Route path="/patient-edit-profile/:pk" element={<EditPatientProfileComponent />} />

          <Route path='/hospital-profile/:pk' element={<HospitalComponent />} />

          <Route path="/main" element={<MainLayout />}>
            
            <Route path="doctors" element={<ViewDoctors />} />
            <Route path="doctor-appointments/:user_id" element={<DoctorAppointmentsComponent />} />

            <Route path='booking-status/' element={<DoctorAppointmentBookingstatusComponent />} />


            <Route path="doctor-menu" element={<DoctorMenuComponent />} />
            <Route path="create-appointments" element={<CreateApointmentComponent/>} />
            <Route path="doctor-manage-appointments" element={<ManageAppointmentComponent />} />
            <Route path="doctor-edit-appointment/:appointment_id" element={<EditAppointmentComponent />} />
            <Route path="doctor-delete-appointment/:appointment_id" element={<DeleteAppointmentComponent />} />
            <Route path="slot-bookings/:slot_id" element={<SlotBookingsComponent/>}/>


            <Route path="hospitals" element={<HospitalsListComponent/>}/>
            <Route path="/main/hospital-detail/:hospital_id" element={<HospitalDetailComponent />} />
            <Route path="patient-appointments" element={<BookingsOfPatientComponent/>}/>
            
          </Route>
        </Routes>
      </BrowserRouter>
      </MyContext.Provider>
    </div>
  )
}

export default App
