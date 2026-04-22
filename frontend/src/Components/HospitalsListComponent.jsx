import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MyContext } from "../App";
import HospitalCard from "./Hospitalcard.jsx";
import "../Css/HospitalsList.css";

export const HospitalsContext = createContext();

function HospitalsListComponent(){

    const [hospitals,   setHospitals]   = useState([]);
    const [nextPage,    setNextPage]    = useState(null);
    const [prevPage,    setPrevPage]    = useState(null);
    const [loading,     setLoading]     = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const navigate                      = useNavigate();

    // getting refresh token function from context
    const [, , RefreshTokenFunction] = useContext(MyContext);

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    // helper to apply paginated response data to state
    const applyResponse = (data) => {
        setHospitals(data.results);
        setNextPage(data.next);
        setPrevPage(data.previous);
    };

    let getHospitalList = async (url = "http://127.0.0.1:8000/hospitals/posthospital/") => {
        setLoading(true);
        setIsSearching(false);
        try{
            let response = await axios.get(url, { headers: authHeader() });
            applyResponse(response.data);
            console.log("Hospitals:", response.data);

        }catch(error){
            if(error.response?.status === 401){
                const newToken = await RefreshTokenFunction();
                if(!newToken) return;

                try{
                    let retryResponse = await axios.get(url, {
                        headers: { Authorization: `Bearer ${newToken}` }
                    });
                    applyResponse(retryResponse.data);
                    console.log("Hospitals:", retryResponse.data);
                }catch(retryError){
                    console.log("Error fetching hospitals:", retryError.response);
                }
            } else {
                console.log("Error fetching hospitals:", error.response);
            }
        }
        setLoading(false);
    }

    // search hospitals by city
    let searchHospitals = async (url = null) => {
        // if no query and not paginating, fall back to normal list
        if(!searchQuery.trim() && !url){
            return getHospitalList();
        }

        setLoading(true);
        setIsSearching(true);

        // build URL — if paginating a search result use the url param directly
        const requestUrl = url || (
            "http://127.0.0.1:8000/hospitals/searchhospitals/?search=" + encodeURIComponent(searchQuery.trim())
        );

        try{
            let response = await axios.get(requestUrl, { headers: authHeader() });
            applyResponse(response.data);
            console.log("Search results:", response.data);

        }catch(error){
            if(error.response?.status === 401){
                const newToken = await RefreshTokenFunction();
                if(!newToken) return;

                try{
                    let retryResponse = await axios.get(requestUrl, {
                        headers: { Authorization: `Bearer ${newToken}` }
                    });
                    applyResponse(retryResponse.data);
                    console.log("Search results:", retryResponse.data);
                }catch(retryError){
                    console.log("Error searching hospitals:", retryError.response);
                }
            } else {
                console.log("Error searching hospitals:", error.response);
            }
        }
        setLoading(false);
    }

    // clear search and go back to full list
    const handleClearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        getHospitalList();
    }

    // trigger search on Enter key
    const handleKeyDown = (e) => {
        if(e.key === 'Enter'){
            searchHospitals();
        }
    }

    // pagination: if in search mode paginate search results, otherwise normal list
    const handlePrev = () => {
        if(isSearching) searchHospitals(prevPage);
        else getHospitalList(prevPage);
    }

    const handleNext = () => {
        if(isSearching) searchHospitals(nextPage);
        else getHospitalList(nextPage);
    }

    useEffect(()=>{
        getHospitalList();
    },[])

    return (
        <div className="hospitals-page">

            <div className="hospitals-topbar">
                <h1 className="hospitals-title">FIND A<br/>HOSPITAL</h1>
                <span className="hospitals-tag">Healthcare</span>
            </div>

            {/* search bar */}
            <div className="hospitals-search-row">
                <div className="hospitals-search-wrap">
                    <input
                        type="text"
                        className="hospitals-search-input"
                        placeholder="Search by city , clinic name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {searchQuery && (
                        <button
                            className="hospitals-search-clear"
                            onClick={handleClearSearch}
                        >
                            ✕
                        </button>
                    )}
                </div>
                <button
                    className="hospitals-search-btn"
                    onClick={() => searchHospitals()}
                    disabled={loading}
                >
                    {loading ? '...' : 'Search'}
                </button>
            </div>

            {/* search mode indicator */}
            {isSearching && (
                <p className="hospitals-search-info">
                    Showing results for <span>"{searchQuery}"</span>
                    <button className="hospitals-search-reset" onClick={handleClearSearch}>
                        Show all hospitals
                    </button>
                </p>
            )}

            {hospitals.length === 0 ? (
                <div className="hospitals-empty">
                    <p className="hospitals-empty-title">No Hospitals Found</p>
                    <p className="hospitals-empty-text">
                        {isSearching
                            ? `No hospitals found in "${searchQuery}".`
                            : "No hospitals are available at the moment."
                        }
                    </p>
                </div>
            ) : (
                <div className="hospitals-grid">
                    {hospitals.map((hospital) => (
                        <HospitalCard
                            key={hospital.id}
                            hospital={hospital}
                            onExplore={() => navigate("/main/hospital-detail/" + hospital.id)}
                        />
                    ))}
                </div>
            )}

            {/* pagination buttons */}
            <div className="hospitals-pagination">
                <button
                    className="hospitals-page-btn"
                    onClick={handlePrev}
                    disabled={!prevPage || loading}
                >
                    ← Previous
                </button>

                <button
                    className="hospitals-page-btn"
                    onClick={handleNext}
                    disabled={!nextPage || loading}
                >
                    Next →
                </button>
            </div>

        </div>
    );
}

export default HospitalsListComponent;