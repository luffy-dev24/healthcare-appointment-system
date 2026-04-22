import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { MyContext } from '../App';
import ManageAppointmentInfo from './ManageAppointmentInfo';
import "../Css/ManageAppointmentComponent.css";


export const manageAppointmentsContext = createContext();


function ManageAppointmentComponent() {
    let user_id = localStorage.getItem("user_ID");
    let [appointments, setAppointments] = useState([]);
    let navigate = useNavigate();

    // getting refresh token function from context
    const [, , RefreshTokenFunction] = useContext(MyContext);

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    let getAppointments = async () => {
        try{
            let response = await axios.get(
                "http://127.0.0.1:8000/appointments/doctors-appointments/" + user_id + "/",
                { headers: authHeader() }
            );
            setAppointments(response.data);
            console.log("appointments", response.data);

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await axios.get(
                        "http://127.0.0.1:8000/appointments/doctors-appointments/" + user_id + "/",
                        { headers: { Authorization: `Bearer ${newToken}` } }
                    );
                    setAppointments(retryResponse.data);
                    console.log("appointments", retryResponse.data);
                }catch(retryError){
                    console.log(retryError.response);
                }
            } else {
                console.log(error.response);
            }
        }
    }

    useEffect(()=>{
        getAppointments();
    }, []);

    return (
        <div className="manage-wrapper">

            {/* top bar with title and buttons */}
            <div className="manage-topbar">
                <div className="manage-topbar-left">
                    <span className="manage-topbar-tag">Doctor Portal</span>
                    <h1 className="manage-topbar-title">Manage Appointments</h1>
                </div>

                <div className="manage-topbar-btns">
                    {/* go to menu button */}
                    <button
                        className="manage-topbar-btn-outline"
                        onClick={() => navigate("/main/doctor-menu")}
                    >
                        ← Go to Menu
                    </button>

                    {/* add more appointments button */}
                    <button
                        className="manage-topbar-btn-primary"
                        onClick={() => navigate("/main/create-appointments")}
                    >
                        + Add Appointment
                    </button>
                </div>
            </div>

            {/* appointment list */}
            <div className="manage-content">
                <manageAppointmentsContext.Provider value={[appointments, setAppointments]}>
                    <ManageAppointmentInfo/>
                </manageAppointmentsContext.Provider>
            </div>

        </div>
    );
}

export default ManageAppointmentComponent;