import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MyContext } from '../App';
import "../Css/HospitalDetailComponent.css";


function HospitalDetailComponent(){
    let { hospital_id } = useParams();
    let navigate        = useNavigate();

    const [hospital, setHospital] = useState(null);
    const [error,    setError]    = useState('');

    // getting refresh token function from context
    const [, , RefreshTokenFunction] = useContext(MyContext);

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    const fetchHospital = async () => {
        try{
            let response = await axios.get(
                "http://127.0.0.1:8000/hospitals/hospital-details/" + hospital_id + "/",
                { headers: authHeader() }
            );
            setHospital(response.data);
            console.log("Hospital detail:", response.data);

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await axios.get(
                        "http://127.0.0.1:8000/hospitals/hospital-details/" + hospital_id + "/",
                        { headers: { Authorization: `Bearer ${newToken}` } }
                    );
                    setHospital(retryResponse.data);
                    console.log("Hospital detail:", retryResponse.data);
                }catch(retryError){
                    setError("Failed to load hospital details.");
                    console.log(retryError.response);
                }
            } else {
                setError("Failed to load hospital details.");
                console.log(error.response);
            }
        }
    }

    useEffect(()=>{
        fetchHospital();
    },[]);

    if(error){
        return <p className="hospital-detail-error">{error}</p>;
    }

    if(!hospital){
        return <p className="hospital-detail-error">Loading...</p>;
    }

    // collect only existing images
    const images = [hospital.image_1, hospital.image_2, hospital.image_3].filter(Boolean);

    return(
        <div className="hospital-detail-page">

            {/* banner image — first image of hospital */}
            {hospital.image_1 ? (
                <img
                    src={hospital.image_1}
                    alt={hospital.clinic_name}
                    className="hospital-detail-banner"
                />
            ) : (
                <div className="hospital-detail-banner-placeholder">🏥</div>
            )}

            <div className="hospital-detail-content">

                {/* back button */}
                <button
                    className="hospital-detail-back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                {/* hospital name */}
                <h1 className="hospital-detail-name">{hospital.clinic_name}</h1>
                <p className="hospital-detail-city">{hospital.city}</p>

                {/* hospital info cards */}
                <div className="hospital-detail-info-grid">
                    <div className="hospital-detail-info-card">
                        <p className="hospital-detail-info-label">Address</p>
                        <p className="hospital-detail-info-value">{hospital.address}</p>
                    </div>
                    <div className="hospital-detail-info-card">
                        <p className="hospital-detail-info-label">Phone</p>
                        <p className="hospital-detail-info-value">{hospital.phone}</p>
                    </div>
                    <div className="hospital-detail-info-card">
                        <p className="hospital-detail-info-label">Opening Time</p>
                        <p className="hospital-detail-info-value">{hospital.opening_time}</p>
                    </div>
                    <div className="hospital-detail-info-card">
                        <p className="hospital-detail-info-label">Closing Time</p>
                        <p className="hospital-detail-info-value">{hospital.closing_time}</p>
                    </div>
                </div>

                {/* image gallery — show all available images */}
                {images.length > 0 && (
                    <>
                        <h2 className="hospital-detail-gallery-title">Gallery</h2>
                        <div className="hospital-detail-gallery">
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`clinic ${index + 1}`}
                                    className="hospital-detail-gallery-img"
                                />
                            ))}
                        </div>
                    </>
                )}

                <hr className="hospital-detail-divider" />

                {/* doctor section */}
                <h2 className="hospital-detail-doctor-title">Doctor</h2>

                <div className="hospital-detail-doctor-card">

                    {hospital.doctor_pic ? (
                        <img
                            src={hospital.doctor_pic}
                            alt={hospital.doctor_name}
                            className="hospital-detail-doctor-avatar"
                        />
                    ) : (
                        <div className="hospital-detail-doctor-avatar-placeholder">👨‍⚕️</div>
                    )}

                    <div className="hospital-detail-doctor-info">
                        <p className="hospital-detail-doctor-name">Dr. {hospital.doctor_name}</p>
                        <p className="hospital-detail-doctor-spec">{hospital.doctor_specialization}</p>

                        <div className="hospital-detail-doctor-details">
                            <div className="hospital-detail-doctor-detail-item">
                                <span className="hospital-detail-doctor-detail-label">Experience</span>
                                <span className="hospital-detail-doctor-detail-value">{hospital.doctor_experience} years</span>
                            </div>
                            <div className="hospital-detail-doctor-detail-item">
                                <span className="hospital-detail-doctor-detail-label">Email</span>
                                <span className="hospital-detail-doctor-detail-value">{hospital.doctor_email}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default HospitalDetailComponent;