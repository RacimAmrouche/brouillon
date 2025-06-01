"use client"

import { useState } from "react"
import { Phone, Users, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import g107 from "../assets/g107.png"
import logoBlanc from "../assets/g86-2-1-7.png"
import LoginSig from "./LoginSig" // Importation du composant LoginSig

const Home = () => {
  const [showLoginPopup, setShowLoginPopup] = useState(false) // État pour contrôler l'affichage du popup

  // Fonction pour ouvrir le popup
  const openLoginPopup = () => {
    setShowLoginPopup(true)
    document.body.style.overflow = "hidden" // Empêcher le défilement
  }

  // Fonction pour fermer le popup
  const closeLoginPopup = () => {
    setShowLoginPopup(false)
    document.body.style.overflow = "" // Réactiver le défilement
  }

  return (
    <div className="relative">
      {/* Contenu principal avec effet de flou lorsque le popup est ouvert */}
      <div
        className={`min-h-screen bg-gradient-to-br from-red-50 to-white mt-158 transition-all duration-300 ${showLoginPopup ? "blur-sm" : ""}`}
      >
        {/* Header */}
        <header className="bg-primary shadow-sm border-b bg-[#f05050]">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src={g107 || "/placeholder.svg"}
                  alt="E-Mergency Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-2xl font-bold text-white">E-Mergency</h3>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 ">
              <Link to="#" className="text-white/80 hover:text-white transition-colors">
                Home
              </Link>
              <a href="#features" className="text-white/80 hover:text-white transition-colors">
                Features
              </a>
              <a href="#footer" className="text-white/80 hover:text-white transition-colors">
                Contact
              </a>
              <button
                onClick={openLoginPopup}
                className="bg-[white] text-primary hover:bg-gray-100 px-4 py-2 rounded-md font-medium transition-colors text-[#f05050]"
              >
                Sign in/up
              </button>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <button
                onClick={openLoginPopup}
                className="bg-white text-primary hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Sign in/up
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6 bg-[#f05050]">
                <img src={logoBlanc || "/placeholder.svg"} className="h-10 w-10" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">E-Mergency</h2>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Your intelligent medical emergency assistant
              </p>
            </div>

            {/* Description */}
            <div  id="features" className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Who are we?</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                E-Mergency is an innovative medical application that revolutionizes health emergency management. We
                instantly connect patients to appropriate emergency services through an intelligent and geolocated alert
                system.
              </p>
              <p className="text-base text-gray-600">Our mission: saving lives by reducing medical response times.</p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-lg border-2 border-gray-100 hover:border-primary/20 transition-colors shadow-sm">
                <div className="p-6 text-center">
                  <Phone className="h-12 w-12 text-primary mx-auto mb-4 text-[#f05050]" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Quick Alert</h4>
                  <p className="text-gray-600">Automatic health anomalies detection with automatic geolocation</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border-2 border-gray-100 hover:border-primary/20 transition-colors shadow-sm">
                <div className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4 text-[#f05050]" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Medical Network</h4>
                  <p className="text-gray-600">
                    Direct connection with healthcare professionals and emergency services
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border-2 border-gray-100 hover:border-primary/20 transition-colors shadow-sm">
                <div className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4 text-[#f05050]" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">24/7 Response</h4>
                  <p className="text-gray-600">Service available 24/7 for all your medical emergencies</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg rounded-lg font-medium transition-colors bg-[#f05050]">
                Download App
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="footer" className="bg-gray-900 text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src={g107 || "/placeholder.svg"}
                  alt="E-Mergency Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </div>
              <span className="text-xl font-semibold">E-Mergency</span>
            </div>
            <p className="text-gray-400">© 2024 E-Mergency. All rights reserved. Your health, our priority.</p>
          </div>
        </footer>
      </div>

      {/* Popup LoginSig */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay semi-transparent */}
          <div className="absolute inset-0 bg-black/50" onClick={closeLoginPopup}></div>

          {/* Conteneur du popup */}
          <div className="relative z-10">
            {/* Bouton de fermeture */}
            <button
              className="absolute top-4 right-4 z-20 text-gray-100 hover:text-gray-200 bg-[#f05050] rounded-full w-8 h-8 flex items-center justify-center shadow-md transition duration-300 transform hover:scale-110"
              onClick={closeLoginPopup}
            >
              <span className="text-xl font-bold">×</span>
            </button>

            {/* Composant LoginSig */}
            <LoginSig />
          </div>
        </div>
      )}
    </div>
  )
}

export default Home


















































////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
/*const Home = () => {
  const [data, setData] = useState(null); // Stocker les données de l'API
  const [loading, setLoading] = useState(true); // Gérer le chargement
  const [error, setError] = useState(null); // Gérer les erreurs

  useEffect(() => {
    // Remplace l'URL par celle de ton API ASP.NET
    axios.get("http://localhost:5002/api/test/json") 
      .then((response) => {
        setData(response.data); // Stocker les données reçues
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);*/
