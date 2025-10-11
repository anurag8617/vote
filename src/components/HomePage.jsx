import React, { useState, useEffect } from "react";
import axios from "axios";
import image from "../assets/polling.png";

function HomePage() {
  const [parties, setParties] = useState([]);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(
    localStorage.getItem("hasVoted") === "true"
  );

  const fetchParties = async () => {
    try {
      const response = await axios.get(
        "http://localhost/poll-pulse/api/parties/list"
      );

      // --- FIX: Ensure the response data is an array before setting state ---
      if (Array.isArray(response.data)) {
        setParties(response.data);
      } else {
        // If the API returns something other than an array, log it and set an error.
        console.error("API did not return an array:", response.data);
        setError("Could not load party data. Invalid format received.");
        setParties([]); // Default to an empty array to prevent the .map error
      }
    } catch (error) {
      console.error("Failed to fetch parties:", error);
      setError("Could not load party data. Please try again later.");
      setParties([]); // Also default to an empty array if the API call fails
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleVote = async (partyId) => {
    if (localStorage.getItem("hasVoted") === "true") {
      alert("You have already cast your vote!");
      return;
    }

    try {
      await axios.put(
        `http://localhost/poll-pulse/api/parties/vote/${partyId}`
      );

      localStorage.setItem("hasVoted", "true");
      setHasVoted(true);
      await fetchParties();
      alert("Thank you! Your vote has been counted.");
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert(
          err.response.data.message ||
            "You have already voted from this device."
        );
        localStorage.setItem("hasVoted", "true");
        setHasVoted(true);
      } else {
        console.error("Failed to vote:", err);
        alert(
          "An error occurred while submitting your vote. Please try again."
        );
      }
    }
  };

  return (
    <div className="bg-amber-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">PollPulse</h1>
        </nav>
      </header>
      <marquee behavior="scroll" direction="left" scrollamount="8">
        आवाज आपकी, न्याय सबका
      </marquee>
      <section className="p-6 bg-amber-100">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* TEXT */}
          <div className="w-full md:w-1/2 text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
              आवाज आपकी, न्याय सबका
            </h2>
          </div>
          {/* IMAGE */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img
              src={image}
              alt="Polling Poster"
              className="rounded-lg w-3/4 md:w-2/3 max-w-sm"
            />
          </div>
        </div>
      </section>
      <main id="parties" className="container mx-auto p-8">
        {error && <p className="text-center text-red-500">{error}</p>}
        {/* --- FIX: Added a loading state check --- */}
        {!error && parties.length === 0 && (
          <p className="text-center text-gray-500">Loading parties...</p>
        )}

        {parties.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-4">
            {parties.map((party) => (
              <div
                key={party.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="flex items-center">
                  <img
                    src={`http://localhost/poll-pulse/api/${party.party_logo.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt={`${party.party_name} Logo`}
                    className="w-16 h-16 object-contain rounded-full border-2 border-gray-200 mr-4 animate-pop-glow"
                  />
                  <h3 className="text-xl font-bold text-gray-800">
                    {party.party_name}
                  </h3>
                </div>
                <div className="w-32 text-center">
                  {hasVoted ? (
                    <div>
                      <p className="text-sm text-gray-500">Total Votes</p>
                      <p className="font-bold text-blue-600 text-3xl">
                        {party.total_votes}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleVote(party.id)}
                      className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Vote
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 bg-white mt-12">
        <p className="text-gray-600">
          &copy; {new Date().getFullYear()} PollPulse. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default HomePage;
