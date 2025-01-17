import React, { useState, useEffect } from 'react';
import { Calendar, Users, PlusCircle, Sun, Wind, BookOpen } from 'lucide-react';
import { Button } from '@mui/material';
import emailjs from '@emailjs/browser';
import QRCode from 'qrcode';
import img from '../assets/Untitled.png'

emailjs.init("1dc3pjtJ5L5DERdp8");

const EventPage = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Solar Panel Installation Workshop",
      description: "Learn the basics of solar panel installation and maintenance. Perfect for homeowners and aspiring solar technicians.",
      date: "2025-02-15",
      time: "10:00 AM",
      host: "Sarah Johnson",
      capacity: 20,
      icon: <Sun className="h-6 w-6 text-yellow-500" />
    },
    {
      id: 2,
      title: "Renewable Energy Fundamentals",
      description: "Comprehensive introduction to various renewable energy sources and their implementation in residential settings.",
      date: "2025-02-20",
      time: "2:00 PM",
      host: "Dr. Michael Chen",
      capacity: 30,
      icon: <Wind className="h-6 w-6 text-blue-500" />
    },
    {
      id: 3,
      title: "Green Energy Education Summit",
      description: "Join educators and industry experts to discuss the future of renewable energy education and career opportunities.",
      date: "2025-02-25",
      time: "9:00 AM",
      host: "Prof. Emily Martinez",
      capacity: 50,
      icon: <BookOpen className="h-6 w-6 text-green-500" />
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    capacity: "",
    hostName: ""
  });

  const handleJoinEvent = async (event) => {
    try {
      // Create HTML template for email with the imported QR code image
      const htmlContent = `
        <div style="text-align: center;">
          <h2>Your Event Registration QR Code</h2>
          <p>Registration ID: ${event.id}</p>
          <img src="${img}" alt="Event QR Code" style="width: 300px; height: 300px;"/>
        </div>
      `;

      // Prepare email template parameters
      const templateParams = {
        to_name: "Participant",
        from_name: "Renewable Energy Events Team",
        to_email: 'anushka.shendge22@spit.ac.in',
        event_title: event.title,
        event_date: new Date(event.date).toLocaleDateString(),
        event_time: event.time,
        host_name: event.host,
        html_content: htmlContent,
        message: `Welcome to ${event.title}! We're excited to have you join us.`,
        reply_to: "noreply@renewableevents.com",
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        'service_4dv8j5e',
        'template_iykrkjj',
        templateParams,
        '1dc3pjtJ5L5DERdp8'
      );

      if (response.status === 200) {
        alert('Welcome email sent with QR code! Please check your inbox.');
      }
    } catch (error) {
      console.error('Error details:', error);
      alert(`Failed to send welcome email. Error: ${error.text || error.message || 'Unknown error'}`);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const event = {
      id: events.length + 1,
      ...newEvent,
      host: newEvent.hostName,
      icon: <Sun className="h-6 w-6 text-yellow-500" />
    };
    setEvents([...events, event]);
    setShowModal(false);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      capacity: "",
      hostName: ""
    });
  };


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Renewable Energy Events</h1>
            <p className="text-gray-600 mt-2">Join our community events and learn about sustainable energy</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Host Event
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create New Event</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Title</label>
                  <input
                    className="w-full p-2 border rounded-lg"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded-lg"
                    required
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                      className="w-full p-2 border rounded-lg"
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <input
                      className="w-full p-2 border rounded-lg"
                      type="time"
                      required
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <input
                    className="w-full p-2 border rounded-lg"
                    type="number"
                    required
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name (Host)</label>
                  <input
                    className="w-full p-2 border rounded-lg"
                    required
                    value={newEvent.hostName}
                    onChange={(e) => setNewEvent({...newEvent, hostName: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  Create Event
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {event.icon}
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4" />
                    Capacity: {event.capacity} attendees
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <p className="text-sm text-gray-600">Hosted by: <span className="font-semibold">{event.host}</span></p>
                  <Button 
                    className='p-3'
                    onClick={() => handleJoinEvent(event)}
                  >
                    Join
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventPage;