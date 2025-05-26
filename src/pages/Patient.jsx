"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import car from "../assets/car.png"
import watch from "../assets/watch.png"
import cgm from "../assets/CGM.png"
const Patient = () => {
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = useState("dashboard")
  const [isDark, setIsDark] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)

  const [user, setUser] = useState(null)

  // Health metrics state
  const [glucose, setGlucose] = useState(95)
  const [heartRate, setHeartRate] = useState(75)
  const [systolic, setSystolic] = useState(120)
  const [diastolic, setDiastolic] = useState(80)
  const [oxygenSat, setOxygenSat] = useState(98)

  // Global alert status state
  const [globalAlertStatus, setGlobalAlertStatus] = useState({
    level: "normal", // normal, moderate, critical
    message: "All vital signs normal",
    activeAlerts: [],
    timestamp: null,
  })

  // Alert trigger states for visual feedback
  const [alertTriggers, setAlertTriggers] = useState({
    glucose: false,
    heartRate: false,
    bloodPressure: false,
    oxygen: false,
  })

  // Simulated alert states that override actual values
  const [simulatedAlerts, setSimulatedAlerts] = useState({
    glucose: { active: false, type: "normal", value: null },
    heartRate: { active: false, type: "normal", value: null },
    bloodPressure: { active: false, type: "normal", systolic: null, diastolic: null },
    oxygen: { active: false, type: "normal", value: null },
  })

  // Device connection states
  const [deviceConnections, setDeviceConnections] = useState({
    smartwatch: { connected: false, name: "", battery: null, macAddress: "" },
    cgm: { connected: false, name: "", lastReading: null, macAddress: "" },
    vehicle: { connected: false, name: "", status: null, ipAddress: "", macAddress: "" },
  })

  // Function to determine alert level based on actual values
  const getValueAlertLevel = (metric, value, systolicVal = null, diastolicVal = null) => {
    switch (metric) {
      case "glucose":
        if (value < 70 || value > 180) return "critical"
        if (value < 80 || value > 140) return "moderate"
        return "normal"

      case "heartRate":
        if (value < 50 || value > 120) return "critical"
        if (value < 60 || value > 100) return "moderate"
        return "normal"

      case "bloodPressure":
        const sys = systolicVal || value
        const dia = diastolicVal || 80
        if (sys >= 180 || dia >= 110 || sys < 90 || dia < 60) return "critical"
        if (sys >= 140 || dia >= 90 || sys < 100 || dia < 70) return "moderate"
        return "normal"

      case "oxygen":
        if (value < 90) return "critical"
        if (value < 95) return "moderate"
        return "normal"

      default:
        return "normal"
    }
  }

  // Device connection handlers
  const handleSmartwatchConnection = () => {
    if (deviceConnections.smartwatch.connected) {
      // Disconnect
      setDeviceConnections((prev) => ({
        ...prev,
        smartwatch: { connected: false, name: "", battery: null, macAddress: "" },
      }))
      alert("⌚ Montre connectée déconnectée")
    } else {
      // Connect
      const macAddress = "A4:B2:C3:D4:E5:F6" // Simulated MAC address
      setDeviceConnections((prev) => ({
        ...prev,
        smartwatch: { connected: true, name: "Apple Watch Series 9", battery: 85, macAddress },
      }))
      alert(
        `⌚ Montre connectée avec succès!\nAppareil: Apple Watch Series 9\nBatterie: 85%\nMAC Address: ${macAddress}`,
      )
    }
  }

  const handleCGMConnection = () => {
    if (deviceConnections.cgm.connected) {
      // Disconnect
      setDeviceConnections((prev) => ({
        ...prev,
        cgm: { connected: false, name: "", lastReading: null, macAddress: "" },
      }))
      alert("📊 CGM déconnecté")
    } else {
      // Connect
      const macAddress = "B1:C2:D3:E4:F5:A6" // Simulated MAC address
      setDeviceConnections((prev) => ({
        ...prev,
        cgm: { connected: true, name: "FreeStyle Libre 3", lastReading: new Date(), macAddress },
      }))
      alert(
        `📊 CGM connecté avec succès!\nAppareil: FreeStyle Libre 3\nDernière lecture: ${new Date().toLocaleTimeString()}\nMAC Address: ${macAddress}`,
      )
    }
  }

  const handleVehicleConnection = () => {
    if (deviceConnections.vehicle.connected) {
      // Disconnect
      setDeviceConnections((prev) => ({
        ...prev,
        vehicle: { connected: false, name: "", status: null, ipAddress: "", macAddress: "" },
      }))
      alert("🚗 Véhicule déconnecté")
    } else {
      // Connect
      const ipAddress = "192.168.1.45" // Simulated IP address
      const macAddress = "C5:D6:E7:F8:A9:B0" // Simulated MAC address
      setDeviceConnections((prev) => ({
        ...prev,
        vehicle: { connected: true, name: "Tesla Model 3", status: "Stationnée", ipAddress, macAddress },
      }))
      alert(
        `🚗 Véhicule connecté avec succès!\nVéhicule: Tesla Model 3\nStatut: Stationnée\nIP Address: ${ipAddress}\nMAC Address: ${macAddress}`,
      )
    }
  }

  // Update global alert status based on current values and simulated alerts
  useEffect(() => {
    const activeAlerts = []
    let highestSeverity = "normal"

    // Check actual values for automatic alerts
    const metrics = [
      { name: "Blood Glucose", key: "glucose", value: glucose, unit: "mg/dL" },
      { name: "Heart Rate", key: "heartRate", value: heartRate, unit: "BPM" },
      {
        name: "Blood Pressure",
        key: "bloodPressure",
        value: systolic,
        systolicVal: systolic,
        diastolicVal: diastolic,
        unit: "mmHg",
      },
      { name: "Oxygen Saturation", key: "oxygen", value: oxygenSat, unit: "%" },
    ]

    metrics.forEach((metric) => {
      // Check if there's a simulated alert active for this metric
      const simulatedAlert = simulatedAlerts[metric.key]

      if (simulatedAlert.active) {
        // Use simulated alert
        activeAlerts.push({
          metric: metric.name,
          type: simulatedAlert.type,
          value: simulatedAlert.value || `${simulatedAlert.systolic}/${simulatedAlert.diastolic}`,
          source: "manual",
        })

        if (simulatedAlert.type === "critical") {
          highestSeverity = "critical"
        } else if (simulatedAlert.type === "moderate" && highestSeverity !== "critical") {
          highestSeverity = "moderate"
        }
      } else {
        // Check actual values for automatic alerts
        const alertLevel = getValueAlertLevel(metric.key, metric.value, metric.systolicVal, metric.diastolicVal)

        if (alertLevel !== "normal") {
          const displayValue =
            metric.key === "bloodPressure"
              ? `${metric.systolicVal}/${metric.diastolicVal}`
              : `${metric.value}${metric.unit}`

          activeAlerts.push({
            metric: metric.name,
            type: alertLevel,
            value: displayValue,
            source: "automatic",
          })

          if (alertLevel === "critical") {
            highestSeverity = "critical"
          } else if (alertLevel === "moderate" && highestSeverity !== "critical") {
            highestSeverity = "moderate"
          }
        }
      }
    })

    // Set appropriate message based on severity
    let alertMessage = "All vital signs normal"
    if (highestSeverity === "critical") {
      alertMessage = `Critical condition detected!`
    } else if (highestSeverity === "moderate") {
      alertMessage = `Moderate anomaly detected`
    }

    setGlobalAlertStatus({
      level: highestSeverity,
      message: alertMessage,
      activeAlerts,
      timestamp: activeAlerts.length > 0 ? new Date() : null,
    })
  }, [glucose, heartRate, systolic, diastolic, oxygenSat, simulatedAlerts])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    console.log("Données dans localStorage :", storedUser)
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      console.log("User récupéré :", userData)
      setUser(userData)
    } else {
      window.location.href = "/PatientSignin"
    }
  }, [])

  // Orange Alert Functions (Moderate)
  const triggerModerateGlucoseAlert = () => {
    alert(
      "⚠️ MODERATE GLUCOSE ALERT: Blood glucose levels are slightly elevated. Please monitor closely and consider checking with your healthcare provider.",
    )
    setSimulatedAlerts((prev) => ({
      ...prev,
      glucose: { active: true, type: "moderate", value: 145 },
    }))
    setAlertTriggers((prev) => ({ ...prev, glucose: true }))

    setTimeout(() => {
      setSimulatedAlerts((prev) => ({
        ...prev,
        glucose: { active: false, type: "normal", value: null },
      }))
      setAlertTriggers((prev) => ({ ...prev, glucose: false }))
    }, 8000)
  }

  const triggerModerateHeartRateAlert = () => {
    alert("⚠️ MODERATE HEART RATE ALERT: Heart rate is slightly elevated. Please rest and monitor your condition.")
    setSimulatedAlerts((prev) => ({
      ...prev,
      heartRate: { active: true, type: "moderate", value: 105 },
    }))
    setAlertTriggers((prev) => ({ ...prev, heartRate: true }))

    setTimeout(() => {
      setSimulatedAlerts((prev) => ({
        ...prev,
        heartRate: { active: false, type: "normal", value: null },
      }))
      setAlertTriggers((prev) => ({ ...prev, heartRate: false }))
    }, 8000)
  }

  const triggerModerateBloodPressureAlert = () => {
    alert("⚠️ MODERATE BLOOD PRESSURE ALERT: Blood pressure is slightly elevated. Please rest and monitor.")
    setSimulatedAlerts((prev) => ({
      ...prev,
      bloodPressure: { active: true, type: "moderate", systolic: 135, diastolic: 88 },
    }))
    setAlertTriggers((prev) => ({ ...prev, bloodPressure: true }))

    setTimeout(() => {
      setSimulatedAlerts((prev) => ({
        ...prev,
        bloodPressure: { active: false, type: "normal", systolic: null, diastolic: null },
      }))
      setAlertTriggers((prev) => ({ ...prev, bloodPressure: false }))
    }, 8000)
  }

  const triggerModerateOxygenAlert = () => {
    alert("⚠️ MODERATE OXYGEN ALERT: Oxygen saturation is slightly low. Please ensure proper breathing and monitor.")
    setSimulatedAlerts((prev) => ({
      ...prev,
      oxygen: { active: true, type: "moderate", value: 94 },
    }))
    setAlertTriggers((prev) => ({ ...prev, oxygen: true }))

    setTimeout(() => {
      setSimulatedAlerts((prev) => ({
        ...prev,
        oxygen: { active: false, type: "normal", value: null },
      }))
      setAlertTriggers((prev) => ({ ...prev, oxygen: false }))
    }, 8000)
  }

  // Critical Alert Functions (Red)
  const triggerCriticalGlucoseAlert = () => {
    alert(
      "🚨 CRITICAL GLUCOSE ALERT: Blood glucose levels are dangerously low! Seek immediate medical attention and consume fast-acting carbohydrates.",
    )
    setSimulatedAlerts((prev) => ({
      ...prev,
      glucose: { active: true, type: "critical", value: 55 },
    }))
    setAlertTriggers((prev) => ({ ...prev, glucose: true }))

    setTimeout(() => {
      setSimulatedAlerts((prev) => ({
        ...prev,
        glucose: { active: false, type: "normal", value: null },
      }))
      setAlertTriggers((prev) => ({ ...prev, glucose: false }))
    }, 10000)
  }

  const triggerCriticalHeartRateAlert = () => {
    alert(
      "🚨 CRITICAL HEART RATE ALERT: Dangerous heart rate detected! Contact emergency services immediately if you feel unwell.",
    )
    setSimulatedAlerts((prev) => ({
      ...prev,
      heartRate: { active: true, type: "critical", value: 45 },
    }))
    setAlertTriggers((prev) => ({ ...prev, heartRate: true }))

    setTimeout(() => {
      setSimulatedAlerts((prev) => ({
        ...prev,
        heartRate: { active: false, type: "normal", value: null },
      }))
      setAlertTriggers((prev) => ({ ...prev, heartRate: false }))
    }, 10000)
  }

  const triggerCriticalBloodPressureAlert = () => {
    alert("🚨 CRITICAL BLOOD PRESSURE ALERT: Blood pressure is dangerously high! Seek immediate medical attention.")
    setSimulatedAlerts((prev) => ({
      ...prev,
      bloodPressure: { active: true, type: "critical", systolic: 180, diastolic: 110 },
    }))
    setAlertTriggers((prev) => ({ ...prev, bloodPressure: true }))

    setTimeout(() => {
      setSimulatedAlerts((prev) => ({
        ...prev,
        bloodPressure: { active: false, type: "normal", systolic: null, diastolic: null },
      }))
      setAlertTriggers((prev) => ({ ...prev, bloodPressure: false }))
    }, 10000)
  }

  const triggerCriticalOxygenAlert = () => {
    alert("🚨 CRITICAL OXYGEN ALERT: Oxygen saturation is critically low! Seek immediate medical attention.")
    setSimulatedAlerts((prev) => ({
      ...prev,
      oxygen: { active: true, type: "critical", value: 88 },
    }))
    setAlertTriggers((prev) => ({ ...prev, oxygen: true }))

    setTimeout(() => {
      setSimulatedAlerts((prev) => ({
        ...prev,
        oxygen: { active: false, type: "normal", value: null },
      }))
      setAlertTriggers((prev) => ({ ...prev, oxygen: false }))
    }, 10000)
  }

  // Simulate real-time health data updates with wider ranges for testing
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update if no simulated alert is active
      if (!simulatedAlerts.glucose.active) {
        setGlucose((prev) => {
          const variation = (Math.random() - 0.5) * 20 // Increased variation
          let newVal = prev + variation
          if (newVal < 60) newVal = 60
          if (newVal > 200) newVal = 200
          return Math.round(newVal)
        })
      }

      if (!simulatedAlerts.heartRate.active) {
        setHeartRate((prev) => {
          const variation = (Math.random() - 0.5) * 15 // Increased variation
          let newVal = prev + variation
          if (newVal < 45) newVal = 45
          if (newVal > 130) newVal = 130
          return Math.round(newVal)
        })
      }

      if (!simulatedAlerts.bloodPressure.active) {
        setSystolic((prev) => {
          const variation = (Math.random() - 0.5) * 12 // Increased variation
          let newVal = prev + variation
          if (newVal < 85) newVal = 85
          if (newVal > 190) newVal = 190
          return Math.round(newVal)
        })

        setDiastolic((prev) => {
          const variation = (Math.random() - 0.5) * 8 // Increased variation
          let newVal = prev + variation
          if (newVal < 55) newVal = 55
          if (newVal > 115) newVal = 115
          return Math.round(newVal)
        })
      }

      if (!simulatedAlerts.oxygen.active) {
        setOxygenSat((prev) => {
          const variation = (Math.random() - 0.5) * 4 // Increased variation
          let newVal = prev + variation
          if (newVal < 85) newVal = 85
          if (newVal > 100) newVal = 100
          return Math.round(newVal)
        })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [simulatedAlerts])

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
        navigate("/Notifications")
        break
      case "listproches":
        navigate("/ListProches")
        break
      case "medrec":
        navigate("/MedRec")
        break
      case "logout":
        console.log("Logging out...")
        break
      default:
        break
    }
  }

  // Health status functions with simulated alert consideration
  const getGlucoseStatus = () => {
    const currentValue = simulatedAlerts.glucose.active ? simulatedAlerts.glucose.value : glucose
    const alertLevel = getValueAlertLevel("glucose", currentValue)

    if (alertLevel === "critical") {
      return { status: "Critique", color: "#EF4444", bgColor: "#FEE2E2" }
    }
    if (alertLevel === "moderate") {
      return { status: "Modéré", color: "#F59E0B", bgColor: "#FEF3C7" }
    }
    return { status: "Normal", color: "#10B981", bgColor: "#D1FAE5" }
  }

  const getHeartRateStatus = () => {
    const currentValue = simulatedAlerts.heartRate.active ? simulatedAlerts.heartRate.value : heartRate
    const alertLevel = getValueAlertLevel("heartRate", currentValue)

    if (alertLevel === "critical") {
      return { status: "Critique", color: "#EF4444", bgColor: "#FEE2E2" }
    }
    if (alertLevel === "moderate") {
      return { status: "Modéré", color: "#F59E0B", bgColor: "#FEF3C7" }
    }
    return { status: "Normal", color: "#10B981", bgColor: "#D1FAE5" }
  }

  const getBloodPressureStatus = () => {
    const currentSystolic = simulatedAlerts.bloodPressure.active ? simulatedAlerts.bloodPressure.systolic : systolic
    const currentDiastolic = simulatedAlerts.bloodPressure.active ? simulatedAlerts.bloodPressure.diastolic : diastolic
    const alertLevel = getValueAlertLevel("bloodPressure", currentSystolic, currentSystolic, currentDiastolic)

    if (alertLevel === "critical") {
      return { status: "Critique", color: "#EF4444", bgColor: "#FEE2E2" }
    }
    if (alertLevel === "moderate") {
      return { status: "Modéré", color: "#F59E0B", bgColor: "#FEF3C7" }
    }
    return { status: "Normale", color: "#10B981", bgColor: "#D1FAE5" }
  }

  const getOxygenStatus = () => {
    const currentValue = simulatedAlerts.oxygen.active ? simulatedAlerts.oxygen.value : oxygenSat
    const alertLevel = getValueAlertLevel("oxygen", currentValue)

    if (alertLevel === "critical") {
      return { status: "Critique", color: "#EF4444", bgColor: "#FEE2E2" }
    }
    if (alertLevel === "moderate") {
      return { status: "Modéré", color: "#F59E0B", bgColor: "#FEF3C7" }
    }
    return { status: "Normal", color: "#10B981", bgColor: "#D1FAE5" }
  }

  // Device Connection Status Component
  const DeviceConnectionStatus = () => {
    return (
      <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-6`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Connected Devices</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Smartwatch Connection */}
        <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
          <img src={watch} alt="Smartwatch" className="w-8 h-8" />
          <span className="font-medium">Smartwatch</span>
          </div>
          <div
          className={`w-3 h-3 rounded-full ${deviceConnections.smartwatch.connected ? "bg-green-500" : "bg-gray-300"}`}
          ></div>
        </div>
        {deviceConnections.smartwatch.connected && (
          <div className="text-sm text-gray-600 space-y-1">
          <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            MAC: {deviceConnections.smartwatch.macAddress}
          </p>
          </div>
        )}
        <button
          onClick={handleSmartwatchConnection}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          deviceConnections.smartwatch.connected
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {deviceConnections.smartwatch.connected ? "Disconnect" : "Connect"}
        </button>
        </div>

        {/* CGM Connection */}
        <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
          <img src={cgm} alt="CGM" className="w-8 h-8" />
          <span className="font-medium">CGM</span>
          </div>
          <div
          className={`w-3 h-3 rounded-full ${deviceConnections.cgm.connected ? "bg-green-500" : "bg-gray-300"}`}
          ></div>
        </div>
        {deviceConnections.cgm.connected && (
          <div className="text-sm text-gray-600 space-y-1">
          <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            MAC: {deviceConnections.cgm.macAddress}
          </p>
          </div>
        )}
        <button
          onClick={handleCGMConnection}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          deviceConnections.cgm.connected
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {deviceConnections.cgm.connected ? "Disconnect" : "Connect"}
        </button>
        </div>

        {/* Vehicle Connection */}
        <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
          <img src={car} alt="Vehicle" className="w-8 h-8" />
          <span className="font-medium">Vehicle</span>
          </div>
          <div
          className={`w-3 h-3 rounded-full ${deviceConnections.vehicle.connected ? "bg-green-500" : "bg-gray-300"}`}
          ></div>
        </div>
        {deviceConnections.vehicle.connected && (
          <div className="text-sm text-gray-600 space-y-1">
          <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            IP: {deviceConnections.vehicle.ipAddress}
          </p>
          <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            MAC: {deviceConnections.vehicle.macAddress}
          </p>
          </div>
        )}
        <button
          onClick={handleVehicleConnection}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          deviceConnections.vehicle.connected
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {deviceConnections.vehicle.connected ? "Disconnect" : "Connect"}
        </button>
        </div>
      </div>
      </div>
    )
  }

  // Compact Global Alert Status Component
  const GlobalAlertStatus = () => {
    const getStatusConfig = () => {
      switch (globalAlertStatus.level) {
        case "critical":
          return {
            bgColor: "bg-red-50",
            borderColor: "border-red-300",
            textColor: "text-red-800",
            iconColor: "text-red-600",
            icon: "🚨",
            label: "Critical Anomaly",
            pulseClass: "animate-pulse",
          }
        case "moderate":
          return {
            bgColor: "bg-orange-50",
            borderColor: "border-orange-300",
            textColor: "text-orange-800",
            iconColor: "text-orange-600",
            icon: "⚠️",
            label: "Moderate Anomaly",
            pulseClass: "animate-pulse",
          }
        default:
          return {
            bgColor: "bg-green-50",
            borderColor: "border-green-300",
            textColor: "text-green-800",
            iconColor: "text-green-600",
            icon: "✅",
            label: "No Anomaly",
            pulseClass: "",
          }
      }
    }

    const config = getStatusConfig()

    return (
      <div
        className={`${config.bgColor} ${config.borderColor} ${config.pulseClass} border rounded-lg p-4 mb-4 transition-all duration-300 shadow-sm`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-lg ${config.iconColor}`}>{config.icon}</span>
            <div>
              <h3 className={`text-sm font-semibold ${config.textColor}`}>{config.label}</h3>
              <p className={`text-xs ${config.textColor} opacity-75`}>{globalAlertStatus.message}</p>
            </div>
          </div>

          {globalAlertStatus.activeAlerts.length > 0 && (
            <div className="flex items-center space-x-2">
            
              <div className="text-xs text-gray-500">{globalAlertStatus.timestamp?.toLocaleTimeString()}</div>
            </div>
          )}
        </div>

        {globalAlertStatus.activeAlerts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {globalAlertStatus.activeAlerts.map((alert, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
              >
                {alert.metric}: {alert.value}
                {alert.source === "automatic" && <span className="ml-1 opacity-60">(Auto)</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Progress bar component
  const ProgressBar = ({ value, max, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div
        className="h-2 rounded-full transition-all duration-500 ease-in-out"
        style={{
          width: `${(value / max) * 100}%`,
          backgroundColor: color,
        }}
      />
    </div>
  )

  // Circular progress component
  const CircularProgress = ({ percentage, color, size = 80 }) => {
    const radius = (size - 8) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth="4" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>
            {percentage}%
          </span>
        </div>
      </div>
    )
  }

  // Trend indicator component
  const TrendIndicator = ({ trend = "stable", color }) => {
    const getTrendIcon = () => {
      switch (trend) {
        case "up":
          return "↗️"
        case "down":
          return "↘️"
        default:
          return "➡️"
      }
    }

    return (
      <span className="text-sm font-medium" style={{ color }}>
        {getTrendIcon()} {trend}
      </span>
    )
  }
 
  // Critical Alert Button Component (Red)
  const CriticalAlertButton = ({ onClick, isActive, position = "top-right" }) => {
    const positionClasses = {
      "top-right": "top-2 right-2",
      "top-left": "top-2 left-2",
      "bottom-right": "bottom-2 right-2",
      "bottom-left": "bottom-2 left-2",
    }

  /* BOUTON ALERTE ROUGE  return (
   <button
        onClick={onClick}
        className={`absolute ${positionClasses[position]} w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          isActive
            ? "bg-red-500 border-red-600 animate-pulse shadow-lg"
            : "bg-gray-100 border-gray-300 hover:bg-red-100 hover:border-red-400"
        }`}
        title="Trigger Critical Alert"
      >
        <span className={`text-xs font-bold ${isActive ? "text-white" : "text-red-500"}`}>🚨</span>
      </button>
    )*/
  }

  // Moderate Alert Button Component (Orange)
  const ModerateAlertButton = ({ onClick, isActive, position = "top-left" }) => {
    const positionClasses = {
      "top-right": "top-2 right-2",
      "top-left": "top-2 left-2",
      "bottom-right": "bottom-2 right-2",
      "bottom-left": "bottom-2 left-2",
    }
  /*
    return (
      <button
        onClick={onClick}
        className={`absolute ${positionClasses[position]} w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          isActive
            ? "bg-orange-500 border-orange-600 animate-pulse shadow-lg"
            : "bg-gray-100 border-gray-300 hover:bg-orange-100 hover:border-orange-400"
        }`}
        title="Trigger Moderate Alert"
      >
        <span className={`text-xs font-bold ${isActive ? "text-white" : "text-orange-500"}`}>⚠️</span>
      </button>
    )*/
  }

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
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
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
      default:
        return null
    }
  }

  if (!user) {
    return <p>Chargement...</p>
  }

  const glucoseStatus = getGlucoseStatus()
  const heartRateStatus = getHeartRateStatus()
  const bloodPressureStatus = getBloodPressureStatus()
  const oxygenStatus = getOxygenStatus()

  // Get display values (simulated or real)
  const displayGlucose = simulatedAlerts.glucose.active ? simulatedAlerts.glucose.value : glucose
  const displayHeartRate = simulatedAlerts.heartRate.active ? simulatedAlerts.heartRate.value : heartRate
  const displaySystolic = simulatedAlerts.bloodPressure.active ? simulatedAlerts.bloodPressure.systolic : systolic
  const displayDiastolic = simulatedAlerts.bloodPressure.active ? simulatedAlerts.bloodPressure.diastolic : diastolic
  const displayOxygen = simulatedAlerts.oxygen.active ? simulatedAlerts.oxygen.value : oxygenSat

  console.log("Nom du patient:", user.result.name)

  return (
    <div
      className={`flex flex-col md:flex-row h-screen ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}
    >
      {/* Mobile Header */}
      <div
        className={`md:hidden flex items-center justify-between p-4 ${isDark ? "bg-gray-800" : "bg-white"} shadow-md`}
      ></div>

      {/* Vertical Menu - Desktop */}
      <div className={`hidden md:flex flex-col w-64 ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg h-full`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-[#f05050] flex items-center justify-center text-white font-medium text-lg">
              {user.result.name.charAt(0)} {user.result.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium"> {user.result.name}</h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user.result.lastName}</p>
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
                onClick={() => handleNavClick("listproches")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeItem === "user"
                    ? "bg-[#f05050] text-white shadow-md"
                    : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                }`}
              >
                <span className="mr-3 h-5 w-5">{renderIcon("user")}</span>
                <span className="font-medium">Friends</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick("medrec")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeItem === "activity"
                    ? "bg-[#f05050] text-white shadow-md"
                    : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                }`}
              >
                <span className="mr-3 h-5 w-5">{renderIcon("activity")}</span>
                <span className="font-medium">Medical Records</span>
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
                  <h2 className="text-lg font-bold">E-mergency</h2>
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
                    onClick={() => handleNavClick("listproches")}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeItem === "user"
                        ? "bg-[#f05050] text-white shadow-md"
                        : `${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`
                    }`}
                  >
                    <span className="mr-3 h-5 w-5">{renderIcon("user")}</span>
                    <span className="font-medium">Relatives</span>
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
      <div className="flex-1 overflow-auto">
        <div className="p-6 mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold mb-6">
              Welcome, {user.result.name} {user.result.lastName}
            </h2>

            {/* Compact Global Alert Status Area */}
            <GlobalAlertStatus />

            {/* Device Connection Status */}
            <DeviceConnectionStatus />

            {/* Health Metrics Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Glucose Widget */}
              <div
                className={`relative ${
                  isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"
                } rounded-lg shadow-md p-6 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer h-64 flex flex-col justify-between`}
              >
                <CriticalAlertButton
                  onClick={triggerCriticalGlucoseAlert}
                  isActive={simulatedAlerts.glucose.active && simulatedAlerts.glucose.type === "critical"}
                  position="top-right"
                />
                <ModerateAlertButton
                  onClick={triggerModerateGlucoseAlert}
                  isActive={simulatedAlerts.glucose.active && simulatedAlerts.glucose.type === "moderate"}
                  position="top-left"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Blood Glucose</h3>
                    <div
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: glucoseStatus.bgColor,
                        color: glucoseStatus.color,
                      }}
                    >
                      {glucoseStatus.status}
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold transition-all duration-300 ${
                        simulatedAlerts.glucose.active ? "animate-pulse" : ""
                      }`}
                      style={{ color: glucoseStatus.color }}
                    >
                      {displayGlucose}
                    </div>
                    <div className="text-sm text-gray-600">mg/dL</div>
                    <ProgressBar value={displayGlucose} max={200} color={glucoseStatus.color} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target: 80-125</span>
                    <TrendIndicator
                      trend={simulatedAlerts.glucose.active ? "down" : "stable"}
                      color={glucoseStatus.color}
                    />
                  </div>
                </div>
              </div>

              {/* Heart Rate Widget */}
                      <div
                      className={`relative ${
                        isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"
                      } rounded-lg shadow-md p-6 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer h-64 flex flex-col justify-between`}
                      >
                      <CriticalAlertButton
                        onClick={triggerCriticalHeartRateAlert}
                        isActive={simulatedAlerts.heartRate.active && simulatedAlerts.heartRate.type === "critical"}
                        position="top-right"
                      />
                      <ModerateAlertButton
                        onClick={triggerModerateHeartRateAlert}
                        isActive={simulatedAlerts.heartRate.active && simulatedAlerts.heartRate.type === "moderate"}
                        position="top-left"
                      />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Heart Rate</h3>
                        <div
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                          backgroundColor: heartRateStatus.bgColor,
                          color: heartRateStatus.color,
                          }}
                        >
                          {heartRateStatus.status}
                        </div>
                        </div>
                        <div className="text-center">
                        <div
                          className={`text-3xl font-bold transition-all duration-300 ${
                          simulatedAlerts.heartRate.active ? "animate-pulse" : ""
                          }`}
                          style={{ color: heartRateStatus.color }}
                        >
                          {displayHeartRate}
                        </div>
                        <div className="text-sm text-gray-600">BPM</div>
                        <div className="mt-2 flex justify-center">
                          <div className="w-16 h-8 flex items-end space-x-1">
                          {[...Array(8)].map((_, i) => (
                            <div
                            key={i}
                            className="bg-current animate-pulse"
                            style={{
                              width: "2px",
                              height: `${Math.random() * 20 + 10}px`,
                              color: heartRateStatus.color,
                              animationDelay: `${i * 0.1}s`,
                            }}
                            />
                          ))}
                          </div>
                        </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Normal: 60-100</span>
                        <TrendIndicator
                          trend={simulatedAlerts.heartRate.active ? "down" : "stable"}
                          color={heartRateStatus.color}
                        />
                        </div>
                      </div>
                      </div>

                      {/* Blood Pressure Widget */}
                              <div
                              className={`relative ${
                                isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"
                              } rounded-lg shadow-md p-6 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer h-64 flex flex-col justify-between`}
                              >
                              <CriticalAlertButton
                                onClick={triggerCriticalBloodPressureAlert}
                                isActive={simulatedAlerts.bloodPressure.active && simulatedAlerts.bloodPressure.type === "critical"}
                                position="top-right"
                              />
                              <ModerateAlertButton
                                onClick={triggerModerateBloodPressureAlert}
                                isActive={simulatedAlerts.bloodPressure.active && simulatedAlerts.bloodPressure.type === "moderate"}
                                position="top-left"
                              />
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">Blood Pressure</h3>
                                <div
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                  backgroundColor: bloodPressureStatus.bgColor,
                                  color: bloodPressureStatus.color,
                                  }}
                                >
                                  {bloodPressureStatus.status}
                                </div>
                                </div>
                                <div className="text-center space-y-2">
                                <div className="flex items-center justify-center space-x-2">
                                  <div>
                                  <div
                                    className={`text-2xl font-bold transition-all duration-300 ${
                                    simulatedAlerts.bloodPressure.active ? "animate-pulse" : ""
                                    }`}
                                    style={{ color: bloodPressureStatus.color }}
                                  >
                                    {displaySystolic}
                                  </div>
                                  <div className="text-xs text-gray-600">SYS</div>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-400">/</div>
                                  <div>
                                  <div
                                    className={`text-2xl font-bold transition-all duration-300 ${
                                    simulatedAlerts.bloodPressure.active ? "animate-pulse" : ""
                                    }`}
                                    style={{ color: bloodPressureStatus.color }}
                                  >
                                    {displayDiastolic}
                                  </div>
                                  <div className="text-xs text-gray-600">DIA</div>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">mmHg</div>
                                <div className="space-y-1">
                                  <ProgressBar value={displaySystolic} max={160} color={bloodPressureStatus.color} />
                                  <ProgressBar value={displayDiastolic} max={100} color={bloodPressureStatus.color} />
                                </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Normal: &lt;120/80</span>
                                <TrendIndicator
                                  trend={simulatedAlerts.bloodPressure.active ? "up" : "stable"}
                                  color={bloodPressureStatus.color}
                                />
                                </div>
                              </div>
                              </div>

                              {/* Oxygen Saturation Widget */}
              <div
                className={`relative ${
                  isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"
                } rounded-lg shadow-md p-6 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer h-64 flex flex-col justify-between`}
              >
                <CriticalAlertButton
                  onClick={triggerCriticalOxygenAlert}
                  isActive={simulatedAlerts.oxygen.active && simulatedAlerts.oxygen.type === "critical"}
                  position="top-right"
                />
                <ModerateAlertButton
                  onClick={triggerModerateOxygenAlert}
                  isActive={simulatedAlerts.oxygen.active && simulatedAlerts.oxygen.type === "moderate"}
                  position="top-left"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Oxygen Saturation</h3>
                    <div
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: oxygenStatus.bgColor,
                        color: oxygenStatus.color,
                      }}
                    >
                      {oxygenStatus.status}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={simulatedAlerts.oxygen.active ? "animate-pulse" : ""}>
                      <CircularProgress percentage={displayOxygen} color={oxygenStatus.color} size={100} />
                    </div>
                    <div className="text-sm text-gray-600 mt-2">SpO₂</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Normal: &gt;95%</span>
                    <TrendIndicator
                      trend={simulatedAlerts.oxygen.active ? "down" : "stable"}
                      color={oxygenStatus.color}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Patient




