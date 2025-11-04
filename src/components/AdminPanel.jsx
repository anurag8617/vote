// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// function AdminPanel({ token, onLogout }) {
//   const navigate = useNavigate();
//   const [activeView, setActiveView] = useState("view");

//   // --- State for Add Form ---
//   const [partyName, setPartyName] = useState("");
//   const [partyLogo, setPartyLogo] = useState(null);
//   const [partyBanner, setPartyBanner] = useState(null);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // --- State for Displaying Parties ---
//   const [parties, setParties] = useState([]);
//   const [fetchError, setFetchError] = useState("");

//   // --- Modal & Editing State ---
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [currentParty, setCurrentParty] = useState(null);
//   const [editedPartyName, setEditedPartyName] = useState("");
//   const [editedPartyLogo, setEditedPartyLogo] = useState(null);
//   const [editedPartyBanner, setEditedPartyBanner] = useState(null);
//   const [editedTotalVotes, setEditedTotalVotes] = useState(0);

//   // --- State for Change Password ---
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordChangeMessage, setPasswordChangeMessage] = useState("");
//   const [passwordChangeError, setPasswordChangeError] = useState("");

//   // --- State for Site Settings ---
//   const [slogan, setSlogan] = useState("");
//   const [banner1, setBanner1] = useState(null);
//   const [banner2, setBanner2] = useState(null);
//   const [banner3, setBanner3] = useState(null);
//   const [settingsMessage, setSettingsMessage] = useState("");
//   const [settingsError, setSettingsError] = useState("");

//   // --- Fetch All Parties ---
//   const fetchParties = async () => {
//     try {
//       setFetchError("");
//       const response = await axios.get(
//         "http://localhost/poll-pulse/api/parties/list"
//       );
//       if (Array.isArray(response.data)) {
//         setParties(response.data);
//       } else {
//         setParties([]);
//         console.error("API did not return an array:", response.data);
//         setFetchError("Failed to load party data in the correct format.");
//       }
//     } catch (error) {
//       console.error("Failed to fetch parties:", error);
//       setFetchError("Could not load party data.");
//     }
//   };

//   // --- Fetch Site Settings ---
//   const fetchSettings = async () => {
//     try {
//       const response = await axios.get("http://localhost/poll-pulse/api/settings/get");
//       setSlogan(response.data.slogan);
//       // We don't set the banner files here, just the slogan
//     } catch (error) {
//       console.error("Failed to fetch settings:", error);
//     }
//   };

//   useEffect(() => {
//     fetchParties();
//     fetchSettings();
//   }, []);

//   const handleLogoutClick = () => {
//     onLogout();
//     navigate("/");
//   };

//   // --- DRAG AND DROP HANDLER ---
//   const onDragEnd = async (result) => {
//     const { destination, source } = result;
//     if (
//       !destination ||
//       (destination.droppableId === source.droppableId &&
//         destination.index === source.index)
//     ) {
//       return;
//     }
//     const reorderedParties = Array.from(parties);
//     const [movedParty] = reorderedParties.splice(source.index, 1);
//     reorderedParties.splice(destination.index, 0, movedParty);
//     setParties(reorderedParties);
//     try {
//       const partyIdsInOrder = reorderedParties.map((p) => p.id);
//       await axios.post(
//         "http://localhost/poll-pulse/api/parties/reorder.php",
//         { partyIds: partyIdsInOrder },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     } catch (err) {
//       console.error("Failed to reorder parties:", err);
//       fetchParties(); // Revert to original order if API fails
//     }
//   };

//   // --- Add Party Form Logic ---
//   const handleAddPartySubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");
//     setLoading(true);

//     const formData = new FormData();
//     formData.append("party_name", partyName);
//     formData.append("party_logo", partyLogo);
//     formData.append("party_banner", partyBanner);

//     try {
//       await axios.post(
//         "http://localhost/poll-pulse/api/parties/add",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setMessage("✅ Party added successfully!");
//       setPartyName("");
//       setPartyLogo(null);
//       setPartyBanner(null);
//       e.target.reset();
//       await fetchParties();
//       setActiveView("view");
//     } catch (err) {
//       setError("❌ Failed to add party. Your session may have expired.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- MODAL AND EDIT/DELETE HANDLERS ---
//   const openEditModal = (party) => {
//     setCurrentParty(party);
//     setEditedPartyName(party.party_name);
//     setEditedTotalVotes(party.total_votes);
//     setIsEditModalOpen(true);
//   };

