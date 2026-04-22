import React, { useState, useEffect, createContext } from 'react';
import { useContext } from 'react';
import { MyContext } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DoctorAppointmentsInfo from './DoctorAppointmentsInfo';
import "../Css/DoctorAppointmentsInfo.css";

export const doctorAppointmentsContext = createContext();

function DoctorAppointmentsComponent() {
    const { user_id }                     = useParams();
    const [appointments, setAppointments] = useState([]);
    const navigate                        = useNavigate();

    // getting refresh token function from context
    let [, , RefreshTokenFunction] = useContext(MyContext);

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/appointments/doctors-appointments/" + user_id + "/",
                    { headers: authHeader() }
                );
                setAppointments(response.data);
                console.log("Doctor's Appointments:", response.data);

            } catch (error) {
                if(error.response?.status === 401){
                    // access token expired — refresh and retry once
                    const newToken = await RefreshTokenFunction();
                    if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                    try{
                        const retryResponse = await axios.get(
                            "http://127.0.0.1:8000/appointments/doctors-appointments/" + user_id + "/",
                            { headers: { Authorization: `Bearer ${newToken}` } }
                        );
                        setAppointments(retryResponse.data);
                        console.log("Doctor's Appointments:", retryResponse.data);
                    }catch(retryError){
                        console.log("Error fetching appointments:", retryError.response);
                    }
                } else {
                    console.log("Error fetching appointments:", error.response);
                }
            }
        };
        fetchAppointments();
    }, [user_id]);

    return (
        <div className="appointments-page">

            <div className="appointments-topbar">
                <h1 className="appointments-title">BOOK AN<br/>APPOINTMENT</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="appointments-tag">Patient Portal</span>
                    <button
                        className="manage-topbar-btn-outline"
                        onClick={() => navigate("/main/doctors")}
                    >
                        ← Go to Home
                    </button>
                </div>
            </div>

            <doctorAppointmentsContext.Provider value={[appointments, setAppointments]}>
                <DoctorAppointmentsInfo/>
            </doctorAppointmentsContext.Provider>

        </div>
    );
}

export default DoctorAppointmentsComponent;