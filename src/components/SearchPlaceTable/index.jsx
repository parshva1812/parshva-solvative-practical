import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import "./style.css";

const SearchPlaceTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(3);
  const [limit, setLimit] = useState(5);
  const [totalResults, setTotalResults] = useState(0);

  const apiKey = process.env.REACT_APP_RAPIDAPI_KEY;
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}`, {
        headers: {
          "x-rapidapi-key": apiKey,
        },
        params: {
          namePrefix: searchTerm,
          limit: limit,
        },
      });
      setData(response.data.data);
      setTotalResults(response.data.metadata.totalCount);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, limit, apiKey, apiUrl]);

  const handleSearch = useCallback(
    (e) => {
      if (e.key === "Enter") {
        setPage(1);
        fetchData();
      }
    },
    [fetchData]
  );

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 10) {
      alert("Warning: Value exceeds maximum limit of 10");
    }
    const clampedValue = Math.min(Math.max(5, value), 10);
    setLimit(clampedValue);
  }, []);

  const handlePerPage = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    setPerPage(value);
    setPage(1);
  }, []);

  useEffect(() => {
    const handleShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        document.querySelector(".search-box").focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        fetchData();
        setPage(1);
      } else {
        setData([]);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, limit, fetchData]);

  const paginatedData = useMemo(() => {
    return data.slice((page - 1) * perPage, page * perPage);
  }, [data, page, perPage]);

  const totalPages = useMemo(
    () => Math.ceil(data.length / perPage),
    [data.length, perPage]
  );

  return (
    <div className="search-table-container">
      <div className="search-box-wrapper">
        <input
          type="text"
          className="search-box"
          placeholder="Search places..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
          disabled={isLoading}
        />
        <span className="keyboard-shortcut">Ctrl + /</span>
      </div>
      <div className="table-container">
        {isLoading ? (
          <span class="loader"></span>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Place Name</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    {searchTerm ? "No results found" : "Start searching"}
                  </td>
                </tr>
              ) : (
                paginatedData.map((city, index) => (
                  <tr key={city.id}>
                    <td>{(page - 1) * perPage + index + 1}</td>
                    <td>{city.name}</td>
                    <td>
                      <div className="country-col">
                        <img
                          src={`https://flagsapi.com/${city.countryCode}/flat/32.png`}
                          alt={city.country}
                          className="country-flag"
                        />
                        <span className="country-name">{city.country}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {data.length > 0 && (
        <div className="pagination">
          <div className="pagination-container">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="pagination-button"
            >
              {"<"}
            </button>
            <span>
              {page} of {totalPages} pages
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="pagination-button"
            >
              {">"}
            </button>
          </div>
          <div className="per-page-container">
            <label>Per page:</label>
            <input type="number" value={perPage} onChange={handlePerPage} />
          </div>
          <div className="limit-container">
            <label>Fetch Limit:</label>
            <input type="number" value={limit} onChange={handleLimitChange} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPlaceTable;