//   const openDeleteModal = (party) => {
//     setCurrentParty(party);
//     setIsDeleteModalOpen(true);
//   };

//   const closeModals = () => {
//     setIsEditModalOpen(false);
//     setIsDeleteModalOpen(false);
//     setCurrentParty(null);
//     setEditedPartyName("");
//     setEditedPartyLogo(null);
//     setEditedPartyBanner(null);
//   };

//   // --- Update Party Logic ---
//   const handleUpdateParty = async (e) => {
//     e.preventDefault();
//     if (!currentParty) return;

//     const formData = new FormData();
//     formData.append("id", currentParty.id);
//     formData.append("party_name", editedPartyName);
//     formData.append("total_votes", editedTotalVotes);
//     if (editedPartyLogo) {
//       formData.append("party_logo", editedPartyLogo);
//     }
//     if (editedPartyBanner) {
//       formData.append("party_banner", editedPartyBanner);
//     }

//     try {
//       await axios.post(
//         `http://localhost/poll-pulse/api/parties/update`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       await fetchParties();
//       closeModals();
//     } catch (err) {
//       console.error("Failed to update party:", err);
//     }
//   };

//   // --- Delete Party Logic ---
//   const handleDeleteParty = async () => {
//     if (!currentParty) return;

//     try {
//       await axios.delete(
//         `http://localhost/poll-pulse/api/parties/delete/${currentParty.id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setParties(parties.filter((p) => p.id !== currentParty.id));
//       closeModals();
//     } catch (err) {
//       console.error("Failed to delete party:", err);
//     }
//   };

//   // --- Change Password Logic ---
//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     setPasswordChangeMessage("");
//     setPasswordChangeError("");

//     if (newPassword !== confirmPassword) {
//       setPasswordChangeError("New passwords do not match.");
//       return;
//     }

//     try {
//       await axios.post(
//         "http://localhost/poll-pulse/api/auth/change-password",
//         { currentPassword, newPassword },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPasswordChangeMessage("✅ Password changed successfully!");
//       setCurrentPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//     } catch (err) {
//       setPasswordChangeError(
//         "❌ Failed to change password. Please check your current password."
//       );
//     }
//   };

//   // --- Site Settings Logic ---
//   const handleSettingsSubmit = async (e) => {
//     e.preventDefault();
//     setSettingsMessage("");
//     setSettingsError("");
//     setLoading(true);

//     const formData = new FormData();
//     formData.append("slogan", slogan);
//     if (banner1) formData.append("banner1", banner1);
//     if (banner2) formData.append("banner2", banner2);
//     if (banner3) formData.append("banner3", banner3);

//     try {
//       await axios.post(
//         "http://localhost/poll-pulse/api/settings/update",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setSettingsMessage("✅ Settings updated successfully!");
//       // Reset file inputs
//       setBanner1(null);
//       setBanner2(null);
//       setBanner3(null);
//       e.target.reset();
//     } catch (err) {
//       setSettingsError("❌ Failed to update settings.");
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* ====== LEFT SIDEBAR ====== */}
//       <aside className="w-64 bg-white p-6 border-r flex flex-col justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-blue-600 mb-10">PollPulse</h1>
//           <nav className="space-y-2">
//             <button
//               onClick={() => setActiveView("view")}
//               className={`w-full text-left py-2.5 px-4 rounded transition duration-200 font-bold ${
//                 activeView === "view"
//                   ? "bg-blue-50 text-blue-600"
//                   : "hover:bg-gray-100"
//               }`}
//             >
//               View Parties
//             </button>
//             <button
//               onClick={() => setActiveView("add")}
//               className={`w-full text-left py-2.5 px-4 rounded transition duration-200 font-bold ${
//                 activeView === "add"
//                   ? "bg-blue-50 text-blue-600"
//                   : "hover:bg-gray-100"
//               }`}
//             >
//               Add New Party
//             </button>
//             <button
//               onClick={() => setActiveView("settings")}
//               className={`w-full text-left py-2.5 px-4 rounded transition duration-200 font-bold ${
//                 activeView === "settings"
//                   ? "bg-blue-50 text-blue-600"
//                   : "hover:bg-gray-100"
//               }`}
//             >
//               Site Settings
//             </button>
//             <button
//               onClick={() => setActiveView("changePassword")}
//               className={`w-full text-left py-2.5 px-4 rounded transition duration-200 font-bold ${
//                 activeView === "changePassword"
//                   ? "bg-blue-50 text-blue-600"
//                   : "hover:bg-gray-100"
//               }`}
//             >
//               Change Password
//             </button>
//           </nav>
//         </div>
//         <div className="text-center">
//           <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
//             <h2 className="text-lg font-bold text-green-800">✓ Logged In</h2>
//             <p className="text-gray-600 mt-1 text-sm">Welcome, Admin!</p>
//           </div>
//           <button
//             onClick={handleLogoutClick}
//             className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
//           >
//             Logout
//           </button>
//         </div>
//       </aside>

