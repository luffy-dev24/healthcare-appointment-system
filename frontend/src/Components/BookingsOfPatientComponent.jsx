import React from "react";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { MyContext } from "../App";
import { useNavigate } from "react-router-dom";
import "../Css/BookingsOfPatientComponent.css";


function BookingsOfPatientComponent() {

    const [userLogin, , RefreshTokenFunction] = useContext(MyContext);
    const [bookings,      setBookings]      = useState([]);
    const [error,         setError]         = useState('');
    const [loading,       setLoading]       = useState(true);
    const [cancellingId,  setCancellingId]  = useState(null); // tracks which booking is being cancelled
    const [confirmId,     setConfirmId]     = useState(null); // tracks which booking is showing confirm dialog
    const navigate = useNavigate();

    const user_id = localStorage.getItem("user_ID");

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    const fetchBookings = async () => {
        setLoading(true);
        try{
            let response = await axios.get(
                "http://127.0.0.1:8000/appointments/patient-bookings/" + user_id + "/",
                { headers: authHeader() }
            );
            setBookings(response.data);
            console.log("Patient bookings:", response.data);

        }catch(error){
            if(error.response?.status === 401){
                const newToken = await RefreshTokenFunction();
                if(!newToken) return;

                try{
                    let retryResponse = await axios.get(
                        "http://127.0.0.1:8000/appointments/patient-bookings/" + user_id + "/",
                        { headers: { Authorization: `Bearer ${newToken}` } }
                    );
                    setBookings(retryResponse.data);
                    console.log("Patient bookings:", retryResponse.data);
                }catch(retryError){
                    setError("Failed to load bookings. Please try again.");
                    console.log(retryError.response);
                }
            } else {
                setError("Failed to load bookings. Please try again.");
                console.log(error.response);
            }
        }
        setLoading(false);
    }

    // cancel a booking by its id
    const cancelBooking = async (booking_id) => {
        setCancellingId(booking_id);
        setConfirmId(null);

        const sendRequest = (token) =>
            axios.delete(
                "http://127.0.0.1:8000/appointments/bookings/" + booking_id + "/",
                { headers: { Authorization: `Bearer ${token}` } }
            );

        try{
            await sendRequest(localStorage.getItem("access_token"));
            // remove the cancelled booking from state without refetching
            setBookings(prev => prev.filter(b => b.id !== booking_id));
            console.log("Booking cancelled:", booking_id);

        }catch(error){
            if(error.response?.status === 401){
                const newToken = await RefreshTokenFunction();
                if(!newToken) return;

                try{
                    await sendRequest(newToken);
                    setBookings(prev => prev.filter(b => b.id !== booking_id));
                    console.log("Booking cancelled:", booking_id);
                }catch(retryError){
                    setError("Failed to cancel booking. Please try again.");
                    console.log(retryError.response);
                }
            } else {
                setError("Failed to cancel booking. Please try again.");
                console.log(error.response);
            }
        }
        setCancellingId(null);
    }

    useEffect(() => {
        if(!userLogin){
            navigate("/login");
            return;
        }
        fetchBookings();
    }, []);

    if(loading){
        return(
            <div className="patient-bookings-page">
                <div className="patient-bookings-loading">
                    <p className="patient-bookings-loading-text">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-bookings-page">

            <div className="patient-bookings-topbar">
                <h1 className="patient-bookings-title">MY<br/>BOOKINGS</h1>
                <span className="patient-bookings-tag">Patient Portal</span>
            </div>

            {error && <p className="patient-bookings-error">{error}</p>}

            {/* empty state */}
            {bookings.length === 0 && !error ? (
                <div className="patient-bookings-empty">
                    <p className="patient-bookings-empty-title">No Bookings Yet</p>
                    <p className="patient-bookings-empty-text">You have not booked any appointments yet.</p>
                </div>
            ) : (
                <div className="patient-bookings-list">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="patient-booking-card">

                            {/* left: doctor avatar */}
                            <div className="patient-booking-avatar-wrap">
                                {booking.doctor_image ? (
                                    <img
                                        src={booking.doctor_image}
                                        alt={booking.doctor_name}
                                        className="patient-booking-avatar"
                                    />
                                ) : (
                                    <div className="patient-booking-avatar-placeholder">👨‍⚕️</div>
                                )}
                            </div>

                            {/* right: booking details */}
                            <div className="patient-booking-info">

                                {/* doctor + hospital header */}
                                <div className="patient-booking-header">
                                    <div>
                                        <p className="patient-booking-doctor-name">Dr. {booking.doctor_name}</p>
                                        <p className="patient-booking-specialization">{booking.doctor_specialization}</p>
                                    </div>
                                    <span className="patient-booking-token">Token #{booking.token_number}</span>
                                </div>

                                {/* hospital info */}
                                <div className="patient-booking-hospital">
                                    <span className="patient-booking-hospital-name">🏥 {booking.hospital_name}</span>
                                    <span className="patient-booking-hospital-city">{booking.hospital_city}</span>
                                </div>

                                {/* appointment details grid */}
                                <div className="patient-booking-details">
                                    <div className="patient-booking-item">
                                        <span className="patient-booking-label">Date</span>
                                        <span className="patient-booking-value">{booking.appointment_date}</span>
                                    </div>
                                    <div className="patient-booking-item">
                                        <span className="patient-booking-label">Time</span>
                                        <span className="patient-booking-value">{booking.appointment_window}</span>
                                    </div>
                                    <div className="patient-booking-item">
                                        <span className="patient-booking-label">Address</span>
                                        <span className="patient-booking-value">{booking.hospital_address}</span>
                                    </div>
                                    <div className="patient-booking-item">
                                        <span className="patient-booking-label">Phone</span>
                                        <span className="patient-booking-value">{booking.hospital_phone}</span>
                                    </div>
                                    <div className="patient-booking-item">
                                        <span className="patient-booking-label">Booked At</span>
                                        <span className="patient-booking-value">
                                            {new Date(booking.booked_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* cancel section */}
                                {confirmId === booking.id ? (
                                    // confirm dialog
                                    <div className="patient-booking-confirm">
                                        <p className="patient-booking-confirm-text">
                                            ⚠️ Are you sure you want to cancel this booking?
                                        </p>
                                        <div className="patient-booking-confirm-btns">
                                            <button
                                                className="patient-booking-confirm-yes"
                                                onClick={() => cancelBooking(booking.id)}
                                                disabled={cancellingId === booking.id}
                                            >
                                                {cancellingId === booking.id ? 'Cancelling...' : 'Yes, Cancel'}
                                            </button>
                                            <button
                                                className="patient-booking-confirm-no"
                                                onClick={() => setConfirmId(null)}
                                            >
                                                Keep Booking
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        className="patient-booking-cancel-btn"
                                        onClick={() => setConfirmId(booking.id)}
                                        disabled={cancellingId === booking.id}
                                    >
                                        ✕ Cancel Booking
                                    </button>
                                )}

                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default BookingsOfPatientComponent;