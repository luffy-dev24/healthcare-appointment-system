import React from "react";

function HospitalCard({ hospital, onExplore }){
    return(
        <div className="hospital-card">

            {/* hospital image */}
            {hospital.image_1 ? (
                <img
                    src={hospital.image_1}
                    alt={hospital.clinic_name}
                    className="hospital-card-img"
                />
            ) : (
                <div className="hospital-card-img-placeholder">🏥</div>
            )}

            <div className="hospital-card-body">

                <p className="hospital-card-name">{hospital.clinic_name}</p>
                <p className="hospital-card-city">{hospital.city}</p>

                <div className="hospital-card-info">
                    <div className="hospital-card-info-item">
                        <span className="hospital-card-info-label">Opens</span>
                        <span className="hospital-card-info-value">{hospital.opening_time}</span>
                    </div>
                    <div className="hospital-card-info-item">
                        <span className="hospital-card-info-label">Closes</span>
                        <span className="hospital-card-info-value">{hospital.closing_time}</span>
                    </div>
                    <div className="hospital-card-info-item">
                        <span className="hospital-card-info-label">Phone</span>
                        <span className="hospital-card-info-value">{hospital.phone}</span>
                    </div>
                    <div className="hospital-card-info-item">
                        <span className="hospital-card-info-label">Address</span>
                        <span className="hospital-card-info-value">{hospital.address}</span>
                    </div>
                </div>

                <button
                    onClick={onExplore}
                    className="hospital-card-btn"
                >
                    → Explore
                </button>

            </div>

        </div>
    );
}

export default HospitalCard;