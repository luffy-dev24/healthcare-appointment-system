import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { MyContext } from "../App";
import "../Css/HeaderComponent.css";



function HeaderComponent() {
    let [userLogin, setUserLogin]  = useContext(MyContext);

    // state for profile pic
    const [profilePic,   setProfilePic]   = useState(null);
    // state for dropdown open/close
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const navigate = useNavigate();

    // getting refresh token function from context
    const [, , RefreshTokenFunction] = useContext(MyContext);

    // getting user details from localStorage
    const role    = localStorage.getItem("role");
    const user_id = localStorage.getItem("user_ID");

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    // fetching profile pic based on role
    // retries once with a fresh token if the first attempt returns 401
    const getProfilePic = async (user_profile_id, token = null) => {
        const url = role === "DOCTOR"
            ? `http://127.0.0.1:8000/users/updatedoctors/${user_profile_id}/`
            : `http://127.0.0.1:8000/users/updatepatientprofile/${user_profile_id}/`;

        const headers = token
            ? { Authorization: `Bearer ${token}` }
            : authHeader();

        try{
            const response = await axios.get(url, { headers });
            if(response.data.profile_pic){
                setProfilePic(response.data.profile_pic);
            }
        }catch(error){
            if(error.response?.status === 401 && !token){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure
                await getProfilePic(user_profile_id, newToken);
            } else {
                console.log("Error fetching profile pic:", error.response);
            }
        }
    }

    let getuserdetails = async () => {
        const url = role === "DOCTOR"
            ? "http://127.0.0.1:8000/users/getdoctorprofile/" + user_id + "/"
            : "http://127.0.0.1:8000/users/getpatientprofile/" + user_id + "/";

        try{
            let response = await axios.get(url, { headers: authHeader() });
            localStorage.setItem("user_profile_id", response.data["id"]);
            getProfilePic(response.data["id"]);

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await axios.get(url, {
                        headers: { Authorization: `Bearer ${newToken}` }
                    });
                    localStorage.setItem("user_profile_id", retryResponse.data["id"]);
                    getProfilePic(retryResponse.data["id"], newToken);
                }catch(retryError){
                    console.log("Error fetching user details:", retryError.response);
                }
            } else {
                console.log("Error fetching user details:", error.response);
            }
        }
    }

    // toggle dropdown open/close
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    }

    // navigate to edit profile
    const goToProfile = () => {
        let user_profile_id = localStorage.getItem("user_profile_id");
        setDropdownOpen(false);
        if(role === "DOCTOR"){
            navigate("/doctor-edit-profile/" + user_profile_id);
        } else {
            navigate("/patient-edit-profile/" + user_profile_id);
        }
    }

    // logout — clear localStorage and navigate to login
    const logout = () => {
        setDropdownOpen(false);
        localStorage.clear();
        navigate("/login");
    }

    // close dropdown when clicking outside
    const handleOutsideClick = (e) => {
        if(!e.target.closest('.header-profile-wrapper')){
            setDropdownOpen(false);
        }
    }

    useEffect(() => {
        if(!userLogin){
            navigate("/login");
        }
        getuserdetails();
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        }
    }, []);

    return(
        <div className="header">

            <h1 className="header-title">Healthcare Appointment System</h1>

            {/* patient nav links — only shown for patients */}
            {role === "PATIENT" && (
                <nav className="header-nav">
                    <Link to="/main/doctors"   className="header-nav-link">Doctors</Link>
                    <Link to="/main/hospitals" className="header-nav-link">Hospitals</Link>
                    <Link to="/main/patient-appointments" className="header-nav-link">Your Appointments</Link>
                </nav>
            )}

            {/* profile wrapper — contains button + dropdown */}
            <div className="header-profile-wrapper">

                <button className="header-profile-btn" onClick={toggleDropdown}>
                    {profilePic ? (
                        <img
                            src={profilePic}
                            alt="profile"
                            className="header-profile-img"
                        />
                    ) : (
                        <div className="header-profile-placeholder">
                            👤
                        </div>
                    )}
                </button>

                {dropdownOpen && (
                    <div className="header-dropdown">
                        <button
                            className="header-dropdown-item"
                            onClick={goToProfile}
                        >
                            ✏️ Edit Profile
                        </button>
                        <button
                            className="header-dropdown-logout"
                            onClick={logout}
                        >
                            🚪 Logout
                        </button>
                    </div>
                )}

            </div>

        </div>
    );
}

export default HeaderComponent;