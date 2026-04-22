import { useContext, useEffect, useState, createContext } from 'react';
import { MyContext } from '../App';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoctorInfo from './DoctorInfo';
import "../Css/ViewDoctors.css";

export const DoctorsContext = createContext();

function ViewDoctors(){
    let [userLogin, setUserLogin]  = useContext(MyContext);
    let [, , RefreshTokenFunction] = useContext(MyContext);
    let [doctorsList, setDoctorsList] = useState([]);
    let [nextPage,    setNextPage]    = useState(null);
    let [prevPage,    setPrevPage]    = useState(null);
    let [loading,     setLoading]     = useState(false);
    let [searchQuery, setSearchQuery] = useState('');
    let [isSearching, setIsSearching] = useState(false);
    let navigate = useNavigate();

    // helper: returns Authorization header using stored access token
    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
    });

    // helper to apply paginated response to state
    const applyResponse = (data) => {
        setDoctorsList(data.results);
        setNextPage(data.next);
        setPrevPage(data.previous);
    };

    let GetDoctorsList = async (url = "http://127.0.0.1:8000/users/getdoctors/") => {
        setLoading(true);
        setIsSearching(false);
        try{
            let response = await axios.get(url, { headers: authHeader() });
            console.log("doctors List ", response.data);
            applyResponse(response.data);

        }catch(error){
            if(error.response?.status === 401){
                const newToken = await RefreshTokenFunction();
                if(!newToken) return;

                try{
                    let retryResponse = await axios.get(url, {
                        headers: { Authorization: `Bearer ${newToken}` }
                    });
                    console.log("doctors List ", retryResponse.data);
                    applyResponse(retryResponse.data);
                }catch(retryError){
                    console.log(retryError.response);
                }
            } else {
                console.log(error.response);
            }
        }
        setLoading(false);
    }

    // search doctors by specialization / username / email
    let SearchDoctors = async (url = null) => {
        // if no query and not paginating, fall back to normal list
        if(!searchQuery.trim() && !url){
            return GetDoctorsList();
        }

        setLoading(true);
        setIsSearching(true);

        // build URL — if paginating a search result use the url param directly
        const requestUrl = url || (
            "http://127.0.0.1:8000/users/searchdoctors/?search=" + encodeURIComponent(searchQuery.trim())
        );

        try{
            let response = await axios.get(requestUrl, { headers: authHeader() });
            console.log("search results ", response.data);
            applyResponse(response.data);

        }catch(error){
            if(error.response?.status === 401){
                const newToken = await RefreshTokenFunction();
                if(!newToken) return;

                try{
                    let retryResponse = await axios.get(requestUrl, {
                        headers: { Authorization: `Bearer ${newToken}` }
                    });
                    console.log("search results ", retryResponse.data);
                    applyResponse(retryResponse.data);
                }catch(retryError){
                    console.log(retryError.response);
                }
            } else {
                console.log(error.response);
            }
        }
        setLoading(false);
    }

    // clear search and go back to full list
    const handleClearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        GetDoctorsList();
    }

    // trigger search on Enter key
    const handleKeyDown = (e) => {
        if(e.key === 'Enter'){
            SearchDoctors();
        }
    }

    // pagination: if in search mode paginate search results, otherwise normal list
    const handlePrev = () => {
        if(isSearching) SearchDoctors(prevPage);
        else GetDoctorsList(prevPage);
    }

    const handleNext = () => {
        if(isSearching) SearchDoctors(nextPage);
        else GetDoctorsList(nextPage);
    }

    useEffect(()=>{
        if(!userLogin){
            navigate("/login");
        }
        GetDoctorsList();
    },[])

    return(
        <div className="view-doctors-page">

            <div className="view-doctors-topbar">
                <h1 className="view-doctors-title">FIND A<br/>DOCTOR</h1>
                <span className="view-doctors-tag">Patient Portal</span>
            </div>

            {/* search bar */}
            <div className="view-doctors-search-row">
                <div className="view-doctors-search-wrap">
                    <input
                        type="text"
                        className="view-doctors-search-input"
                        placeholder="Search by name, specialization or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {searchQuery && (
                        <button
                            className="view-doctors-search-clear"
                            onClick={handleClearSearch}
                        >
                            ✕
                        </button>
                    )}
                </div>
                <button
                    className="view-doctors-search-btn"
                    onClick={() => SearchDoctors()}
                    disabled={loading}
                >
                    {loading ? '...' : 'Search'}
                </button>
            </div>

            {/* search mode indicator */}
            {isSearching && (
                <p className="view-doctors-search-info">
                    Showing results for <span>"{searchQuery}"</span>
                    <button className="view-doctors-search-reset" onClick={handleClearSearch}>
                        Show all doctors
                    </button>
                </p>
            )}

            <DoctorsContext.Provider value={[doctorsList, setDoctorsList]}>
                <DoctorInfo />
            </DoctorsContext.Provider>

            {/* pagination buttons */}
            <div className="view-doctors-pagination">
                <button
                    className="view-doctors-page-btn"
                    onClick={handlePrev}
                    disabled={!prevPage || loading}
                >
                    ← Previous
                </button>

                <button
                    className="view-doctors-page-btn"
                    onClick={handleNext}
                    disabled={!nextPage || loading}
                >
                    Next →
                </button>
            </div>

        </div>
    );
}

export default ViewDoctors;