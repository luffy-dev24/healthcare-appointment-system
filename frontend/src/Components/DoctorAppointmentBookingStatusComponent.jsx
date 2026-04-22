import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../Css/DoctorAppointmentBookingStatusComponent.css";

function DoctorAppointmentBookingstatusComponent() {
    const location       = useLocation();
    const navigate       = useNavigate();
    let booking_status   = location.state?.status;
    const message        = location.state?.message;
    const booking        = location.state?.booking;

    // success state
    if(booking_status === "success"){
        return (
            <div className="booking-status-page">
                <div className={`booking-status-card booking-status-card-success`}>

                    <span className="booking-status-icon">✅</span>
                    <h2 className="booking-status-title">Booking<br/>Confirmed!</h2>

                    <div className="booking-status-details">
                        <div className="booking-status-row">
                            <span className="booking-status-label">Doctor</span>
                            <span className="booking-status-value">{booking.doctor_name}</span>
                        </div>
                        <div className="booking-status-row">
                            <span className="booking-status-label">Date</span>
                            <span className="booking-status-value">{booking.appointment_date}</span>
                        </div>
                        <div className="booking-status-row">
                            <span className="booking-status-label">Time Window</span>
                            <span className="booking-status-value">{booking.appointment_window}</span>
                        </div>
                        <div className="booking-status-row">
                            <span className="booking-status-label">Token Number</span>
                            <span className="booking-status-token">{booking.token_number}</span>
                        </div>
                        <div className="booking-status-row">
                            <span className="booking-status-label">Booked At</span>
                            <span className="booking-status-value">
                                {new Date(booking.booked_at).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/main/doctors')}
                        className="booking-status-btn"
                    >
                        → Go to Home
                    </button>

                </div>
            </div>
        )
    }

    // failed state
    return (
        <div className="booking-status-page">
            <div className={`booking-status-card booking-status-card-failed`}>

                <span className="booking-status-icon">❌</span>
                <h2 className="booking-status-title">Booking<br/>Failed!</h2>

                <p className="booking-status-error">
                    { message ? Object.values(message).flat().join(' ') : "Something went wrong." }
                </p>

                <button
                    onClick={() => navigate(-1)}
                    className="booking-status-btn-outline"
                >
                    ← Go Back & Try Again
                </button>

            </div>
        </div>
    );
}

export default DoctorAppointmentBookingstatusComponent;