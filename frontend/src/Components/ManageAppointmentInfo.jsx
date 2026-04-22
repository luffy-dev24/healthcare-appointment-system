import React from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { manageAppointmentsContext } from './ManageAppointmentComponent';
import "../Css/ManageAppointmentInfo.css";


function ManageAppointmentInfo(){
    let [appointments, setAppointments] = useContext(manageAppointmentsContext);
    let navigate = useNavigate();

    let edit_appointment = (appointment_id) => {
        navigate("/main/doctor-edit-appointment/" + appointment_id);
    }

    let delete_appointment = (appointment_id) => {
        navigate("/main/doctor-delete-appointment/" + appointment_id);
    }

    // navigate to view bookings of this slot
    let view_bookings = (appointment_id) => {
        navigate("/main/slot-bookings/" + appointment_id);
    }

    const getStatusClass = (status) => {
        if(status === 'open')   return 'manage-status-open';
        if(status === 'full')   return 'manage-status-full';
        if(status === 'closed') return 'manage-status-closed';
    }

    const getSlotPercentage = (booked, total) => {
        if(total === 0) return 0;
        return Math.round((booked / total) * 100);
    }

    return (
        <div className="manage-page">

            {appointments.length === 0 ? (
                <div className="manage-empty">
                    <p className="manage-empty-title">No Appointments Yet</p>
                    <p className="manage-empty-text">Create your first appointment slot to get started.</p>
                </div>
            ) : (
                appointments.map((appointment) => (
                    <div key={appointment.id} className="manage-card">

                        <div className="manage-card-left">
                            <div className="manage-card-top">
                                <span className="manage-date">{appointment.date}</span>
                                <span className={getStatusClass(appointment.status)}>
                                    {appointment.status}
                                </span>
                            </div>

                            <div className="manage-info-row">
                                <div className="manage-info-item">
                                    <span className="manage-info-label">Start Time</span>
                                    <span className="manage-info-value">{appointment.start_time}</span>
                                </div>
                                <div className="manage-info-item">
                                    <span className="manage-info-label">End Time</span>
                                    <span className="manage-info-value">{appointment.end_time}</span>
                                </div>
                                <div className="manage-info-item">
                                    <span className="manage-info-label">Specialization</span>
                                    <span className="manage-info-value">{appointment.doctor_specialization}</span>
                                </div>
                                <div className="manage-info-item">
                                    <span className="manage-info-label">Doctor</span>
                                    <span className="manage-info-value">{appointment.doctor_name}</span>
                                </div>
                                <div className="manage-info-item">
                                    <span className="manage-info-label">Created</span>
                                    <span className="manage-info-value">
                                        {new Date(appointment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="manage-slots-bar">
                            <p className="manage-slots-label">Slots</p>
                            <div className="manage-bar-bg">
                                <div
                                    className="manage-bar-fill"
                                    style={{ width: `${getSlotPercentage(appointment.booked_count, appointment.total_slots)}%` }}
                                />
                            </div>
                            <p className="manage-slots-count">
                                {appointment.booked_count} / {appointment.total_slots} booked
                            </p>
                        </div>

                        <div className="manage-btns">
                            <button
                                onClick={() => view_bookings(appointment.id)}
                                className="manage-btn-bookings"
                            >
                                Bookings
                            </button>
                            <button
                                onClick={() => edit_appointment(appointment.id)}
                                className="manage-btn-edit"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => delete_appointment(appointment.id)}
                                className="manage-btn-delete"
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                ))
            )}

        </div>
    );
}

export default ManageAppointmentInfo;