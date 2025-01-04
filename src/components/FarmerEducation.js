import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';

const FarmerEducation = () => {
  const [activeTab, setActiveTab] = useState('methods');
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const videoRefs = [useRef(null), useRef(null)];
  
  const methods = [
    {
      title: "Biogas Production",
      description: "Convert crop residues into biogas through anaerobic digestion",
      icon: "🌱",
      details: "Anaerobic digestion breaks down organic matter to produce methane-rich biogas"
    },
    {
      title: "Biomass Combustion",
      description: "Direct heat generation from agricultural biomass",
      icon: "🔥",
      details: "Efficient burning of dry biomass for heat and power generation"
    },
    {
      title: "Bioethanol Conversion",
      description: "Transform agricultural waste into bioethanol",
      icon: "🌾",
      details: "Fermentation process converts cellulosic waste into renewable fuel"
    },
    {
      title: "Pyrolysis Process",
      description: "Create biochar and bio-oil from crop waste",
      icon: "⚗️",
      details: "Thermal decomposition produces valuable products like biochar"
    },
    {
      title: "Syngas Generation",
      description: "Gasification of biomass for versatile syngas",
      icon: "💨",
      details: "High-temperature conversion creates clean-burning synthesis gas"
    }
  ];

  const benefits = [
    {
      title: "Reduced Fossil Fuel Dependency",
      description: "Switch to renewable energy sources",
      icon: "🌍",
      stats: "Up to 60% reduction in fossil fuel use"
    },
    {
      title: "Waste Management",
      description: "Sustainable agricultural waste handling",
      icon: "♻️",
      stats: "Process 90% of farm waste"
    },
    {
      title: "Soil Health Improvement",
      description: "Enhanced soil quality through biochar",
      icon: "🌱",
      stats: "30% increase in soil fertility"
    },
    {
      title: "Additional Income",
      description: "Revenue from waste conversion",
      icon: "💰",
      stats: "Average $5000/year extra income"
    },
    {
      title: "Environmental Impact",
      description: "Reduced greenhouse gas emissions",
      icon: "🌿",
      stats: "Cut emissions by 40%"
    }
  ];

  const videos = [
    {
      title: "Understanding Solar Power Production",
      src: require("../assets/solar"),
       poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23004d40'/%3E%3Ctext x='320' y='180' font-family='Arial' font-size='24' fill='white' text-anchor='middle' alignment-baseline='middle'%3EBiogas Production Process%3C/text%3E%3Ccircle cx='320' cy='120' r='40' fill='%2300796b'/%3E%3Cpath d='M280 220 Q320 260 360 220' stroke='%2300796b' fill='none' stroke-width='8'/%3E%3C/svg%3E"
    },
    {
      title: "Wind Power Solutions",
      src: require("../assets/windpower"),
      poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23006064'/%3E%3Ctext x='320' y='180' font-family='Arial' font-size='24' fill='white' text-anchor='middle' alignment-baseline='middle'%3EBiomass Energy Solutions%3C/text%3E%3Cpath d='M290 140 L320 100 L350 140 L320 180 Z' fill='%230097a7'/%3E%3Ccircle cx='320' cy='220' r='30' fill='%230097a7'/%3E%3C/svg%3E"
    }
  ];

  const toggleFullscreen = (index) => {
    if (fullscreenVideo === index) {
      document.exitFullscreen().catch(err => console.log(err));
      setFullscreenVideo(null);
    } else {
      const videoElement = videoRefs[index].current;
      if (videoElement) {
        videoElement.requestFullscreen().catch(err => console.log(err));
        setFullscreenVideo(index);
      }
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-lg p-8 mb-12">
      <h2 className="text-4xl font-bold mb-8 text-start bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500">
        Agricultural Waste to Energy Guide
      </h2>

      {/* Tab Navigation */}
      <div className="flex justify-start mb-8">
        <div className="bg-white rounded-full p-1 shadow-md">
          <button
            onClick={() => setActiveTab('methods')}
            className={`px-6 py-2 rounded-full transition-all ${
              activeTab === 'methods'
                ? 'bg-violet-900/60 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Conversion Methods
          </button>
          <button
            onClick={() => setActiveTab('benefits')}
            className={`px-6 py-2 rounded-full transition-all ${
              activeTab === 'benefits'
                ? 'bg-sky-900/60 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Benefits
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {(activeTab === 'methods' ? methods : benefits).map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="text-sm text-gray-500">
                {activeTab === 'methods' ? item.details : item.stats}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Video Section */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6">Educational Videos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video, index) => (
            <div key={index} className="relative bg-white rounded-xl shadow-sm overflow-hidden">
              <video
                ref={videoRefs[index]}
                className="w-full aspect-video object-cover"
                poster={video.poster}
                controls
              >
                <source src={video.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <button
                onClick={() => toggleFullscreen(index)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                {fullscreenVideo === index ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
              <div className="p-4">
                <h4 className="text-lg font-semibold">{video.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FarmerEducation;