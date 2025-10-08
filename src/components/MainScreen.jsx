import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login.jsx"; // We will render the login form on the left

function MainScreen({ token, onLoginSuccess, onLogout }) {
  const [parties, setParties] = useState([]);
  const [partyName, setPartyName] = useState("");
  const [partyLogo, setPartyLogo] = useState(null);
  const [partyBanner, setPartyBanner] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!token) {
      const fetchParties = async () => {
        try {
          const response = await axios.get(
            "http://localhost/poll-pulse/api/parties/list"
          );
          setParties(response.data);
        } catch (error) {
          console.error("Failed to fetch parties:", error);
        }
      };
      fetchParties();
    }
  }, [token]);
  const handleAddPartySubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("party_name", partyName);
    formData.append("party_logo", partyLogo);
    formData.append("party_banner", partyBanner);

    try {
      await axios.post(
        "http://localhost/poll-pulse/api/parties/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Party added successfully!");
      e.target.reset();
    } catch (err) {
      setError("Failed to add party. Your session may have expired.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ====== LEFT COLUMN ====== */}
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-white p-6 border-r">
        {token ? (
          // --- Logged-In Sidebar ---
          <div className="text-center">
            <div className="border-2 border-black h-48 mb-8 flex flex-col items-center justify-center p-4">
              <h2 className="text-xl font-bold text-green-600">✓ Logged In</h2>
              <p className="text-gray-600 mt-2">Welcome, Admin!</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          // --- Logged-Out Login Form ---
          <Login onLoginSuccess={onLoginSuccess} />
        )}
      </aside>

      {/* ====== RIGHT COLUMN ====== */}
      <main className="flex-grow p-8 overflow-y-auto">
        {token ? (
          // --- Logged-In "Add Party" Form ---
          <div className="bg-white p-8 border-2 border-black rounded-lg shadow-sm">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Add New Party
            </h2>
            <form onSubmit={handleAddPartySubmit}>
              <div className="mb-5">
                <label
                  htmlFor="partyName"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Party Name
                </label>
                <input
                  type="text"
                  id="partyName"
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="partyLogo"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Upload Party Logo
                </label>
                <input
                  type="file"
                  id="partyLogo"
                  onChange={(e) => setPartyLogo(e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="partyBanner"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Upload Party Banner
                </label>
                <input
                  type="file"
                  id="partyBanner"
                  onChange={(e) => setPartyBanner(e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold"
              >
                Add Party
              </button>
            </form>
            {message && <p className="mt-4 text-green-600">{message}</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </div>
        ) : (
          // --- Logged-Out Banner Mapping ---
          <div>
            <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">
              Current Parties
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {parties.map((party, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <img
                    src={`http://localhost:3001/${party.party_banner.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt={`${party.party_name} Banner`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex items-center">
                    <img
                      src={`http://localhost:3001/${party.party_logo.replace(
                        /\\/g,
                        "/"
                      )}`}
                      alt={`${party.party_name} Logo`}
                      className="w-12 h-12 object-contain mr-4"
                    />
                    <h3 className="text-xl font-bold text-gray-800">
                      {party.party_name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MainScreen;
