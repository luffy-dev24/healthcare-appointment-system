import React from 'react';
import { useState, useContext, useEffect, useRef } from "react";
import { MyContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import "../Css/PatientProfileComponent.css";
import "../Css/EditPatientProfileComponent.css";


function EditPatientProfileComponent() {

    // getting user login status and refresh token function from context
    let [userLogin, setUserLogin]  = useContext(MyContext);
    let [, , RefreshTokenFunction] = useContext(MyContext);

    // error and success messages
    const [error,      setError]      = useState('');
    const [success,    setSuccess]    = useState('');

    // current profile pic from backend
    const [currentPic, setCurrentPic] = useState(null);

    // preview when user selects new image
    const [preview,    setPreview]    = useState(null);

    let navigate = useNavigate();

    // getting pk from url
    let { pk } = useParams();

    // getting original email from localStorage
    let original_email = localStorage.getItem("email");

    // refs for input fields
    let username    = useRef();
    let email       = useRef();
    let age         = useRef();
    let profile_pic = useRef();

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    // fills the form with data from the response
    const fillForm = (data) => {
        username.current.value = data.user.username;
        email.current.value    = data.user.email;
        age.current.value      = data.age;
        if(data.profile_pic){
            setCurrentPic(data.profile_pic);
        }
    };

    // fetching user details and filling the form
    // retries once with a fresh token if the first attempt returns 401
    let getuserdetails = async () => {
        try{
            let response = await axios.get(
                "http://127.0.0.1:8000/users/editprofilepatient/" + pk + "/",
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
                        "http://127.0.0.1:8000/users/editprofilepatient/" + pk + "/",
                        { headers: { Authorization: `Bearer ${newToken}` } }
                    );
                    fillForm(retryResponse.data);
                }catch{
                    setError("Failed to load user details. Please refresh.");
                }
            } else {
                setError("Failed to load user details. Please refresh.");
            }
        }
    }

    // showing preview when user picks a new file
    const handleImageChange = () => {
        const file = profile_pic.current.files[0];
        if(file){
            setPreview(URL.createObjectURL(file));
        }
    }

    // saving patient profile to backend
    let putpatientprofile = async () => {

        if(!(original_email === email.current.value)){
            return setError("Use the same email you used in the register form.");
        }

        if(!age.current.value){
            return setError("Please enter your age.");
        }

        setError('');

        const formData = new FormData();
        formData.append("userid", pk);
        formData.append("email",  email.current.value);
        formData.append("age",    age.current.value);

        if(profile_pic.current.files[0]){
            formData.append("profile_pic", profile_pic.current.files[0]);
        }

        // helper to send the PUT with a given token
        const sendRequest = (token) =>
            axios.put(
                "http://127.0.0.1:8000/users/editprofilepatient/" + pk + "/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        try{
            let response = await sendRequest(localStorage.getItem("access_token"));
            console.log("Patient profile updated successfully:", response);
            setSuccess("Profile updated successfully!");
            navigate("/main/doctors");

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await sendRequest(newToken);
                    console.log("Patient profile updated successfully:", retryResponse);
                    setSuccess("Profile updated successfully!");
                    navigate("/main/doctors");
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
    }

    useEffect(() => {
        if(!userLogin){
            navigate("/login");
        }
        getuserdetails();
    }, []);

    return (
        <div className="patient-profile-page">
            <div className="patient-profile-card">

                <h2 className="patient-profile-title">Edit Profile</h2>

                {error   && <p className="patient-profile-error">{error}</p>}
                {success && <p className="patient-profile-success">{success}</p>}

                {/* instagram style profile pic section */}
                <div className="profile-pic-section">
                    <div className="profile-pic-wrapper">
                        <img
                            src={preview || currentPic || "https://via.placeholder.com/100"}
                            alt="profile"
                            className="profile-pic-current"
                        />
                        {/* click the image to trigger file input */}
                        <label htmlFor="profile-pic-input" className="profile-pic-overlay">
                            ✏️
                        </label>
                    </div>
                    <p className="profile-pic-hint">Click image to change</p>
                    <input
                        type="file"
                        id="profile-pic-input"
                        accept="image/*"
                        ref={profile_pic}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                </div>

                <label className="patient-profile-label">
                    Name
                    <input type="text" ref={username} className="patient-profile-input" />
                </label>

                <label className="patient-profile-label">
                    Email
                    <input type="text" ref={email} className="patient-profile-input" />
                </label>

                <label className="patient-profile-label">
                    Age
                    <input type="number" ref={age} className="patient-profile-input" />
                </label>

                <button onClick={putpatientprofile} className="patient-profile-btn">
                    Update
                </button>
                <br />
                <button
                        className="patient-profile-btn"
                        onClick={() => navigate("/main/doctors")}
                >
                        ← Go to Home
                </button>
                
            </div>
        </div>
    );
}

export default EditPatientProfileComponent;