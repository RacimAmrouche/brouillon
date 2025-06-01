import React, { useState } from 'react';
import { SendHelp } from "../../services/auth" // adapte le chemin si besoin
import { useNavigate } from 'react-router-dom';

const Help = () => {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const uid = user?.result?.uid;
  const role = user?.result?.role; // "10" pour patient, "20" pour pro

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Veuillez entrer un message.");
      return;
    }

    const formData = new FormData();
    formData.append("body", message);
    formData.append("id", uid);
    formData.append("role", role);

    try {
      await SendHelp(formData);
      setSubmitted(true);
  
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Erreur : impossible d'envoyer votre message.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-2">How can we help you?</h1>
        <p className="text-gray-600 mb-6 mx-auto text-center">Our support team is here to assist you with any questions or issues.</p>

        {submitted && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            Thank you for your message! We'll get back to you soon.
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message</label>
              <textarea
                id="message"
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Please describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-red-300 text-white font-medium rounded-md hover:bg-red-400 transition-colors"
              >
                Submit Request
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setMessage('')}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Other Ways to Get Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-medium mb-2">Phone Support</h3>
              <p className="text-gray-600">Call us at: (123) 456-7890</p>
              <p className="text-gray-600">Monday - Friday, 9am - 5pm</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-medium mb-2">Email Support</h3>
              <p className="text-gray-600">Send an email to:</p>
              <p className="text-gray-600">support@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
