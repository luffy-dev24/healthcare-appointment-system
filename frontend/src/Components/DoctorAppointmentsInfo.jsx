import React from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAppointmentsContext } from './DoctorAppointmentsComponent';
import { MyContext } from '../App';
import axios from 'axios';


function DoctorAppointmentsInfo(){
    let [appointments, setAppointments] = useContext(doctorAppointmentsContext);
    let [, , RefreshTokenFunction]      = useContext(MyContext);
    let navigate = useNavigate();

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    // get status badge class
    const getStatusClass = (status) => {
        if(status === 'open')   return 'slot-status-open';
        if(status === 'full')   return 'slot-status-full';
        if(status === 'closed') return 'slot-status-closed';
    }

    let book_appointment = async (appointment_id) => {
        let user_id    = localStorage.getItem("user_ID");
        let user_email = localStorage.getItem("email");

        console.log("Booking appointment:", { user_id, user_email, appointment_id });

        let inputData = {
            user_id:        user_id,
            email:          user_email,
            appointment_id: appointment_id
        }

        let booking_url = "http://127.0.0.1:8000/appointments/bookings/";

        // helper to send the POST with a given token
        const sendRequest = (token) =>
            axios.post(booking_url, inputData, {
                headers: { Authorization: `Bearer ${token}` }
            });

        try{
            let response = await sendRequest(localStorage.getItem("access_token"));
            console.log("Booking response:", response);
            navigate('/main/booking-status', {
                state: { status: "success", booking: response.data }
            });

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await sendRequest(newToken);
                    console.log("Booking response:", retryResponse);
                    navigate('/main/booking-status', {
                        state: { status: "success", booking: retryResponse.data }
                    });
                }catch(retryError){
                    console.log("Error booking appointment:", retryError.response);
                    navigate('/main/booking-status', {
                        state: { status: "failed", message: retryError.response?.data }
                    });
                }
            } else {
                console.log("Error booking appointment:", error.response);
                navigate('/main/booking-status', {
                    state: { status: "failed", message: error.response?.data }
                });
            }
        }
    }

    // empty state
    if(appointments.length === 0){
        return(
            <div className="appointments-empty">
                <p className="appointments-empty-title">No Appointments</p>
                <p className="appointments-empty-text">This doctor has no available appointments.</p>
            </div>
        )
    }

    // group all slots under one doctor card
    // since all appointments belong to same doctor
    const first = appointments[0];
    console.log(first)

    return(
        <div className="doctor-appointments-card">

            {/* doctor header */}
            <div className="doctor-appointments-header">
                {first.doctor_image ? (
                    <img
                        src={first.doctor_image}
                        alt={first.doctor_name}
                        className="doctor-appointments-avatar"
                    />
                ) : (
                    <div className="doctor-appointments-avatar-placeholder">👨‍⚕️</div>
                )}
                <div>
                    <p className="doctor-appointments-name">Dr. {first.doctor_name}</p>
                    <p className="doctor-appointments-spec">{first.doctor_specialization}</p>
                </div>
            </div>

            {/* hospital info */}
            <div className="doctor-appointments-hospital">
                <div className="hospital-info-item">
                    <span className="hospital-info-label">Clinic</span>
                    <span className="hospital-info-value">{first.hospital_name}</span>
                </div>
                <div className="hospital-info-item">
                    <span className="hospital-info-label">City</span>
                    <span className="hospital-info-value">{first.hospital_city}</span>
                </div>
                <div className="hospital-info-item">
                    <span className="hospital-info-label">Phone</span>
                    <span className="hospital-info-value">{first.hospital_phone}</span>
                </div>
                <div className="hospital-info-item">
                    <span className="hospital-info-label">Address</span>
                    <span className="hospital-info-value">{first.hospital_address}</span>
                </div>
            </div>

            {/* appointment slots grid */}
            <div className="appointment-slots-grid">
                {appointments.map((appointment) => (
                    <div key={appointment.id} className="appointment-slot-card">

                        <div className="appointment-slot-top">
                            <span className="appointment-slot-date">{appointment.date}</span>
                            <span className={getStatusClass(appointment.status)}>
                                {appointment.status}
                            </span>
                        </div>

                        <div className="appointment-slot-info">
                            <div className="slot-info-item">
                                <span className="slot-info-label">Time</span>
                                <span className="slot-info-value">
                                    {appointment.start_time} - {appointment.end_time}
                                </span>
                            </div>
                            <div className="slot-info-item">
                                <span className="slot-info-label">Slots</span>
                                <span className="slot-info-value">
                                    {appointment.booked_count} / {appointment.total_slots}
                                </span>
                            </div>
                        </div>

                        {appointment.status === "open" ? (
                            <button
                                onClick={() => book_appointment(appointment.id)}
                                className="slot-book-btn"
                            >
                                → Book Now
                            </button>
                        ) : (
                            <div className="slot-unavailable">Not Available</div>
                        )}

                    </div>
                ))}
            </div>

        </div>
    );
}

export default DoctorAppointmentsInfo;