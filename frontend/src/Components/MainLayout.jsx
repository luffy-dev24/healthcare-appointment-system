import HeaderComponent from './HeaderComponent';
import { useEffect } from 'react';
import { useContext } from 'react';
import { MyContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

function MainLayout(){
    let [userLogin, setUserLogin] = useContext(MyContext);
    let user_id = localStorage.getItem("user_ID");
    let doctor_profile = null
    let navigate = useNavigate();



     let GetProfileId = async () =>{
            try{
                let response = await axios.get(
                    "http://127.0.0.1:8000/users/doctorprofile/" + user_id + "/"
                );
                console.log("doctor profile response:", response);
            }catch(error){
                console.log(error.response);
            }
        }


    useEffect(()=>{

        console.log(userLogin);
        if(!userLogin){
            navigate("/login");
        }

        let role = localStorage.getItem("role");
        if(role === "PATIENT"){
            navigate("/main/doctors");
        }
        else if(role === "DOCTOR"){
            navigate("/main/doctor-menu");
        }
    },[])
    return (
        <div>
            <div>
                <HeaderComponent />
            </div>
            
            <div>
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
export default MainLayout;