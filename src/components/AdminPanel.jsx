import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminPanel({ token, onLogout }) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("view");

  // --- State for Add Form ---
  const [partyName, setPartyName] = useState("");
  const [partyLogo, setPartyLogo] = useState(null);
  const [partyBanner, setPartyBanner] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- State for Displaying Parties ---
  const [parties, setParties] = useState([]);
  const [fetchError, setFetchError] = useState("");

  // --- Modal & Editing State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentParty, setCurrentParty] = useState(null);
  const [editedPartyName, setEditedPartyName] = useState("");
  const [editedPartyLogo, setEditedPartyLogo] = useState(null);
  const [editedPartyBanner, setEditedPartyBanner] = useState(null);
  const [editedTotalVotes, setEditedTotalVotes] = useState(0);

  // --- State for Change Password ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");

  // --- Fetch All Parties ---
  const fetchParties = async () => {
    try {
      setFetchError("");
      const response = await axios.get(
        "http://localhost/poll-pulse/api/parties/list"
      );
      setParties(response.data);
    } catch (error) {
      console.error("Failed to fetch parties:", error);
      setFetchError("Could not load party data.");
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleLogoutClick = () => {
    onLogout();
    navigate("/");
  };

  // --- Add Party Form Logic ---
  const handleAddPartySubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

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
      setMessage("✅ Party added successfully!");
      setPartyName("");
      setPartyLogo(null);
      setPartyBanner(null);
      e.target.reset();
      await fetchParties();
      setActiveView("view");
    } catch (err) {
      setError("❌ Failed to add party. Your session may have expired.");
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL AND EDIT/DELETE HANDLERS ---
  const openEditModal = (party) => {
    setCurrentParty(party);
    setEditedPartyName(party.party_name);
    setEditedTotalVotes(party.total_votes);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (party) => {
    setCurrentParty(party);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentParty(null);
    setEditedPartyName("");
    setEditedPartyLogo(null);
    setEditedPartyBanner(null);
  };

  // --- Update Party Logic ---
  const handleUpdateParty = async (e) => {
    e.preventDefault();
    if (!currentParty) return;

    const formData = new FormData();
    formData.append("party_name", editedPartyName);
    formData.append("total_votes", editedTotalVotes);
    if (editedPartyLogo) {
      formData.append("party_logo", editedPartyLogo);
    }
    if (editedPartyBanner) {
      formData.append("party_banner", editedPartyBanner);
    }

    try {
      await axios.put(
        `http://localhost/poll-pulse/api/parties/list/${currentParty.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchParties();
      closeModals();
    } catch (err) {
      console.error("Failed to update party:", err);
      // You can add an error message inside the modal
    }
  };

  // --- Delete Party Logic ---
  const handleDeleteParty = async () => {
    if (!currentParty) return;

    try {
      await axios.delete(
        `http://localhost/poll-pulse/api/parties/list/${currentParty.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParties(parties.filter((p) => p.id !== currentParty.id));
      closeModals();
    } catch (err) {
      console.error("Failed to delete party:", err);
    }
  };

  // --- Change Password Logic ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordChangeMessage("");
    setPasswordChangeError("");

    if (newPassword !== confirmPassword) {
      setPasswordChangeError("New passwords do not match.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/api/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordChangeMessage("✅ Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordChangeError(
        "❌ Failed to change password. Please check your current password."
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ====== LEFT SIDEBAR ====== */}
      <aside className="w-64 bg-white p-6 border-r flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 mb-10">PollPulse</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveView("view")}
              className={`w-full text-left py-2.5 px-4 rounded transition duration-200 font-bold ${
                activeView === "view"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              View Parties
            </button>
            <button
              onClick={() => setActiveView("add")}
              className={`w-full text-left py-2.5 px-4 rounded transition duration-200 font-bold ${
                activeView === "add"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              Add New Party
            </button>
            <button
              onClick={() => setActiveView("changePassword")}
              className={`w-full text-left py-2.5 px-4 rounded transition duration-200 font-bold ${
                activeView === "changePassword"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>
        <div className="text-center">
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-bold text-green-800">✓ Logged In</h2>
            <p className="text-gray-600 mt-1 text-sm">Welcome, Admin!</p>
          </div>
          <button
            onClick={handleLogoutClick}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ====== RIGHT MAIN CONTENT ====== */}
      <main className="flex-grow p-8">
        {/* View Parties */}
        {activeView === "view" && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Existing Parties
            </h2>
            {fetchError && (
              <p className="text-center text-red-500">{fetchError}</p>
            )}
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              {parties.length > 0 ? (
                parties.map((party) => (
                  <div
                    key={party.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                  >
                    <div className="flex items-center">
                      <img
                        src={`http://localhost:3001/${party.party_logo.replace(
                          /\\/g,
                          "/"
                        )}`}
                        alt={`${party.party_name} Logo`}
                        className="w-12 h-12 object-contain mr-4 rounded-full"
                      />
                      <span className="font-semibold text-gray-700">
                        {party.party_name}
                      </span>
                      <span className="ml-4 text-gray-500">
                        (Votes: {party.total_votes})
                      </span>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => openEditModal(party)}
                        className="bg-yellow-500 text-white font-bold py-1 px-3 rounded hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(party)}
                        className="bg-red-600 text-white font-bold py-1 px-3 rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No parties have been added yet.
                </p>
              )}
            </div>
          </div>
        )}
        {activeView === "add" && (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Add New Party
            </h2>
            <form onSubmit={handleAddPartySubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="partyName"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Party Name
                </label>
                <input
                  type="text"
                  id="partyName"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div>
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
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  accept="image/*"
                  required
                />
              </div>
              <div>
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
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  accept="image/*"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Adding..." : "Add Party"}
              </button>
            </form>
            {message && (
              <p className="mt-4 text-center text-green-600 font-medium">
                {message}
              </p>
            )}
            {error && (
              <p className="mt-4 text-center text-red-600 font-medium">
                {error}
              </p>
            )}
          </div>
        )}
        {/* Change Password View */}
        {activeView === "changePassword" && (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Change Admin Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block mb-2 font-bold text-gray-700"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Change Password
              </button>
            </form>
            {passwordChangeMessage && (
              <p className="mt-4 text-center text-green-600 font-medium">
                {passwordChangeMessage}
              </p>
            )}
            {passwordChangeError && (
              <p className="mt-4 text-center text-red-600 font-medium">
                {passwordChangeError}
              </p>
            )}
          </div>
        )}
      </main>

      {/* ====== MODALS ====== */}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Party</h3>
            <form onSubmit={handleUpdateParty} className="space-y-4">
              <div>
                <label
                  htmlFor="editedPartyName"
                  className="block font-medium mb-1"
                >
                  Party Name
                </label>
                <input
                  id="editedPartyName"
                  type="text"
                  value={editedPartyName}
                  onChange={(e) => setEditedPartyName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="editedTotalVotes"
                  className="block font-medium mb-1"
                >
                  Total Votes
                </label>
                <input
                  id="editedTotalVotes"
                  type="number"
                  value={editedTotalVotes}
                  onChange={(e) => setEditedTotalVotes(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="editedPartyLogo"
                  className="block font-medium mb-1"
                >
                  New Party Logo (Optional)
                </label>
                <input
                  id="editedPartyLogo"
                  type="file"
                  onChange={(e) => setEditedPartyLogo(e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label
                  htmlFor="editedPartyBanner"
                  className="block font-medium mb-1"
                >
                  New Party Banner (Optional)
                </label>
                <input
                  id="editedPartyBanner"
                  type="file"
                  onChange={(e) => setEditedPartyBanner(e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-center">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the party "
              <strong>{currentParty?.party_name}</strong>"? This action cannot
              be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeModals}
                className="bg-gray-300 py-2 px-6 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteParty}
                className="bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