//       {/* ====== RIGHT MAIN CONTENT ====== */}
//       <main className="flex-grow p-8">
//         {/* View Parties */}
//         {activeView === "view" && (
//           <div className="bg-white p-8 rounded-lg shadow-lg">
//             <div className="mb-6 text-center">
//               <h2 className="text-3xl font-bold text-gray-800">
//                 Manage & Reorder Parties
//               </h2>
//               <p className="text-gray-500 mt-1">
//                 Drag and drop the parties to change their order on the voting
//                 page.
//               </p>
//             </div>

//             <DragDropContext onDragEnd={onDragEnd}>
//               <Droppable droppableId="parties">
//                 {(provided) => (
//                   <div
//                     {...provided.droppableProps}
//                     ref={provided.innerRef}
//                     className="max-w-3xl mx-auto space-y-3"
//                   >
//                     {parties.map((party, index) => (
//                       <Draggable
//                         key={party.id}
//                         draggableId={String(party.id)}
//                         index={index}
//                       >
//                         {(provided) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             className="bg-gray-50 rounded-lg shadow-md p-3 flex items-center justify-between"
//                           >
//                             <div className="flex items-center flex-grow">
//                               <span className="text-gray-400 font-bold mr-4">
//                                 #{index + 1}
//                               </span>
//                               <img
//                                 src={`http://localhost/poll-pulse/api/${party.party_logo.replace(
//                                   /\\/g,
//                                   "/"
//                                 )}`}
//                                 alt={`${party.party_name} Logo`}
//                                 className="w-12 h-12 object-contain rounded-full border-2 mr-4"
//                               />
//                               <div>
//                                 <h3 className="text-lg font-bold text-gray-800">
//                                   {party.party_name}
//                                 </h3>
//                                 <p className="text-sm text-gray-500">
//                                   Votes:{" "}
//                                   <span className="font-bold text-blue-600">
//                                     {party.total_votes}
//                                   </span>
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="space-x-2">
//                               <button
//                                 onClick={() => openEditModal(party)}
//                                 className="bg-yellow-500 text-white font-bold py-1 px-3 rounded hover:bg-yellow-600"
//                               >
//                                 Edit
//                               </button>
//                               <button
//                                 onClick={() => openDeleteModal(party)}
//                                 className="bg-red-600 text-white font-bold py-1 px-3 rounded hover:bg-red-700"
//                               >
//                                 Delete
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </Draggable>
//                     ))}
//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             </DragDropContext>
//           </div>
//         )}
//         {activeView === "add" && (
//           <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
//             <h2 className="text-3xl font-bold mb-6 text-gray-800">
//               Add New Party
//             </h2>
//             <form onSubmit={handleAddPartySubmit} className="space-y-6">
//               <div>
//                 <label
//                   htmlFor="partyName"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Party Name
//                 </label>
//                 <input
//                   type="text"
//                   id="partyName"
//                   value={partyName}
//                   onChange={(e) => setPartyName(e.target.value)}
//                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//                   placeholder="Enter the party's official name"
//                   required
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="partyLogo"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Upload Party Logo
//                 </label>
//                 <input
//                   type="file"
//                   id="partyLogo"
//                   onChange={(e) => setPartyLogo(e.target.files[0])}
//                   className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                   required
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="partyBanner"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Upload Party Banner
//                 </label>
//                 <input
//                   type="file"
//                   id="partyBanner"
//                   onChange={(e) => setPartyBanner(e.target.files[0])}
//                   className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                   required
//                 />
//               </div>

