import { useRef, useEffect, useContext, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { MyContext } from "../App";
import "../Css/HospitalComponent.css";


function HospitalComponent(){

    let [userLogin]            = useContext(MyContext);
    let [, , RefreshTokenFunction] = useContext(MyContext);
    let navigate    = useNavigate();
    let { pk }      = useParams();

    // error and success messages
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState('');

    // image previews
    const [preview1, setPreview1] = useState(null);
    const [preview2, setPreview2] = useState(null);
    const [preview3, setPreview3] = useState(null);

    // refs for input fields
    let username = useRef();
    let email    = useRef();
    let clinic   = useRef();
    let address  = useRef();
    let city     = useRef();
    let phone    = useRef();
    let open     = useRef();
    let close    = useRef();

    // refs for image fields
    let image1   = useRef();
    let image2   = useRef();
    let image3   = useRef();

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
    }

    // image preview handlers
    const handleImage1Change = () => {
        const file = image1.current.files[0];
        if(file) setPreview1(URL.createObjectURL(file));
    }
    const handleImage2Change = () => {
        const file = image2.current.files[0];
        if(file) setPreview2(URL.createObjectURL(file));
    }
    const handleImage3Change = () => {
        const file = image3.current.files[0];
        if(file) setPreview3(URL.createObjectURL(file));
    }

    const submitHospital = async () => {
        setError('');

        // checking all fields are filled
        if(!clinic.current.value)  return setError("Please enter your clinic name.");
        if(!address.current.value) return setError("Please enter your address.");
        if(!city.current.value)    return setError("Please enter your city.");
        if(!phone.current.value)   return setError("Please enter your phone number.");
        if(!open.current.value)    return setError("Please enter opening time.");
        if(!close.current.value)   return setError("Please enter closing time.");

        // image_1 and image_2 are required
        if(!image1.current.files[0]) return setError("Please upload clinic image 1.");
        if(!image2.current.files[0]) return setError("Please upload clinic image 2.");

        // using FormData because we are sending images
        const formData = new FormData();
        formData.append("userid",       pk);
        formData.append("email",        email.current.value);
        formData.append("clinic_name",  clinic.current.value);
        formData.append("address",      address.current.value);
        formData.append("city",         city.current.value);
        formData.append("phone",        phone.current.value);
        formData.append("opening_time", open.current.value);
        formData.append("closing_time", close.current.value);
        formData.append("image_1",      image1.current.files[0]);
        formData.append("image_2",      image2.current.files[0]);

        // only append image_3 if selected
        if(image3.current.files[0]){
            formData.append("image_3", image3.current.files[0]);
        }

        // helper to send the POST with a given token
        const sendRequest = (token) =>
            axios.post(
                "http://127.0.0.1:8000/hospitals/posthospital/",
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
            console.log(response.data);
            setSuccess("Clinic details saved successfully!");
            navigate("/main");

        }catch(error){
            if(error.response?.status === 401){
                // access token expired — refresh and retry once
                const newToken = await RefreshTokenFunction();
                if(!newToken) return; // RefreshTokenFunction redirects to /login on failure

                try{
                    let retryResponse = await sendRequest(newToken);
                    console.log(retryResponse.data);
                    setSuccess("Clinic details saved successfully!");
                    navigate("/main");
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

    useEffect(()=>{
        if(!userLogin){
            navigate("/login");
        }
        getUserDetails();
    },[]);

    return(
        <div className="hospital-page">
            <div className="hospital-card">

                <h2 className="hospital-title">Clinic Details</h2>

                {error   && <p className="hospital-error">{error}</p>}
                {success && <p className="hospital-success">{success}</p>}

                <label className="hospital-label">
                    Username
                    <input type="text" ref={username} className="hospital-input" />
                </label>

                <label className="hospital-label">
                    Email
                    <input type="text" ref={email} className="hospital-input" />
                </label>

                <label className="hospital-label">
                    Clinic Name
                    <input ref={clinic} className="hospital-input" />
                </label>

                <label className="hospital-label">
                    Address
                    <input ref={address} className="hospital-input" />
                </label>

                <label className="hospital-label">
                    City
                    <input ref={city} className="hospital-input" />
                </label>

                <label className="hospital-label">
                    Phone
                    <input ref={phone} className="hospital-input" />
                </label>

                <label className="hospital-label">
                    Opening Time
                    <input type="time" ref={open} className="hospital-input" />
                </label>

                <label className="hospital-label">
                    Closing Time
                    <input type="time" ref={close} className="hospital-input" />
                </label>

                <label className="hospital-label">
                    Clinic Image 1 (required)
                    <input type="file" accept="image/*" ref={image1} onChange={handleImage1Change} className="hospital-file" />
                </label>
                {preview1 && <img src={preview1} alt="preview 1" className="hospital-preview" />}

                <label className="hospital-label">
                    Clinic Image 2 (required)
                    <input type="file" accept="image/*" ref={image2} onChange={handleImage2Change} className="hospital-file" />
                </label>
                {preview2 && <img src={preview2} alt="preview 2" className="hospital-preview" />}

                <label className="hospital-label">
                    Clinic Image 3 (optional)
                    <input type="file" accept="image/*" ref={image3} onChange={handleImage3Change} className="hospital-file" />
                </label>
                {preview3 && <img src={preview3} alt="preview 3" className="hospital-preview" />}

                <button onClick={submitHospital} className="hospital-btn">
                    Submit
                </button>

            </div>
        </div>
    )
}

export default HospitalComponent;