import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MyContext } from "../App";
import "../Css/DeleteAppointmentComponent.css";


function DeleteAppointmentComponent(){
    let { appointment_id } = useParams();
    let navigate = useNavigate();

    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);

    // getting refresh token function from context
    const [, , RefreshTokenFunction] = useContext(MyContext);

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    let delete_this_appointment = async () => {
        setError('');
        setLoading(true);

        // helper to send the DELETE with a given token
        const sendRequest = (token) =>
            axios.delete(
                "http://127.0.0.1:8000/appointments/slots/" + appointment_id + "/",
                { headers: { Authorization: `Bearer ${token}` } }
            );

        try{
            let response = await sendRequest(localStorage.getItem("access_token"));
            console.log(response);
            navigate("/main/doctor-manage-appointments");

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await sendRequest(newToken);
                    console.log(retryResponse);
                    navigate("/main/doctor-manage-appointments");
                }catch(retryError){
                    const data = retryError.response?.data;
                    if(data){
                        setError(Object.values(data).flat().join(' '));
                    } else {
                        setError("Something went wrong. Please try again.");
                    }
                }
            } else {
                const data = error.response?.data;
                if(data){
                    setError(Object.values(data).flat().join(' '));
                } else {
                    setError("Something went wrong. Please try again.");
                }
            }
        }
        setLoading(false);
    }

    let cancel_delete = () => {
        navigate("/main/doctor-manage-appointments");
    }

    return (
        <div className="delete-appointment-page">
            <div className="delete-appointment-card">

                <span className="delete-appointment-icon">⚠️</span>

                <h1 className="delete-appointment-title">
                    Delete This<br/>Appointment?
                </h1>

                <p className="delete-appointment-subtitle">
                    This action cannot be undone. The appointment slot
                    and all related bookings will be permanently removed.
                </p>

                {error && <p className="delete-appointment-error">{error}</p>}

                <div className="delete-appointment-buttons">
                    <button
                        onClick={delete_this_appointment}
                        className="delete-appointment-btn-confirm"
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : '→ Yes, Delete'}
                    </button>
                    <button
                        onClick={cancel_delete}
                        className="delete-appointment-btn-cancel"
                    >
                        ← Cancel
                    </button>
                </div>

            </div>
        </div>
    );
}

export default DeleteAppointmentComponent;