import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState(null);
  const [message, setMessage] = useState('');

  const apiBaseUrl = 'http://localhost/poll-pulse'; // Adjust if your backend is on a different URL

  // Fetch banners from the backend
  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/banners/list`);
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setMessage('Failed to fetch banners.');
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    setNewBanner(e.target.files[0]);
  };

  // Handle banner upload
  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!newBanner) {
      setMessage('Please select a banner image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('banner', newBanner);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${apiBaseUrl}/api/banners/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      setMessage(response.data.message);
      setNewBanner(null);
      fetchBanners(); // Refresh the banner list
    } catch (error) {
      console.error('Error adding banner:', error);
      setMessage('Failed to add banner.');
    }
  };

  // Handle banner deletion
  const handleDeleteBanner = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${apiBaseUrl}/api/banners/delete/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        setMessage(response.data.message);
        fetchBanners(); // Refresh the banner list
      } catch (error) {
        console.error('Error deleting banner:', error);
        setMessage('Failed to delete banner.');
      }
    }
  };

  // Handle drag and drop for reordering
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBanners(items);

    const bannerIds = items.map((banner) => banner.id);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiBaseUrl}/api/banners/reorder`, { bannerIds }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (error) {
      console.error('Error reordering banners:', error);
      setMessage('Failed to save banner order.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Banners</h1>

      {message && <p className="mb-4 text-green-500">{message}</p>}

      {/* Add Banner Form */}
      <form onSubmit={handleAddBanner} className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Add New Banner</h2>
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Upload Banner
        </button>
      </form>

      {/* Banner List */}
      <h2 className="text-xl font-semibold mb-2">Current Banners</h2>
      <p className="mb-4">You can drag and drop the banners to reorder them.</p>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="banners">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {banners.map((banner, index) => (
                <Draggable key={banner.id} draggableId={String(banner.id)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center justify-between p-4 border rounded shadow"
                    >
                      <div className="flex items-center">
                        <img
                          src={`${apiBaseUrl}/${banner.image_path}`}
                          alt={`Banner ${banner.id}`}
                          className="w-32 h-16 object-cover mr-4"
                        />
                        <span>Order: {banner.display_order}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Delete
                      </button>
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
  );
};

export default BannerManager;