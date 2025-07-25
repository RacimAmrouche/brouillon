"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { List } from "lucide-react"
import { ListAlerts, SetStatus, InfoPat, Accept } from "../../services/pros"
import { Logout } from "../../services/auth"

const ProS = () => {
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = useState("dashboard")
  const [isDark, setIsDark] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)

  // Modified availability state to cycle through three states
  const [availabilityState, setAvailabilityState] = useState(0) // 0: disponible, 1: disponible pour appel, 2: indisponible
  const availabilityStates = ["Available", "Available for call", "Unavailable"]
  const availabilityColors = [
    "bg-green-500 hover:bg-green-600",
    "bg-yellow-500 hover:bg-yellow-600",
    "bg-red-500 hover:bg-red-600",
  ]

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [user, setUser] = useState(null)

  // Vehicle connection state
  const [showVehiclePopup, setShowVehiclePopup] = useState(false)
  const [vehicleConnected, setVehicleConnected] = useState(true)
  const [macAddress] = useState("00:1A:2B:3C:4D:5E")
  const [ipAddress] = useState("192.168.255.1")

  // États pour les alertes - maintenant récupérées depuis l'API
  const [patientRequests, setPatientRequests] = useState([])
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false)
  const [alertsError, setAlertsError] = useState(null)
  const handleLogout = async () => {
    const formData = new FormData()
    formData.append("Id", user.result.uid)
    formData.append("Role", "20")
    try {
      console.log("ici logout")
      const response = await Logout(formData)
      const data = response.data
      console.log("Réponse du back :", data)
      localStorage.removeItem("user")
      alert(" Logout successful ✅")
      navigate("/")
    } catch (error) {
      console.log("Logout failed", error)
      alert("Logout failed ❌")
    }
  }

  // État pour les patients pris en charge - initialisé à vide
  const [acceptedPatients, setAcceptedPatients] = useState([])

  // Vérifier si le professionnel a déjà une intervention en cours
  const hasActiveIntervention = acceptedPatients.length > 0

  // Fonction pour récupérer les alertes depuis l'API
  // Fonction pour récupérer les alertes depuis l'API
   // Récupérer les alertes du pro
   const fetchAlerts = async () => {
    if (!user?.result?.uid) return;
  
    setIsLoadingAlerts(true);
    setAlertsError(null);
  
    try {
      const formData = new FormData();
      formData.append("ProSid", user.result.uid);
  
      const response = await ListAlerts(formData);
      const data = response.data;
  
      console.log("Alertes brutes reçues :", data);
  
      if (typeof data === "string") {
        setPatientRequests([]);
        setSelectedPatient(null);
        return;
      }
  
      if (!Array.isArray(data)) {
        throw new Error("Réponse inattendue du serveur");
      }
  
      const transformedAlerts = await Promise.all(
        data.map(async (alert, index) => {
          // On appelle l'API GetInfoPatMed ici pour enrichir l'alerte avec les infos patient
          const patientUID = alert.patientUID ;
          let patientInfo = null;
  
          if (patientUID) {
            const patientForm = new FormData();
            patientForm.append("PatientUID", patientUID);
  
            try {
              const patientRes = await InfoPat(patientForm);
              patientInfo = patientRes.data;
                console.log(`Infos patient récupérées pour UID ${patientUID} :`, patientInfo); 
     
                console.log(`Taille du patient (UID ${patientUID}):`, patientInfo.patient.weight);
          
            } catch (err) {
              console.warn("Erreur récupération infos patient :", err);
            }
          }
          console.log(`Infos patient récupérées pour UID ${patientUID} :`, patientInfo); 
            return {
            id: patientUID,
            idalert: alert.alertID,
            name: alert.patientName || patientInfo?.patient?.name || `Patient ${index + 1}`,
            lastName: alert.patientLastName || patientInfo?.patient?.lastName || "",
            age: alert.patientAge || patientInfo?.patient?.age || "N/A",
            email: alert.patientEmail || patientInfo?.patient?.email || "Non renseigné",
            phone: alert.patientPhone || patientInfo?.patient?.phoneNumber || "Non renseigné",
            height: alert.height || patientInfo?.patient?.height || "Non renseigné",
            weight: alert.weight || patientInfo?.patient?.weight || "Non renseigné",
            location: alert.location || patientInfo?.patient?.adresse || "Localisation non spécifiée",
            medicalRecords: alert.medicalHistory
              ? safeParseJSON(alert.medicalHistory)
              : patientInfo?.patient?.medRecs || [],
            urgency: alert.color === "rouge" ? "Haute" : alert.color === "orange" ? "Moyenne" : "Basse",
            status: "pending",
            timestamp: alert.createdAt || new Date().toISOString(),
            currentSymptoms: alert.symptoms || alert.description || "Symptômes non spécifiés",
            coordinates:
              (alert.latitude && alert.longitude)
              ? [alert.latitude, alert.longitude]
              : (patientInfo?.patient?.latitudePatient && patientInfo?.patient?.longitudePatient)
                ? [patientInfo.patient.latitudePatient, patientInfo.patient.longitudePatient]
                : [36.7125, 3.1839],
            color: alert.color,
            state: alert.state,
            description: alert.description,
            };

        })
      );
  
      console.log("Alertes transformées :", transformedAlerts);
  
      setPatientRequests(transformedAlerts);
  
    
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes :", error);
      setAlertsError("Erreur lors du chargement des alertes");
    } finally {
      setIsLoadingAlerts(false);
    }
  };
  
  // useEffect pour charger les alertes au montage
  useEffect(() => {
    fetchAlerts();
  }, []);
  //recup les info du proS
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    console.log("Données dans localStorage :", storedUser)
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      console.log("User récupéré :", userData) // 👈 ajoute ça pour vérifier
      setUser(userData)
    } else {
      window.location.href = "/ProSignin"
    }
  }, [])

  // Récupérer les alertes quand l'utilisateur est chargé ou que la disponibilité change
  useEffect(() => {
    if (user?.result?.uid) {
      fetchAlerts()
    }
  }, [user, availabilityState])

  // Navigation item click handler
  const handleNavClick = (item) => {
    setActiveItem(item)
    setIsMobileMenuOpen(false)

    // Navigation logic
    switch (item) {
      case "account":
        navigate("/AccountSettings")
        break
      case "help":
        navigate("/help")
        break
      case "history":
        navigate("/NotifPro")
        break
      case "logout":
        // Implement logout logic
        console.log("Logging out...")
        handleLogout()
        break
      default:
        // Just update the active state for other items
        break
    }
  }

  // Modified function to cycle through availability states
  const cycleAvailability = async () => {
    const nextState = (availabilityState + 1) % 3;
    setAvailabilityState(nextState);
  
    const availabilityMap = {
      0: "0",   // Urgences
      1: "1",   // Appels
      2: "-1"   // Indisponible
    };
  
    const mappedState = availabilityMap[nextState];
  
    try {
      const formData = new FormData();
      formData.append("ProS", user.result.uid);
      formData.append("state", mappedState);
  
      const response = await SetStatus(formData); // ✅ axios POST
  
      // ✅ Axios n’a pas .ok et retourne les données directement dans .data
      console.log("Statut mis à jour :", response.data);
  
      // Optionnel : recharge les alertes après changement
      fetchAlerts();
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };
  
  
  // Vehicle connection functions
  const openVehiclePopup = () => {
    setShowVehiclePopup(true)
  }

  const closeVehiclePopup = () => {
    setShowVehiclePopup(false)
  }

  const disconnectVehicle = () => {
    setVehicleConnected(false)
    setShowVehiclePopup(false)
  }

  const connectVehicle = () => {
    setVehicleConnected(true)
    setShowVehiclePopup(false)
  }

  // Fonction pour afficher les détails du patient
  const showPatientDetails = (patientInfo) => {
    setSelectedPatient(patientInfo)
  }

  // Fonction pour fermer les détails du patient
  const closePatientDetails = () => {
    setSelectedPatient(null)
  }

 
  
  const acceptPatient = async (patientId, alertId) => {
    if (hasActiveIntervention) {
      alert("Vous avez déjà une intervention en cours. Veuillez la terminer avant d'en accepter une nouvelle.");
      return;
    }
  
    const acceptedPatient = patientRequests.find((patient) => patient.id === patientId);
    if (!acceptedPatient) {
      alert("Alerte introuvable.");
      return;
    }
  
    try {
      const latitude = "36.71617";
      const longitude = "3.18468";
  
      const formData = new FormData();
      formData.append("ProS", user.result.uid);
      formData.append("IdAlert", alertId);
      formData.append("lat", latitude);
      formData.append("longt", longitude);
  
      console.log("FormData envoyée :");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
  
      const response = await Accept(formData);
      console.log("Réponse de l'API AcceptAlert :", response);
  
      if (response.status === 200) {
        console.log("Alerte acceptée avec succès :", response.data);
  
        acceptedPatient.status = "accepted";
        const updatedRequests = patientRequests.filter((patient) => patient.id !== patientId);
        setPatientRequests(updatedRequests);
        setAcceptedPatients([...acceptedPatients, acceptedPatient]);
  
        localStorage.setItem("currentIntervention", JSON.stringify(acceptedPatient));
        navigate("/RedirPros");
      } else {
        alert("Erreur lors de l'acceptation de l'alerte.");
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à AcceptAlert :", error);
      alert("Échec de l'acceptation de l'intervention. Vérifiez votre connexion ou vos informations.");
    }
  };
  
  
  

  // Fonction pour refuser une demande de prise en charge
  const declinePatient = (patientId) => {
    const updatedRequests = patientRequests.filter((patient) => patient.id !== patientId)
    setPatientRequests(updatedRequests)
  }

  // Fonction pour annuler une prise en charge
  const cancelPatientCare = (patientId) => {
    const updatedAccepted = acceptedPatients.filter((patient) => patient.id !== patientId)
    setAcceptedPatients(updatedAccepted)

    // Si c'était la dernière intervention, supprimer également du localStorage
    if (updatedAccepted.length === 0) {
      localStorage.removeItem("currentIntervention")
    }
  }

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Modified stats - replaced "Pending requests" with "Connect vehicle"
  const stats = [
    {
      label: "Status",
      value: availabilityStates[availabilityState],
      icon: "activity",
      color:
        availabilityState === 0
          ? "bg-green-100 text-green-600"
          : availabilityState === 1
            ? "bg-yellow-100 text-yellow-600"
            : "bg-red-100 text-red-600",
    },
    {
      label: "Connect vehicle",
      value: vehicleConnected ? "Connected" : "Disconnected",
      icon: "car",
      color: vehicleConnected ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600",
      action: openVehiclePopup,
    },
    {
      label: "Patient under care",
      value: acceptedPatients.length,
      icon: "users",
      color: "bg-purple-100 text-purple-600",
    },
  ]

  // Fonction pour rendre une icône simple
  const renderIcon = (name) => {
    switch (name) {
      case "user":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        )
      case "settings":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        )
      case "file-edit":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        )
      case "history":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        )
      case "help-circle":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      case "log-out":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        )
      case "bell":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        )
      case "activity":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        )
      case "chevron-right":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        )
      case "menu":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )
      case "x":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        )
      case "home":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        )
      case "clock":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        )
      case "users":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      case "check":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )
      case "x-circle":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        )
      case "map-pin":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        )
      case "phone":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        )
      case "mail":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        )
      case "clipboard":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
        )
      case "alert-triangle":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      case "ruler":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
            <path d="M8 4v16"></path>
            <path d="M12 4v16"></path>
            <path d="M16 4v16"></path>
          </svg>
        )
      case "weight":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        )
      case "file-text":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )
      case "car":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 9.6a2 2 0 0 0-1.6-1.4C16.6 8.2 16.3 8 16 8H8c-.3 0-.6.2-.8.2a2 2 0 0 0-1.6 1.4L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
        )
      case "refresh-cw":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
        )
      default:
        return null
    }
  }

  // Couleur du texte en mode sombre qui correspond au bg-gray-800
  const darkModeTextColor = "#1f2937" // Équivalent à bg-gray-800
  if (!user) {
    return <p>Chargement...</p>
  }
  return (
    <div
      className={`flex flex-col md:flex-row h-screen ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}
    >
      {/* Mobile Header */}
      <div
        className={`md:hidden flex items-center justify-between p-4 ${isDark ? "bg-gray-800" : "bg-white"} shadow-md`}
      >
        <div className="flex items-center">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="mr-3">
            {isMobileMenuOpen ? renderIcon("x") : renderIcon("menu")}
          </button>
        </div>
        <div className="flex items-center">
          <button className="relative p-2">
            {renderIcon("bell")}
            {notifications > 0 && (
              <span className="absolute top-1 right-1 bg-[#f05050] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Vertical Menu - Desktop */}
      <div className={`hidden md:flex flex-col w-64 ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg h-full`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-[#f05050] flex items-center justify-center text-white font-medium text-lg">
              {user.result.name.charAt(0)}
              {user.result.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium">
                {user.result.name} {user.result.lastName}
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Healthcare Professional</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeItem === "dashboard"
                    ? "bg-[#f05050] text-white shadow-md"
                    : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                }`}
              >
                <span className="mr-3 h-5 w-5">{renderIcon("home")}</span>
                <span className="font-medium">Dashboard</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleNavClick("account")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeItem === "account"
                    ? "bg-[#f05050] text-white shadow-md"
                    : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                }`}
              >
                <span className="mr-3 h-5 w-5">{renderIcon("settings")}</span>
                <span className="font-medium">Settings</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick("history")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeItem === "history"
                    ? "bg-[#f05050] text-white shadow-md"
                    : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                }`}
              >
                <span className="mr-3 h-5 w-5">{renderIcon("history")}</span>
                <span className="font-medium">Notifications</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick("help")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeItem === "help"
                    ? "bg-[#f05050] text-white shadow-md"
                    : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                }`}
              >
                <span className="mr-3 h-5 w-5">{renderIcon("help-circle")}</span>
                <span className="font-medium">Help</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleNavClick("logout")}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg ${
              isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-all duration-200`}
          >
            <span className="mr-2 h-5 w-5">{renderIcon("log-out")}</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide in */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden fixed inset-0 z-50 ${isDark ? "bg-gray-900/80" : "bg-black/50"}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={`w-64 h-full ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg transform transition-transform duration-300 ease-in-out`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-[#f05050] flex items-center justify-center text-white font-bold mr-2">
                    E
                  </div>
                  <h2 className="text-lg font-bold">E-mergency </h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>{renderIcon("x")}</button>
              </div>
            </div>

            <nav className="mt-4 px-3">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleNavClick("dashboard")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeItem === "dashboard"
                        ? "bg-[#f05050] text-white shadow-md"
                        : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                    }`}
                  >
                    <span className="mr-3 h-5 w-5">{renderIcon("home")}</span>
                    <span className="font-medium">Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("patients")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeItem === "patients"
                        ? "bg-[#f05050] text-white shadow-md"
                        : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                    }`}
                  >
                    <span className="mr-3 h-5 w-5">{renderIcon("users")}</span>
                    <span className="font-medium">My Patients</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("account")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeItem === "account"
                        ? "bg-[#f05050] text-white shadow-md"
                        : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                    }`}
                  >
                    <span className="mr-3 h-5 w-5">{renderIcon("settings")}</span>
                    <span className="font-medium">Settings</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("history")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeItem === "history"
                        ? "bg-[#f05050] text-white shadow-md"
                        : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                    }`}
                  >
                    <span className="mr-3 h-5 w-5">{renderIcon("history")}</span>
                    <span className="font-medium">History</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("help")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeItem === "help"
                        ? "bg-[#f05050] text-white shadow-md"
                        : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                    }`}
                  >
                    <span className="mr-3 h-5 w-5">{renderIcon("help-circle")}</span>
                    <span className="font-medium">Help</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("logout")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeItem === "logout"
                        ? "bg-[#f05050] text-white shadow-md"
                        : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                    }`}
                  >
                    <span className="mr-3 h-5 w-5">{renderIcon("log-out")}</span>
                    <span className="font-medium">Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 overflow-auto ${selectedPatient || showVehiclePopup ? "filter blur-sm" : ""}`}>
        {/* Desktop Header */}

        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mt-6 mb-6">
              Welcome, {user.result.name} {user.result.lastName}
            </h2>

            {/* Modified availability button with cycling states */}
            <div className="mb-8 flex justify-center space-x-4">
              <button
                onClick={cycleAvailability}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center text-white ${availabilityColors[availabilityState]}`}
              >
                <span className="mr-2">{availabilityStates[availabilityState]}</span>
                <span className="h-5 w-5">
                  {availabilityState === 0
                    ? renderIcon("check")
                    : availabilityState === 1
                      ? renderIcon("phone")
                      : renderIcon("x-circle")}
                </span>
              </button>

              {/* Vehicle connection button */}
              <button
                onClick={openVehiclePopup}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center bg-[#f05050] hover:bg-[#f05060] text-white"
              >
                <span className="mr-2 h-5 w-5">{renderIcon("car")}</span>
                <span>{vehicleConnected ? "Disconnect" : "Connect vehicle"}</span>
              </button>

              {/* Refresh alerts button */}
              <button
                onClick={fetchAlerts}
                disabled={isLoadingAlerts}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center   text-white disabled:opacity-50"
              >
                <span className={`mr-2 h-5 w-5 ${isLoadingAlerts ? "animate-spin" : ""}`}>
                  {renderIcon("refresh-cw")}
                </span>
                <span>{isLoadingAlerts ? "Loading..." : "Refresh alerts"}</span>
              </button>
            </div>

            {/* Stats Cards - Modified to include clickable vehicle connection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm p-6 flex items-center ${stat.action ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
                  onClick={stat.action}
                >
                  <div className={`${stat.color} p-4 rounded-full mr-5`}>
                    <span className="h-6 w-6 block">{renderIcon(stat.icon)}</span>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</p>
                    <p className="font-semibold text-lg">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Care requests */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Alerts</h3>
                {alertsError && <div className="text-red-500 text-sm">{alertsError}</div>}
              </div>
              <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm overflow-hidden`}>
                {isLoadingAlerts ? (
                  <div className="p-6 text-center">
                    <div className="flex items-center justify-center">
                      <span className="animate-spin mr-2 h-5 w-5">{renderIcon("refresh-cw")}</span>
                      <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading alerts...</p>
                    </div>
                  </div>
                ) : patientRequests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead
                        className={`${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-600"} text-left`}
                      >
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Age</th>
                          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Emergency</th>
                          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {patientRequests.map((patient) => (
                          <tr
                            key={patient.id}
                            className={`${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"} cursor-pointer`}
                            onClick={() => showPatientDetails(patient)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${
                                    patient.color === "rouge"
                                      ? "bg-red-500"
                                      : patient.color === "orange"
                                        ? "bg-orange-500"
                                        : "bg-blue-500"
                                  }`}
                                >
                                  {patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium">{patient.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{patient.age} years</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  patient.urgency === "Haute"
                                    ? "bg-red-100 text-red-800"
                                    : patient.urgency === "Moyenne"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {patient.urgency}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(patient.timestamp)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    acceptPatient(patient.id,patient.idalert)
                                  }}
                                  className={`text-green-600 hover:text-green-900 dark:hover:text-green-400 ${
                                    hasActiveIntervention ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                                  disabled={availabilityState === 2 || hasActiveIntervention}
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    declinePatient(patient.id)
                                  }}
                                  className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                >
                                  Ignore
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {availabilityState === 2 ? "You are unavailable - no alerts will be shown" : "No pending alerts"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Patients pris en charge */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Patient under care</h3>
              <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm overflow-hidden`}>
      {/*POUR PATIENT UNDER CARE NON AFFICHAGE */}          {acceptedPatients.length < 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead
                        className={`${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-600"} text-left`}
                      >
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Age</th>
                          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Emergency</th>
                          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {acceptedPatients.map((patient) => (
                          <tr
                            key={patient.id}
                            className={`${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"} cursor-pointer`}
                            onClick={() => showPatientDetails(patient)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                                  {patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium">{patient.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{patient.age} years</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                High
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(patient.timestamp)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  cancelPatientCare(patient.id)
                                }}
                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                              >
                                Cancel the patient's care
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>No patients currently under care</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Connection Popup */}
      {showVehiclePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeVehiclePopup}>
          <div
            className={`relative w-full max-w-md rounded-lg shadow-xl ${isDark ? "bg-gray-800" : "bg-white"} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={closeVehiclePopup}
            >
              {renderIcon("x")}
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2 h-6 w-6">{renderIcon("car")}</span>
                Vehicle Connection
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <span className="font-medium">Link status:</span>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      vehicleConnected
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {vehicleConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <span className="font-medium">MAC address:</span>
                  <span className="font-mono text-sm">{macAddress}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <span className="font-medium">IP address:</span>
                  <span className="font-mono text-sm">{ipAddress}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {vehicleConnected ? (
                <button
                  onClick={disconnectVehicle}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={connectVehicle}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Connect
                </button>
              )}
              <button
                onClick={closeVehiclePopup}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for patient details */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closePatientDetails}>
          <div
            className={`relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-lg shadow-xl ${isDark ? "bg-gray-800" : "bg-white"} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={closePatientDetails}
            >
              {renderIcon("x")}
            </button>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                  {selectedPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
              </div>

              <div className="mb-6">
                <div
                  className={`rounded-lg overflow-hidden border ${isDark ? "border-gray-700" : "border-gray-200"} mb-4`}
                >
                  <div className="bg-[#f05050] text-white px-4 py-2 font-semibold">Patient Information</div>
                  <div className={`p-4 ${isDark ? "bg-gray-700" : "bg-white"}`}>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-semibold">Name:</div>
                      <div>{selectedPatient.name}</div>

                      <div className="font-semibold">Age:</div>
                      <div>{selectedPatient.age}</div>

                      <div className="font-semibold">Location:</div>
                      <div>{selectedPatient.location}</div>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-lg overflow-hidden border ${isDark ? "border-gray-700" : "border-gray-200"} mb-4`}
                >
                  <div className="bg-[#f05050] text-white px-4 py-2 font-semibold">Contact Information</div>
                  <div className={`p-4 ${isDark ? "bg-gray-700" : "bg-white"}`}>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-semibold">Phone:</div>
                      <div>{selectedPatient.phone}</div>

                      <div className="font-semibold">Email:</div>
                      <div>{selectedPatient.email}</div>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-lg overflow-hidden border ${isDark ? "border-gray-700" : "border-gray-200"} mb-4`}
                >
                  <div className="bg-[#f05050] text-white px-4 py-2 font-semibold">Physical Attributes</div>
                  <div className={`p-4 ${isDark ? "bg-gray-700" : "bg-white"}`}>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-semibold">Height:</div>
                      <div>{selectedPatient.height}</div>

                      <div className="font-semibold">Weight:</div>
                      <div>{selectedPatient.weight}</div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg overflow-hidden border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="bg-[#f05050] text-white px-4 py-2 font-semibold">Medical Records</div>
                  <div className={`p-4 ${isDark ? "bg-gray-700" : "bg-white"}`}>
                    {selectedPatient.medicalRecords && selectedPatient.medicalRecords.length > 0 ? (
                      selectedPatient.medicalRecords.map((record, index) => (
                        <div
                          key={index}
                          className={`flex justify-between py-2 ${index !== selectedPatient.medicalRecords.length - 1 ? "border-b" : ""} ${isDark ? "border-gray-600" : "border-gray-200"}`}
                        >
                          <div>{record.condition}</div>
                          <div className="text-gray-500">{record.date}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No medical records available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Symptoms */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Current Symptoms:</h3>
                <p className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                  {selectedPatient.currentSymptoms}
                </p>
              </div>
            </div>

            {/* Show the map for all high urgency alerts (which is now all alerts) */}
            {selectedPatient.urgency === "Haute" && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Patient location</h3>
                <div className="h-[300px] rounded-lg overflow-hidden">
                  <div className="h-full w-full">
                    <MapContainer
                      center={selectedPatient.coordinates}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={selectedPatient.coordinates}>
                        <Popup>
                          {selectedPatient.name}
                          <br />
                          {selectedPatient.location}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              {selectedPatient.status === "pending" ? (
                <>
                  <button
                    onClick={() => {
                      acceptPatient(selectedPatient.id)
                      closePatientDetails()
                    }}
                    className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
                      hasActiveIntervention ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={availabilityState === 2 || hasActiveIntervention}
                  >
                    Accept care
                  </button>
                  <button
                    onClick={() => {
                      declinePatient(selectedPatient.id)
                      closePatientDetails()
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ignore
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    cancelPatientCare(selectedPatient.id)
                    closePatientDetails()
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Cancel care
                </button>
              )}
              <button
                onClick={closePatientDetails}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProS
