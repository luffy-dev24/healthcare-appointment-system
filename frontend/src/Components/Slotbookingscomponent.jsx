import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MyContext } from '../App';
import "../Css/SlotBookingsComponent.css";


function SlotBookingsComponent(){
    let { slot_id } = useParams();
    let navigate    = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [error,    setError]    = useState('');

    // getting refresh token function from context
    const [, , RefreshTokenFunction] = useContext(MyContext);

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    const fetchBookings = async () => {
        try{
            let response = await axios.get(
                "http://127.0.0.1:8000/appointments/slots/" + slot_id + "/bookings/",
                { headers: authHeader() }
            );
            setBookings(response.data);
            console.log("Bookings:", response.data);

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await axios.get(
                        "http://127.0.0.1:8000/appointments/slots/" + slot_id + "/bookings/",
                        { headers: { Authorization: `Bearer ${newToken}` } }
                    );
                    setBookings(retryResponse.data);
                    console.log("Bookings:", retryResponse.data);
                }catch(retryError){
                    setError("Failed to load bookings. Please try again.");
                    console.log(retryError.response);
                }
            } else {
                setError("Failed to load bookings. Please try again.");
                console.log(error.response);
            }
        }
    }

    useEffect(()=>{
        fetchBookings();
    },[]);

    return(
        <div className="slot-bookings-page">

            <div className="slot-bookings-topbar">
                <div className="slot-bookings-topbar-left">
                    <span className="slot-bookings-tag">Doctor Portal</span>
                    <h1 className="slot-bookings-title">Slot Bookings</h1>
                </div>
                <button
                    className="slot-bookings-back-btn"
                    onClick={() => navigate("/main/doctor-manage-appointments")}
                >
                    ← Back
                </button>
            </div>

            {error && <p className="slot-bookings-error">{error}</p>}

            {/* empty state */}
            {bookings.length === 0 && !error ? (
                <div className="slot-bookings-empty">
                    <p className="slot-bookings-empty-title">No Bookings Yet</p>
                    <p className="slot-bookings-empty-text">No patients have booked this slot yet.</p>
                </div>
            ) : (
                <div className="slot-bookings-list">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="slot-booking-card">

                            {/* patient pic */}
                            <div className="slot-booking-avatar-wrap">
                                {booking.patient_pic ? (
                                    <img
                                        src={booking.patient_pic}
                                        alt={booking.patient_name}
                                        className="slot-booking-avatar"
                                    />
                                ) : (
                                    <div className="slot-booking-avatar-placeholder">👤</div>
                                )}
                            </div>

                            {/* patient + booking details */}
                            <div className="slot-booking-info">

                                <div className="slot-booking-header">
                                    <p className="slot-booking-name">{booking.patient_name}</p>
                                    <span className="slot-booking-token">Token #{booking.token_number}</span>
                                </div>

                                <div className="slot-booking-details">
                                    <div className="slot-booking-item">
                                        <span className="slot-booking-label">Email</span>
                                        <span className="slot-booking-value">{booking.patient_email}</span>
                                    </div>
                                    <div className="slot-booking-item">
                                        <span className="slot-booking-label">Age</span>
                                        <span className="slot-booking-value">{booking.patient_age} years</span>
                                    </div>
                                    <div className="slot-booking-item">
                                        <span className="slot-booking-label">Date</span>
                                        <span className="slot-booking-value">{booking.appointment_date}</span>
                                    </div>
                                    <div className="slot-booking-item">
                                        <span className="slot-booking-label">Time</span>
                                        <span className="slot-booking-value">{booking.appointment_window}</span>
                                    </div>
                                    <div className="slot-booking-item">
                                        <span className="slot-booking-label">Booked At</span>
                                        <span className="slot-booking-value">
                                            {new Date(booking.booked_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default SlotBookingsComponent;