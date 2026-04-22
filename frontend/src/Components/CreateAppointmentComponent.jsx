import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MyContext } from '../App';
import { useContext } from 'react';
import axios from 'axios';
import "../Css/CreateAppointmentComponent.css";

function CreateAppointmentComponent() {
    let [userLogin]            = useContext(MyContext);
    let [, , RefreshTokenFunction] = useContext(MyContext);
    let navigate    = useNavigate();
    let user_id     = localStorage.getItem("user_ID");
    let email       = localStorage.getItem("email");

    // refs for input fields
    const dateRef       = useRef(null);
    const startTimeRef  = useRef(null);
    const endTimeRef    = useRef(null);
    const totalSlotsRef = useRef(null);

    // error, success, loading states
    const [error,   setError]   = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
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

        // helper to send the POST with a given token
        const sendRequest = (token) =>
            axios.post(
                'http://127.0.0.1:8000/appointments/slots/',
                inputData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

        // clear fields after success
        const clearFields = () => {
            dateRef.current.value       = '';
            startTimeRef.current.value  = '';
            endTimeRef.current.value    = '';
            totalSlotsRef.current.value = '';
        }

        setLoading(true);
        try{
            let response = await sendRequest(localStorage.getItem("access_token"));
            console.log("Slot opened successfully:", response);
            setSuccess('Slot opened successfully!');
            clearFields();
            navigate("/main/doctor-manage-appointments");

        }catch(err){
            if(err.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await sendRequest(newToken);
                    console.log("Slot opened successfully:", retryResponse);
                    setSuccess('Slot opened successfully!');
                    clearFields();
                    navigate("/main/doctor-manage-appointments");
                }catch(retryErr){
                    const data = retryErr.response?.data;
                    if(data){
                        setError(Object.values(data).flat().join(' '));
                    } else {
                        setError("Something went wrong. Please try again.");
                    }
                }
            } else {
                // showing backend error properly
                const data = err.response?.data;
                if(data){
                    setError(Object.values(data).flat().join(' '));
                } else {
                    setError("Something went wrong. Please try again.");
                }
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if(!userLogin){
            navigate("/login");
        }
    }, [userLogin, navigate]);

    return (
        <div className="create-appointment-page">
            <div className="create-appointment-card">

                <span className="create-appointment-tag">Doctor Portal</span>

                <h2 className="create-appointment-title">
                    OPEN<br/>APPOINTMENT<br/>SLOT
                </h2>

                {error   && <p className="create-appointment-error">{error}</p>}
                {success && <p className="create-appointment-success">{success}</p>}

                <form onSubmit={handleSubmit}>

                    <label className="create-appointment-label">
                        Date
                        <input
                            type="date"
                            ref={dateRef}
                            className="create-appointment-input"
                            required
                        />
                    </label>

                    <label className="create-appointment-label">
                        Start Time
                        <input
                            type="time"
                            ref={startTimeRef}
                            className="create-appointment-input"
                            required
                        />
                    </label>

                    <label className="create-appointment-label">
                        End Time
                        <input
                            type="time"
                            ref={endTimeRef}
                            className="create-appointment-input"
                            required
                        />
                    </label>

                    <label className="create-appointment-label">
                        Total Slots
                        <input
                            type="number"
                            ref={totalSlotsRef}
                            className="create-appointment-input"
                            required
                            min="1"
                            placeholder="e.g. 20"
                        />
                    </label>

                    <button
                        type="submit"
                        className="create-appointment-btn"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : '→ Open Slot'}
                    </button>

                    <button
                        type="button"
                        className="create-appointment-btn-outline"
                        onClick={() => navigate("/main/doctor-menu")}
                    >
                        ← Go to Menu
                    </button>

                </form>

            </div>
        </div>
    );
}

export default CreateAppointmentComponent;