//               {message && (
//                 <div className="text-green-600 text-sm font-medium text-center bg-green-100 p-3 rounded-lg">
//                   {message}
//                 </div>
//               )}
//               {error && (
//                 <div className="text-red-600 text-sm font-medium text-center bg-red-100 p-3 rounded-lg">
//                   {error}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 ${
//                   loading
//                     ? "bg-blue-300 cursor-not-allowed"
//                     : "bg-blue-600 hover:bg-blue-700"
//                 }`}
//               >
//                 {loading ? "Adding Party..." : "Add Party"}
//               </button>
//             </form>
//           </div>
//         )}

//         {/* Site Settings */}
//         {activeView === "settings" && (
//           <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
//             <h2 className="text-3xl font-bold mb-6 text-gray-800">
//               Site Settings
//             </h2>
//             <form onSubmit={handleSettingsSubmit} className="space-y-6">
//               <div>
//                 <label
//                   htmlFor="slogan"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Slogan
//                 </label>
//                 <input
//                   type="text"
//                   id="slogan"
//                   value={slogan}
//                   onChange={(e) => setSlogan(e.target.value)}
//                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//                   placeholder="Enter the site slogan"
//                   required
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="banner1"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Upload Banner 1
//                 </label>
//                 <input
//                   type="file"
//                   id="banner1"
//                   onChange={(e) => setBanner1(e.target.files[0])}
//                   className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                 />
//               </div>
              
//               <div>
//                 <label
//                   htmlFor="banner2"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Upload Banner 2
//                 </label>
//                 <input
//                   type="file"
//                   id="banner2"
//                   onChange={(e) => setBanner2(e.target.files[0])}
//                   className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="banner3"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Upload Banner 3
//                 </label>
//                 <input
//                   type="file"
//                   id="banner3"
//                   onChange={(e) => setBanner3(e.target.files[0])}
//                   className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                 />
//               </div>

//               {settingsMessage && (
//                 <div className="text-green-600 text-sm font-medium text-center bg-green-100 p-3 rounded-lg">
//                   {settingsMessage}
//                 </div>
//               )}
//               {settingsError && (
//                 <div className="text-red-600 text-sm font-medium text-center bg-red-100 p-3 rounded-lg">
//                   {settingsError}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 ${
//                   loading
//                     ? "bg-blue-300 cursor-not-allowed"
//                     : "bg-blue-600 hover:bg-blue-700"
//                 }`}
//               >
//                 {loading ? "Updating Settings..." : "Update Settings"}
//               </button>
//             </form>
//           </div>
//         )}

//         {activeView === "changePassword" && (
//           <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
//             <h2 className="text-3xl font-bold mb-6 text-gray-800">
//               Change Admin Password
//             </h2>
//             <form onSubmit={handleChangePassword} className="space-y-6">
//               <div>
//                 <label
//                   htmlFor="currentPassword"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Current Password
//                 </label>
//                 <input
//                   type="password"
//                   id="currentPassword"
//                   value={currentPassword}
//                   onChange={(e) => setCurrentPassword(e.target.value)}
//                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//                   placeholder="Enter your current password"
//                   required
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="newPassword"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   New Password
//                 </label>
//                 <input
//                   type="password"
//                   id="newPassword"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//                   placeholder="Enter your new password"
//                   required
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="confirmPassword"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Confirm New Password
//                 </label>
//                 <input
//                   type="password"
//                   id="confirmPassword"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//                   placeholder="Confirm your new password"
//                   required
//                 />
//               </div>

//               {passwordChangeMessage && (
//                 <div className="text-green-600 text-sm font-medium text-center bg-green-100 p-3 rounded-lg">
//                   {passwordChangeMessage}
//                 </div>
//               )}
//               {passwordChangeError && (
//                 <div className="text-red-600 text-sm font-medium text-center bg-red-100 p-3 rounded-lg">
//                   {passwordChangeError}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 className="w-full py-3 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200"
//               >
//                 Change Password
//               </button>
//             </form>
//           </div>
//         )}
//       </main>

