import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MyContext } from "../App";
import { useContext } from 'react';
import axios from 'axios';
import doctorImage from "../assets/doctorimage.jpg";
import "../Css/DoctorMenuComponent.css";


function DoctorMenuComponent() {
    let navigate       = useNavigate();
    let [userLogin]    = useContext(MyContext);
    let user_id        = localStorage.getItem("user_ID");
    let doctor_profile = null;


    let create_appointment = () => {
        navigate("/main/create-appointments");
    }

    let manage_appointment_page = () => {
        navigate('/main/doctor-manage-appointments');
    }

    useEffect(()=>{
        if(!userLogin){
            navigate("/login");
        }
        
    },[doctor_profile]);

    return (
        <div className="doctor-menu-page">
            <div className="doctor-menu-wrap">

                {/* left side */}
                <div className="doctor-menu-left">

                    <span className="doctor-menu-tag">Doctor Portal</span>

                    <h1 className="doctor-menu-title">
                        MANAGE<br/>
                        <span>YOUR</span><br/>
                        PRACTICE
                    </h1>

                    <p className="doctor-menu-description">
                        Create appointment slots for your patients and manage
                        your daily schedule from one place.
                    </p>

                    <div className="doctor-menu-buttons">
                        <button onClick={create_appointment} className="doctor-menu-btn">
                            → Create Appointment
                        </button>
                        <button onClick={manage_appointment_page} className="doctor-menu-btn-outline">
                            → Manage Appointments
                        </button>
                    </div>

                </div>

                {/* right side — doctor image */}
                <div className="doctor-menu-right">
                    <img
                        src={doctorImage}
                        alt="doctor"
                        className="doctor-menu-illustration"
                    />
                </div>

            </div>
        </div>
    );
}

export default DoctorMenuComponent;