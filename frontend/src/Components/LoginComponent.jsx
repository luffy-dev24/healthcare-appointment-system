import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Css/LoginComponent.css";
import axios from 'axios';
import { useContext } from 'react';
import { MyContext } from '../App';

function LoginComponent(){
    let usernameRef = useRef();
    let passwordRef = useRef();
    let navigate    = useNavigate();
    let [userLogin, setUserLogin] = useContext(MyContext);

    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);

    // login user function
    let loginuser = async () => {
        setError('');

        // frontend validation
        if(!usernameRef.current.value){
            return setError("Please enter your username.");
        }
        if(!passwordRef.current.value){
            return setError("Please enter your password.");
        }

        let inputData = {
            username: usernameRef.current.value,
            password: passwordRef.current.value,
        }

        setLoading(true);
        try{
            let response = await axios.post("http://127.0.0.1:8000/users/login/", inputData);

            setUserLogin(true);

            localStorage.setItem("access_token",      response.data.access);
            localStorage.setItem("refresh_token",     response.data.refresh);
            localStorage.setItem("role",              response.data.role);
            localStorage.setItem("email",             response.data.email);
            localStorage.setItem("user_ID",           response.data.userID);
            localStorage.setItem("profile_completed", response.data.profile_completed);

            // navigate based on role and profile status
            if(response.data.role === "DOCTOR" && response.data.profile_completed === false){
                navigate("/doctor-profile/" + response.data.userID);
            } else if(response.data.role === "PATIENT" && response.data.profile_completed === false){
                navigate("/patient-profile/" + response.data.userID);
            } else {
                navigate("/main");
            }

        }catch(error){
            // showing backend error properly
            const data = error.response?.data;
            if(data){
                setError(Object.values(data).flat().join(' '));
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
        setLoading(false);
    }

    return (
        <div className="login-page">
            <div className="login-card">

                <h2 className="login-title">Welcome Back</h2>

                {error && <p className="login-error">{error}</p>}

                <label className="login-label">
                    Username
                    <input className="login-input" type="text" ref={usernameRef}/>
                </label>

                <label className="login-label">
                    Password
                    <input className="login-input" type="password" ref={passwordRef}/>
                </label>

                <button
                    className="login-btn"
                    onClick={loginuser}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="login-footer">
                    Don't have an account?{" "}
                    <Link className="login-link" to="/register">Register</Link>
                </p>

            </div>
        </div>
    );
}

export default LoginComponent;