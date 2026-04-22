import React from 'react';
import { useContext } from 'react';
import { DoctorsContext } from './ViewDoctors';
import { useNavigate } from 'react-router-dom';


function DoctorInfo(){
    let [doctorsList, setDoctorsList] = useContext(DoctorsContext);
    let navigate = useNavigate();

    let check_appointments = (doctor_id) => {
        navigate("/main/doctor-appointments/" + doctor_id);
    }

    return (
        <div>
            {/* empty state */}
            {doctorsList.length === 0 ? (
                <div className="doctor-info-empty">
                    <p className="doctor-info-empty-title">No Doctors Found</p>
                    <p className="doctor-info-empty-text">No doctors are available at the moment.</p>
                </div>
            ) : (
                <div className="doctor-info-grid">
                    {doctorsList.map((doctor) => (
                        <div key={doctor.id} className="doctor-card">

                            {/* profile pic or placeholder */}
                            {doctor.profile_pic ? (
                                <img
                                    src={doctor.profile_pic}
                                    alt={doctor.user.username}
                                    className="doctor-card-img"
                                />
                            ) : (
                                <div className="doctor-card-img-placeholder">
                                    👨‍⚕️
                                </div>
                            )}

                            <div className="doctor-card-body">

                                <p className="doctor-card-name">{doctor.user.username}</p>
                                <p className="doctor-card-spec">{doctor.specialization}</p>

                                <div className="doctor-card-info">
                                    <div className="doctor-card-info-item">
                                        <span className="doctor-card-info-label">Experience</span>
                                        <span className="doctor-card-info-value">{doctor.experience} years</span>
                                    </div>
                                    <div className="doctor-card-info-item">
                                        <span className="doctor-card-info-label">Email</span>
                                        <span className="doctor-card-info-value">{doctor.user.email}</span>
                                    </div>
                                    {doctor.hospital && (
                                        <div className="doctor-card-info-item">
                                            <span className="doctor-card-info-label">Clinic</span>
                                            <span className="doctor-card-info-value">{doctor.hospital.clinic_name}</span>
                                        </div>
                                    )}
                                    {doctor.hospital && (
                                        <div className="doctor-card-info-item">
                                            <span className="doctor-card-info-label">City</span>
                                            <span className="doctor-card-info-value">{doctor.hospital.city}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => check_appointments(doctor.user.id)}
                                    className="doctor-card-btn"
                                >
                                    → Check Appointments
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DoctorInfo;