//       {/* ====== MODALS ====== */}
//       {isEditModalOpen && (
//         <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-gray-200 p-6 rounded-lg shadow-xl w-full max-w-md">
//             <h3 className="text-xl font-bold mb-4">Edit Party</h3>
//             <form onSubmit={handleUpdateParty} className="space-y-4">
//               <div>
//                 <label
//                   htmlFor="editPartyName"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Party Name
//                 </label>
//                 <input
//                   type="text"
//                   id="editPartyName"
//                   value={editedPartyName}
//                   onChange={(e) => setEditedPartyName(e.target.value)}
//                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//                   required
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="editTotalVotes"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Total Votes
//                 </label>
//                 <input
//                   type="number"
//                   id="editTotalVotes"
//                   value={editedTotalVotes}
//                   onChange={(e) =>
//                     setEditedTotalVotes(parseInt(e.target.value, 10))
//                   }
//                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//                   required
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="editPartyLogo"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Upload New Logo (Optional)
//                 </label>
//                 <input
//                   type="file"
//                   id="editPartyLogo"
//                   onChange={(e) => setEditedPartyLogo(e.target.files[0])}
//                   className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="editPartyBanner"
//                   className="block mb-2 font-bold text-gray-700"
//                 >
//                   Upload New Banner (Optional)
//                 </label>
//                 <input
//                   type="file"
//                   id="editPartyBanner"
//                   onChange={(e) => setEditedPartyBanner(e.target.files[0])}
//                   className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                 />
//               </div>

