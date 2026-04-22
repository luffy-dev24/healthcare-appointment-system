import { useRef, useEffect, useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { MyContext } from "../App";
import "../Css/DoctorProfileComponent.css";

function DoctorProfileComponent(){

    // getting user login status and refresh token function from context
    let [userLogin]           = useContext(MyContext);
    let [, , RefreshTokenFunction] = useContext(MyContext);
    let navigate    = useNavigate();

    // getting pk from url
    let { pk } = useParams();

    // error and success messages
    const [error,   setError]   = useState('');
    const [success, setSuccess] = useState('');

    // preview state for profile pic
    const [preview, setPreview] = useState(null);

    // getting original email from localStorage
    let original_email = localStorage.getItem("email");

    // refs for input fields
    let username       = useRef();
    let email          = useRef();
    let specialization = useRef();
    let experience     = useRef();
    let profile_pic    = useRef();

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    // fetching user details and filling the form
    // retries once with a fresh token if the first attempt returns 401
    const getUserDetails = async () => {
        try{
            let response = await axios.get(
                "http://127.0.0.1:8000/users/user/" + pk + "/",
                { headers: authHeader() }
            );
            // filling the form with existing user data
            username.current.value = response.data.username;
            email.current.value    = response.data.email;

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await axios.get(
                        "http://127.0.0.1:8000/users/user/" + pk + "/",
                        { headers: { Authorization: `Bearer ${newToken}` } }
                    );
                    username.current.value = retryResponse.data.username;
                    email.current.value    = retryResponse.data.email;
                }catch{
                    setError("Failed to load user details. Please refresh.");
                }
            } else {
                setError("Failed to load user details. Please refresh.");
            }
        }
    };

    // showing image preview when user picks a file
    const handleImageChange = () => {
        const file = profile_pic.current.files[0];
        if(file){
            // creating a temporary URL for preview
            setPreview(URL.createObjectURL(file));
        }
    };

    // saving doctor profile to backend
    const postDoctorProfile = async () => {

        // checking if email matches the registered email
        if(!(original_email === email.current.value)){
            return setError("Use the same email you used in the register form.");
        }

        // checking all fields are filled
        if(!specialization.current.value){
            return setError("Please enter your specialization.");
        }

        if(!experience.current.value){
            return setError("Please enter your experience.");
        }

        // clear errors before submitting
        setError('');

        // using FormData because we are sending image along with text
        const formData = new FormData();
        formData.append("userid",         pk);
        formData.append("email",          email.current.value);
        formData.append("specialization", specialization.current.value);
        formData.append("experience",     experience.current.value);

        // only appending image if user selected one
        if(profile_pic.current.files[0]){
            formData.append("profile_pic", profile_pic.current.files[0]);
        }

        // helper to send the POST with a given token
        const sendRequest = (token) =>
            axios.post(
                "http://127.0.0.1:8000/users/postdoctorprofile/",
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
            console.log("response is : ", response);
            localStorage.setItem("user_profile_id", response.data.id);
            setSuccess("Profile saved successfully!");
            // navigating the user to hospital page
            navigate("/hospital-profile/" + pk);

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await sendRequest(newToken);
                    console.log("retry response is : ", retryResponse);
                    localStorage.setItem("user_profile_id", retryResponse.data.id);
                    setSuccess("Profile saved successfully!");
                    navigate("/hospital-profile/" + pk);
                }catch(retryError){
                    const data = retryError.response?.data;
                    if(data){
                        setError(Object.values(data).flat().join(' '));
                    } else {
                        setError("Something went wrong. Please try again.");
                    }
                }
            } else {
                // showing error from backend if any
                const data = error.response?.data;
                if(data){
                    setError(Object.values(data).flat().join(' '));
                } else {
                    setError("Something went wrong. Please try again.");
                }
            }
        }
    };

    useEffect(()=>{
        // if user is not logged in redirect to login page
        if(!userLogin){
            navigate("/login");
        }
        // fetch user details when component loads
        getUserDetails();
    },[]);

    return(
        <div className="doctor-profile-page">
            <div className="doctor-profile-card">

                <h2 className="doctor-profile-title">Doctor Profile</h2>

                {error   && <p className="doctor-profile-error">{error}</p>}
                {success && <p className="doctor-profile-success">{success}</p>}

                <label className="doctor-profile-label">
                    Username
                    <input type="text" ref={username} className="doctor-profile-input" />
                </label>

                <label className="doctor-profile-label">
                    Email
                    <input type="text" ref={email} className="doctor-profile-input" />
                </label>

                <label className="doctor-profile-label">
                    Specialization
                    <input type="text" ref={specialization} className="doctor-profile-input" />
                </label>

                <label className="doctor-profile-label">
                    Experience (years)
                    <input type="number" ref={experience} className="doctor-profile-input" />
                </label>

                <label className="doctor-profile-label">
                    Profile Picture
                    <input type="file" accept="image/*" ref={profile_pic} onChange={handleImageChange} className="doctor-profile-file" />
                </label>

                {preview && (
                    <img src={preview} alt="preview" className="doctor-profile-preview" />
                )}

                <button onClick={postDoctorProfile} className="doctor-profile-btn">
                    Save
                </button>

            </div>
        </div>
    );
}

export default DoctorProfileComponent;