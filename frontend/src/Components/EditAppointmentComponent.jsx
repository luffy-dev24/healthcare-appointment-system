import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MyContext } from '../App';
import "../Css/EditAppointmentComponent.css";


function EditAppointmentComponent() {
    let { appointment_id } = useParams();
    let email   = localStorage.getItem("email");
    let user_id = localStorage.getItem("user_ID");
    let navigate = useNavigate();

    // getting refresh token function from context
    const [, , RefreshTokenFunction] = useContext(MyContext);

    // refs for input fields
    let dateRef       = useRef();
    let startTimeRef  = useRef();
    let endTimeRef    = useRef();
    let totalSlotsRef = useRef();

    // error, success, loading states
    const [error,   setError]   = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    // fills the form with data from the response
    const fillForm = (data) => {
        dateRef.current.value       = data.date;
        startTimeRef.current.value  = data.start_time;
        endTimeRef.current.value    = data.end_time;
        totalSlotsRef.current.value = data.total_slots;
    };

    // fetching appointment details to fill form
    // retries once with a fresh token if the first attempt returns 401
    let get_appointment_details = async () => {
        try{
            let response = await axios.get(
                "http://127.0.0.1:8000/appointments/slots/" + appointment_id + "/",
                { headers: authHeader() }
            );
            fillForm(response.data);

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await axios.get(
                        "http://127.0.0.1:8000/appointments/slots/" + appointment_id + "/",
                        { headers: { Authorization: `Bearer ${newToken}` } }
                    );
                    fillForm(retryResponse.data);
                }catch{
                    setError("Failed to load appointment details. Please refresh.");
                }
            } else {
                setError("Failed to load appointment details. Please refresh.");
            }
        }
    }

    // updating appointment
    let update_appointment = async () => {
        setError('');
        setSuccess('');

        // frontend validation
        if(!dateRef.current.value){
            return setError("Please select a date.");
        }
        if(!startTimeRef.current.value){
            return setError("Please select a start time.");
        }
        if(!endTimeRef.current.value){
            return setError("Please select an end time.");
        }
        if(!totalSlotsRef.current.value){
            return setError("Please enter total slots.");
        }
        if(startTimeRef.current.value >= endTimeRef.current.value){
            return setError("Start time must be before end time.");
        }

        let inputData = {
            date:        dateRef.current.value,
            start_time:  startTimeRef.current.value,
            end_time:    endTimeRef.current.value,
            total_slots: totalSlotsRef.current.value,
            user_id:     user_id,
            email:       email,
        }

        // helper to send the PUT with a given token
        const sendRequest = (token) =>
            axios.put(
                "http://127.0.0.1:8000/appointments/slots/" + appointment_id + "/",
                inputData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

        setLoading(true);
        try{
            let response = await sendRequest(localStorage.getItem("access_token"));
            console.log("Appointment updated successfully:", response.data);
            setSuccess("Appointment updated successfully!");
            navigate("/main/doctor-manage-appointments");

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await sendRequest(newToken);
                    console.log("Appointment updated successfully:", retryResponse.data);
                    setSuccess("Appointment updated successfully!");
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
                // showing backend error properly
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

    useEffect(()=>{
        get_appointment_details();
    }, []);

    return (
        <div className="edit-appointment-page">
            <div className="edit-appointment-card">

                <span className="edit-appointment-tag">Doctor Portal</span>

                <h2 className="edit-appointment-title">
                    EDIT<br/>APPOINTMENT
                </h2>

                {error   && <p className="edit-appointment-error">{error}</p>}
                {success && <p className="edit-appointment-success">{success}</p>}

                <label className="edit-appointment-label">
                    Date
                    <input
                        type="date"
                        ref={dateRef}
                        className="edit-appointment-input"
                    />
                </label>

                <label className="edit-appointment-label">
                    Start Time
                    <input
                        type="time"
                        ref={startTimeRef}
                        className="edit-appointment-input"
                    />
                </label>

                <label className="edit-appointment-label">
                    End Time
                    <input
                        type="time"
                        ref={endTimeRef}
                        className="edit-appointment-input"
                    />
                </label>

                <label className="edit-appointment-label">
                    Total Slots
                    <input
                        type="number"
                        ref={totalSlotsRef}
                        className="edit-appointment-input"
                        min="1"
                    />
                </label>

                <button
                    onClick={update_appointment}
                    className="edit-appointment-btn"
                    disabled={loading}
                >
                    {loading ? 'Updating...' : '→ Update Appointment'}
                </button>

                <button
                    type="button"
                    className="edit-appointment-btn-outline"
                    onClick={() => navigate("/main/doctor-manage-appointments")}
                >
                    ← Back to Appointments
                </button>

            </div>
        </div>
    );
}

export default EditAppointmentComponent;