//               <div className="flex justify-end space-x-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={closeModals}
//                   className="bg-gray-300 py-2 px-6 rounded-lg hover:bg-gray-400 font-semibold"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-semibold"
//                 >
//                   Update Party
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {isDeleteModalOpen && (
//         <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-gray-200 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
//             <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
//             <p className="mb-6">
//               Are you sure you want to delete the party "
//               <strong>{currentParty?.party_name}</strong>"? This action cannot
//               be undone.
//             </p>
//             <div className="flex justify-center space-x-4">
//               <button
//                 onClick={closeModals}
//                 className="bg-gray-300 py-2 px-6 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteParty}
//                 className="bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AdminPanel;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function AdminPanel({ token, onLogout }) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("view");

  // --- State for Add Form ---
  const [partyName, setPartyName] = useState("");
  const [partyLogo, setPartyLogo] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateImage, setCandidateImage] = useState(null);
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
  const [editedTotalVotes, setEditedTotalVotes] = useState(0); // --- RE-ADDED ---
  const [editedCandidateName, setEditedCandidateName] = useState("");
  const [editedCandidateImage, setEditedCandidateImage] = useState(null);

  // --- State for Change Password ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");

  // --- State for Site Settings ---
  const [slogan, setSlogan] = useState("");
  const [banner1, setBanner1] = useState(null);
  const [banner2, setBanner2] = useState(null);
  const [banner3, setBanner3] = useState(null);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsError, setSettingsError] = useState("");

  // --- Fetch All Parties ---
  const fetchParties = async () => {
    try {
      setFetchError("");
      const response = await axios.get(
        "http://localhost/poll-pulse/api/parties/list"
      );
      if (Array.isArray(response.data)) {
        setParties(response.data);
      } else {
        setParties([]);
        console.error("API did not return an array:", response.data);
        setFetchError("Failed to load party data in the correct format.");
      }
    } catch (error) {
      console.error("Failed to fetch parties:", error);
      setFetchError("Could not load party data.");
    }
  };

  // --- Fetch Site Settings ---
  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        "http://localhost/poll-pulse/api/settings/get"
      );
      setSlogan(response.data.slogan);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  useEffect(() => {
    fetchParties();
    fetchSettings();
  }, []);

  const handleLogoutClick = () => {
    onLogout();
    navigate("/");
  };

  // --- DRAG AND DROP HANDLER ---
  const onDragEnd = async (result) => {
    const { destination, source } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }
    const reorderedParties = Array.from(parties);
    const [movedParty] = reorderedParties.splice(source.index, 1);
    reorderedParties.splice(destination.index, 0, movedParty);
    setParties(reorderedParties);
    try {
      const partyIdsInOrder = reorderedParties.map((p) => p.id);
      await axios.post(
        "http://localhost/poll-pulse/api/parties/reorder.php",
        { partyIds: partyIdsInOrder },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to reorder parties:", err);
      fetchParties(); // Revert to original order if API fails
    }
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
    formData.append("candidate_name", candidateName);
    formData.append("candidate_image", candidateImage);

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
      setCandidateName("");
      setCandidateImage(null);
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
    setEditedTotalVotes(party.total_votes); // --- RE-ADDED ---
    setEditedCandidateName(party.candidate_name);
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
    setEditedCandidateName("");
    setEditedCandidateImage(null);
    setEditedTotalVotes(0); // --- RE-ADDED ---
  };

  // --- Update Party Logic ---
  const handleUpdateParty = async (e) => {
    e.preventDefault();
    if (!currentParty) return;

    const formData = new FormData();
    formData.append("id", currentParty.id);
    formData.append("party_name", editedPartyName);
    formData.append("total_votes", editedTotalVotes); // --- RE-ADDED ---
    if (editedPartyLogo) {
      formData.append("party_logo", editedPartyLogo);
    }
    formData.append("candidate_name", editedCandidateName);
    if (editedCandidateImage) {
      formData.append("candidate_image", editedCandidateImage);
    }

    try {
      const response = await axios.post(
        `http://localhost/poll-pulse/api/parties/update`,
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
      // --- CHANGED ---
      // Display the error message from the backend (e.g., "Cannot set votes lower than real votes")
      if (err.response && err.response.data && err.response.data.message) {
        alert("Error: " + err.response.data.message);
      } else {
        console.error("Failed to update party:", err);
        alert("An unknown error occurred while updating.");
      }
      // --- END CHANGE ---
    }
  };

  // --- Delete Party Logic ---
  const handleDeleteParty = async () => {
    if (!currentParty) return;

    try {
      await axios.delete(
        `http://localhost/poll-pulse/api/parties/delete/${currentParty.id}`,
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
        "http://localhost/poll-pulse/api/auth/change-password",
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

  // --- Site Settings Logic ---
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsMessage("");
    setSettingsError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("slogan", slogan);
    if (banner1) formData.append("banner1", banner1);
    if (banner2) formData.append("banner2", banner2);
    if (banner3) formData.append("banner3", banner3);

    try {
      await axios.post(
        "http://localhost/poll-pulse/api/settings/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSettingsMessage("✅ Settings updated successfully!");
      setBanner1(null);
      setBanner2(null);
      setBanner3(null);
      e.target.reset();
    } catch (err) {
      setSettingsError("❌ Failed to update settings.");
    } finally {
      setLoading(false);
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
              onClick={() => setActiveView("settings")}
              className={`w-full text-left py-2.5 px-4 rounded transition duration-200 font-bold ${
                activeView === "settings"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              Site Settings
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
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-gray-800">
                Manage & Reorder Parties
              </h2>
              <p className="text-gray-500 mt-1">
                Drag and drop the parties to change their order on the voting
                page.
              </p>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="parties">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="max-w-3xl mx-auto space-y-3"
                  >
                    {parties.map((party, index) => (
                      <Draggable
                        key={party.id}
                        draggableId={String(party.id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-50 rounded-lg shadow-md p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center flex-grow">
                              <span className="text-gray-400 font-bold mr-4">
                                #{index + 1}
                              </span>
                              <img
                                src={`http://localhost/poll-pulse/api/${party.party_logo.replace(
                                  /\\/g,
                                  "/"
                                )}`}
                                alt={`${party.party_name} Logo`}
                                className="w-12 h-12 object-contain rounded-full border-2 mr-2"
                              />
                              <img
                                src={`http://localhost/poll-pulse/api/${party.candidate_image.replace(
                                  /\\/g,
                                  "/"
                                )}`}
                                alt={`${party.candidate_name} Photo`}
                                className="w-12 h-12 object-cover rounded-full border-2 mr-4"
                              />
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                  {party.party_name}
                                </h3>
                                <p className="text-md text-gray-600">
                                  {party.candidate_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Votes:{" "}
                                  <span className="font-bold text-blue-600">
                                    {party.total_votes}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="space-x-2">
                              <button
                                onClick={() => openEditModal(party)}
                                className="bg-yellow-500 text-white font-bold py-1 px-3 rounded hover:bg-yellow-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(party)}
                                className="bg-red-600 text-white font-bold py-1 px-3 rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
        {/* Add Party */}
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  placeholder="Enter the party's official name"
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
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="candidateName"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Candidate Name
                </label>
                <input
                  type="text"
                  id="candidateName"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  placeholder="Enter the candidate's name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="candidateImage"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Upload Candidate Image
                </label>
                <input
                  type="file"
                  id="candidateImage"
                  onChange={(e) => setCandidateImage(e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>
              {message && (
                <div className="text-green-600 text-sm font-medium text-center bg-green-100 p-3 rounded-lg">
                  {message}
                </div>
              )}
              {error && (
                <div className="text-red-600 text-sm font-medium text-center bg-red-100 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Adding Party..." : "Add Party"}
              </button>
            </form>
          </div>
        )}

        {/* Site Settings */}
        {activeView === "settings" && (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Site Settings
            </h2>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="slogan"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Slogan
                </label>
                <input
                  type="text"
                  id="slogan"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  placeholder="Enter the site slogan"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="banner1"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Upload Banner 1
                </label>
                <input
                  type="file"
                  id="banner1"
                  onChange={(e) => setBanner1(e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="banner2"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Upload Banner 2
                </label>
                <input
                  type="file"
                  id="banner2"
                  onChange={(e) => setBanner2(e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="banner3"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Upload Banner 3
                </label>
                <input
                  type="file"
                  id="banner3"
                  onChange={(e) => setBanner3(e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {settingsMessage && (
                <div className="text-green-600 text-sm font-medium text-center bg-green-100 p-3 rounded-lg">
                  {settingsMessage}
                </div>
              )}
              {settingsError && (
                <div className="text-red-600 text-sm font-medium text-center bg-red-100 p-3 rounded-lg">
                  {settingsError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Updating Settings..." : "Update Settings"}
              </button>
            </form>
          </div>
        )}

        {/* Change Password */}
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  placeholder="Enter your current password"
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  placeholder="Enter your new password"
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  placeholder="Confirm your new password"
                  required
                />
              </div>

              {passwordChangeMessage && (
                <div className="text-green-600 text-sm font-medium text-center bg-green-100 p-3 rounded-lg">
                  {passwordChangeMessage}
                </div>
              )}
              {passwordChangeError && (
                <div className="text-red-600 text-sm font-medium text-center bg-red-100 p-3 rounded-lg">
                  {passwordChangeError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200"
              >
                Change Password
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ====== MODALS ====== */}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-200 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Party</h3>
            <form onSubmit={handleUpdateParty} className="space-y-4">
              <div>
                <label
                  htmlFor="editPartyName"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Party Name
                </label>
                <input
                  type="text"
                  id="editPartyName"
                  value={editedPartyName}
                  onChange={(e) => setEditedPartyName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  required
                />
              </div>

              {/* --- CHANGED --- (RE-ENABLED INPUT) */}
              <div>
                <label
                  htmlFor="editTotalVotes"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Total Votes
                </label>
                <input
                  type="number"
                  id="editTotalVotes"
                  value={editedTotalVotes}
                  onChange={(e) =>
                    setEditedTotalVotes(parseInt(e.target.value, 10))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  required
                />
              </div>
              {/* --- END CHANGE --- */}

              <div>
                <label
                  htmlFor="editPartyLogo"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Upload New Logo (Optional)
                </label>
                <input
                  type="file"
                  id="editPartyLogo"
                  onChange={(e) => setEditedPartyLogo(e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="editCandidateName"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Candidate Name
                </label>
                <input
                  type="text"
                  id="editCandidateName"
                  value={editedCandidateName}
                  onChange={(e) => setEditedCandidateName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="editCandidateImage"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Upload New Candidate Image (Optional)
                </label>
                <input
                  type="file"
                  id="editCandidateImage"
                  onChange={(e) => setEditedCandidateImage(e.target.files[0])}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-300 py-2 px-6 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Update Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-200 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
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