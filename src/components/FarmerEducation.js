// import React from 'react';

// const methods = [
//   "Biogas production from anaerobic digestion of crop residues.",
//   "Combustion of agricultural biomass for direct heat generation.",
//   "Conversion of agricultural waste into bioethanol through fermentation.",
//   "Pyrolysis of crop waste to produce biochar and bio-oil.",
//   "Gasification of biomass for syngas generation."
// ];

// const benefits = [
//   "Reduces dependency on fossil fuels, promoting renewable energy.",
//   "Helps in managing agricultural waste sustainably.",
//   "Improves soil health through biochar application.",
//   "Generates additional income for farmers from waste conversion.",
//   "Reduces greenhouse gas emissions and mitigates climate change."
// ];

// const FarmerEducation = () => (
//   <section className="bg-white rounded-xl shadow-sm p-8 mb-12">
//     <h2 className="text-3xl font-bold mb-6">Agricultural Waste to Energy Guide</h2>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//       <div>
//         <h3 className="text-xl font-bold mb-4">Conversion Methods</h3>
//         <ul className="space-y-3">
//           {methods.map((method, i) => (
//             <li key={i} className="flex items-start gap-3">
//               <span className="text-green-600">•</span>
//               <span>{method}</span>
//             </li>
//           ))}
//         </ul>
//       </div>
//       <div>
//         <h3 className="text-xl font-bold mb-4">Benefits</h3>
//         <ul className="space-y-3">
//           {benefits.map((benefit, i) => (
//             <li key={i} className="flex items-start gap-3">
//               <span className="text-green-600">•</span>
//               <span>{benefit}</span>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   </section>
// );

// export default FarmerEducation;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FarmerEducation = () => {
  const [activeTab, setActiveTab] = useState('methods');
  
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
    </section>
  );
};

export default FarmerEducation;