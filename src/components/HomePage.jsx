import React, { useState, useEffect } from "react";
import axios from "axios";
import bg from "../assets/bg.png";

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
      await axios.put(
        `http://localhost/poll-pulse/api/parties/vote/${partyId}`
      );
      localStorage.setItem("hasVoted", "true");
      setHasVoted(true);
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
      <div className="bg-[#FEF3C7] text-center py-2 text-sm font-medium text-gray-800">
        <marquee scrollamount="6">📢 आवाज आपकी, न्याय सबका</marquee>
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
      <main className="flex-1 container mx-auto px-3 sm:px-6 py-6">
        {error && (
          <p className="text-center text-red-500 text-sm mb-4">{error}</p>
        )}
        {!error && parties.length === 0 && (
          <p className="text-center text-gray-500 text-sm">
            Loading parties...
          </p>
        )}

        {/* Party Cards */}
        <div className="flex flex-col gap-5 mt-6">
          {parties.map((party) => (
            <div
              key={party.party_name}
              className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-4 hover:shadow-lg hover:border-[#3B82F6] transition-all duration-300"
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gray-300 bg-white overflow-hidden flex-shrink-0 shadow-sm">
                  <img
                    src={`http://localhost/poll-pulse/api/${party.party_logo.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt={`${party.party_name} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight">
                    {party.party_name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {hasVoted
                      ? "आपका वोट दर्ज हो चुका है"
                      : "अपने पसंदीदा पार्टी को वोट दें"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {hasVoted ? (
                  <div>
                    <p className="text-xs text-gray-500">कुल वोट</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#1D4ED8] tracking-wide">
                      {party.total_votes}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVote(party.id)}
                    className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white font-semibold text-sm sm:text-base px-5 sm:px-7 py-2.5 rounded-full shadow-md hover:from-[#1D4ED8] hover:to-[#3730A3] active:scale-95 transition-transform duration-200"
                  >
                    वोट दें
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

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
