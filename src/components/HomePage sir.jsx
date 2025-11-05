import React, { useState, useEffect } from "react";
import axios from "axios";
import bg from "../assets/bg.png";
import { FaArrowLeft } from "react-icons/fa";
import share from "../assets/icons8-share (1).svg";
import { API_URL } from "./urls";

function HomePage() {
  const [parties, setParties] = useState([]);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(
    localStorage.getItem("hasVoted") === "true"
  );
  // --- CHANGED ---
  // Store the ID of the party that was voted for
  const [votedPartyId, setVotedPartyId] = useState(
    localStorage.getItem("votedPartyId")
  );
  // --- END CHANGE ---

  const fetchParties = async () => {
    try {
      const response = await axios.get(API_URL + "/parties/list");
      if (Array.isArray(response.data)) {
        setParties(response.data);
      } else {
        setError("Invalid data format from API.");
        setParties([]);
      }
    } catch (error) {
      console.error(error);
      setError("Could not load party data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleVote = async (partyId) => {
    if (localStorage.getItem("hasVoted") === "true") {
      alert("आप पहले ही वोट दे चुके हैं!");
      return;
    }

    try {
      await axios.put(API_URL + `/parties/vote/${party_name}`);
      // --- CHANGED ---
      // Save that the user has voted
      localStorage.setItem("hasVoted", "true");
      // Save *which* party they voted for
      localStorage.setItem("votedPartyId", party_name);
      setHasVoted(true);
      // Set the voted party ID in state
      setVotedPartyId(partyId);
      // --- END CHANGE ---

      await fetchParties();
      alert("धन्यवाद! आपका वोट दर्ज कर लिया गया है।");
    } catch (err) {
      if (err.response?.status === 403) {
        alert(
          err.response.data.message ||
            "आप पहले ही इस डिवाइस से वोट दे चुके हैं।"
        );
        localStorage.setItem("hasVoted", "true");
        setHasVoted(true);
      } else {
        alert("कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।");
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-100 to-white min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1E3A8A] text-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold tracking-wide">🗳️ PollPulse</h1>
          <div className="text-sm opacity-90">Voice of the People</div>
        </nav>
      </header>

      {/* Marquee */}
      <div className="bg-[#FEF3C7] text-center py-2 text-xl font-medium text-gray-800">
        <marquee scrollamount="6">
          📢 पहले अपना वोट दें, फिर देखिए कौन आगे है!
        </marquee>
      </div>

      {/* Title Section */}
      <section
        className="relative py-10 text-center text-white shadow-lg overflow-hidden"
        style={{
          backgroundImage: `
    linear-gradient(rgba(30, 58, 138, 0.9), rgba(29, 78, 216, 0.9)),
    url('https://upload.wikimedia.org/wikipedia/commons/4/4e/India_Bihar_locator_map.svg')
  `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Bihar Map Overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover", // fills entire section
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "100%",
            height: "100%",
            opacity: 0.25,
            mixBlendMode: "screen",
          }}
        ></div>

        <div className="relative z-10 px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wide drop-shadow-md">
            🗳️ नाथ नगर भागलपुर बिहार चुनाव
          </h2>
          <p className="mt-3 text-blue-100 text-sm sm:text-base max-w-lg mx-auto">
            अपने पसंदीदा उम्मीदवार को वोट दें और लोकतंत्र को मज़बूत बनाएं।
          </p>
          <div className="mt-5 mx-auto w-24 h-1  rounded-full"></div>
        </div>
      </section>

      {/* Main Content */}
      <main
        className="flex-1 container mx-auto px-3 sm:px-6 py-6"
        style={{
          borderRadius: "20px 20px 0 0",
        }}
      >
        {error && (
          <p className="text-center text-red-500 text-sm mb-4">{error}</p>
        )}
        {!error && parties.length === 0 && (
          <p className="text-center text-gray-500 text-sm">
            Loading parties...
          </p>
        )}

        {/* Party Cards */}
        <div className="grid gap-6 m-4 mt-6 ">
          {parties.map((party) => (
            <div
              key={party.id}
              className="relative bg-white rounded-xl shadow-md border border-gray-200 mb-12 hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: "20px 20px 0 20px",
              }}
            >
              {/* Candidate Image */}
              <img
                src={API_URL + `/${party.candidate_image.replace(/\\/g, "/")}`}
                alt={party.candidate_name}
                className="w-full h-56 object-cover"
                style={{
                  borderRadius: "20px 20px 0 0",
                }}
              />

              {/* Party Logo - overlapping half inside and half outside */}
              <div className="absolute  left-4 w-25 h-25 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white glow-float">
                <img
                  onClick={() => handleVote(party.id)}
                  src={API_URL + `/${party.party_logo.replace(/\\/g, "/")}`}
                  alt={party.party_name}
                  className="w-full h-full object-contain "
                />
              </div>

              {/* Bottom Bar */}
              <div
                className="flex justify-end items-center px-5 py-2 "
                style={{
                  backgroundColor: "#1e3a8a",
                  borderRadius: "0 0 0 20px",
                }}
              >
                {hasVoted ? (
                  <div className="text-right flex items-center">
                    <p className="text-xl text-gray-100 mr-2">Votes:</p>
                    <p className="text-2xl font-bold text-gray-100">
                      {party.total_votes}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xl text-gray-100 mr-2 flex items-center gap-2 arrow-bounce ">
                      <FaArrowLeft /> Click To Vote
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      {/* Floating Share Button */}
      <button
        onClick={() => {
          const shareData = {
            title: "PollPulse",
            text: "Check out this voting poll for Nath Nagar Bhagalpur Bihar Election!",
            url: window.location.href,
          };

          if (navigator.share) {
            navigator.share(shareData).catch(console.error);
          } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          }
        }}
        className="fixed bottom-6 right-6 bg-[#157e00] hover:bg-[#ff9100] text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-transform transform hover:scale-110 z-50 animate-shine-float"
      >
        <img
          src={share}
          alt="Share"
          className="w-10 h-10 filter brightness-0 invert"
        />
      </button>

      {/* Footer */}
      {/* Footer (Mobile Responsive) */}
      <footer
        className="relative text-center py-6 mt-8 text-white sm:py-10"
        style={{
          backgroundImage: `
    linear-gradient(rgba(30, 58, 138, 0.85), rgba(30, 58, 138, 0.85)),
    url('https://thecsrjournal.in/wp-content/uploads/2025/06/Bihar-Election.webp')
  `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-xs mx-auto px-4">
          <button
            className=" bg-white/60 text-[#1E3A8A] font-semibold px-4 py-2 rounded-full shadow-md hover:bg-white active:scale-95 transition-transform duration-300"
            onClick={() => (window.location.href = "/contact")}
          >
            हमसे जुड़ें
          </button>

          <p className="text-xs sm:text-sm text-gray-200 mt-4 leading-relaxed">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white">PollPulse</span> · All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
