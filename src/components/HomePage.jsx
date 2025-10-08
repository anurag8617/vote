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
      const response = await axios.get("http://localhost/poll-pulse/api/parties/list");
      setParties(response.data);
    } catch (error) {
      console.error("Failed to fetch parties:", error);
      setError("Could not load party data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleVote = async (partyId) => {
    if (hasVoted) {
      alert("You have already voted!");
      return;
    }

    try {
      await axios.post(`http://localhost/poll-pulse/api/parties/list/vote/${partyId}`);
      // Set a flag in local storage to remember that the user has voted
      localStorage.setItem("hasVoted", "true");
      setHasVoted(true);
      // Re-fetch the parties to show the updated vote counts
      await fetchParties();
    } catch (err) {
      console.error("Failed to vote:", err);
      alert("There was an error submitting your vote.");
    }
  };

  return (
    <div className="bg-amber-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">PollPulse</h1>
        </nav>
        <marquee behavior="scroll" direction="left" scrollamount="5">
          आवाज आपकी, न्याय सबका
        </marquee>
      </header>
      <section className="p-6 bg-amber-100">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* TEXT — always on the left */}
          <div className="w-full md:w-1/2 text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
              आवाज आपकी, न्याय सबका
            </h2>
            <p className="text-gray-700 text-lg">
              अपनी आवाज उठाइए और लोकतंत्र को मजबूत बनाइए।
            </p>
          </div>

          {/* IMAGE — always on the right */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img
              src={image}
              alt="Polling Poster"
              className="rounded-lg shadow-2xl w-3/4 md:w-2/3 max-w-sm"
            />
          </div>
        </div>
      </section>

      <main id="parties" className="container mx-auto p-8">
        {error && <p className="text-center text-red-500">{error}</p>}
        {parties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {parties.map((party) => (
              <div
                key={party.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={`http://localhost:3001/${party.party_banner.replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt={`${party.party_name} Banner`}
                  className="w-full h-32 object-cover"
                />
                <div className="p-6 pb-2 flex flex-col items-center -mt-16">
                  <img
                    src={`http://localhost:3001/${party.party_logo.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt={`${party.party_name} Logo`}
                    className="w-24 h-24 object-contain rounded-full border-4 border-white bg-gray-100 shadow-md"
                  />
                  <h3 className="text-xl font-bold text-gray-800 mt-1">
                    {party.party_name}
                  </h3>

                  <div className="w-full mt-1">
                    {hasVoted ? (
                      // --- AFTER VOTING ---
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Total Votes</p>
                        <p className="font-bold text-blue-600 text-3xl">
                          {party.total_votes}
                        </p>
                      </div>
                    ) : (
                      // --- BEFORE VOTING ---
                      <button
                        onClick={() => handleVote(party.id)}
                        className="w-full bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Vote Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <p className="text-center text-gray-500">No parties found.</p>
          )
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
