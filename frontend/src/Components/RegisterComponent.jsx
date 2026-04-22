import { useRef } from "react"
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import "../Css/RegisterComponent.css"


function RegisterComponent(){
    let username = useRef();
    let email = useRef();
    let password = useRef();
    let role = useRef();
    let navigate = useNavigate();

    //----------Register user function ----
    let registerUser = async ()=>{
        let inputData = {
            "username": username.current.value,
            "email": email.current.value,
            "role": role.current.value,
            "password": password.current.value,    
        }
        console.log(inputData);
        try{
            let post_url = "http://127.0.0.1:8000/users/register/"
            let response = await axios.post(post_url,inputData)
            console.log(response);
            navigate("/login")
        }catch (err){
            console.log(err.response)
            navigate("/register")
        }
    }
    //--------------------------------
    return (
        <div className="register-page">
            <div className="register-card">
                <h2 className="register-title">Create Account</h2>

                <label className="register-label">
                    Username:
                    <input className="register-input" ref={username} type="text" />
                </label>

                <label className="register-label">
                    Email:
                    <input className="register-input" ref={email} type="email" />
                </label>

                <label className="register-label">
                    Role:
                    <select className="register-input register-select" ref={role}>
                        <option value="">-- Select Role --</option>
                        <option value="PATIENT">PATIENT</option>
                        <option value="DOCTOR">DOCTOR</option>
                    </select>
                </label>

                <label className="register-label">
                    Password:
                    <input className="register-input" ref={password} type="password" />
                </label>

                <button className="register-btn" onClick={registerUser}>Register</button>

                <p className="register-footer">
                    Already have an account?{" "}
                    <Link className="register-link" to="/login">Login</Link>
                </p>
            </div>
        </div>
    )
}
export default RegisterComponent