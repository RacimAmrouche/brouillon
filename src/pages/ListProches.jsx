import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Addp,Delp, Showp } from '../../services/pat';

const ListProches = () => {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [proches, setProches] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentProche, setCurrentProche] = useState(null);
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });
    
    const [addFormData, setAddFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });



    // Load user data and fetch contacts on component mount
    useEffect(() => {
        const initializeComponent = async () => {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                navigate("/PatientSignin");
                return;
            }

            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                await fetchProches(userData.result.uid);
            } catch (error) {
                console.error("Error parsing user data:", error);
                navigate("/PatientSignin");
            }
        };

        initializeComponent();
    }, [navigate]);

    // Clear messages after 5 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    // Fetch contacts from backend
    const fetchProches = async (patientUID) => {
        setLoading(true);
        setError('');
    
        try {
            console.log("Fetching contacts for patient:", patientUID);
    
            const formData = new FormData();
            formData.append("patient", patientUID); // ⚠️ CORRIGÉ : clé "patient" pour correspondre au [FromForm]string patient
    
            const response = await Showp(formData);
    
            console.log("Backend response:", response.data);
    
            if (Array.isArray(response.data)) {
                const transformedProches = response.data.map((proche) => {
                    const nameParts = proche.Name ? proche.Name.split(" ") : ["", ""];
                    return {
                        idProche: proche.idProche,     // minuscule ici, identifiant unique
                        name: proche.name,             // minuscule ici, nom complet
                        phoneNumber: proche.phoneNumber,  // minuscule ici, téléphone
                        firstName: nameParts[0] || "",
                        lastName: nameParts.slice(1).join(" ") || "",
                    };
                });
    
                setProches(transformedProches);
                localStorage.setItem("proches", JSON.stringify(transformedProches));
            } else {
                console.warn("No contacts found or unexpected response:", response.data);
                setProches([]);
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
            setError("Failed to load contacts");
            setProches([]);
        } finally {
            setLoading(false);
        }
    };
    

    // Filter proches based on search term
    const filteredProches = searchTerm.trim() === ""
    ? proches
    : proches.filter(proche => {
        const fullName = proche.name?.toLowerCase() || "";
        const phone = proche.phoneNumber || "";

        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            phone.includes(searchTerm)
        );
    });


    // Handle form input changes for modal
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle form input changes for add form
    const handleAddFormInputChange = (e) => {
        const { name, value } = e.target;
        setAddFormData({
            ...addFormData,
            [name]: value
        });
    };

    // Toggle add form visibility
    const toggleAddForm = () => {
        setIsAddFormVisible(!isAddFormVisible);
        if (!isAddFormVisible) {
            setAddFormData({
                firstName: '',
                lastName: '',
                phoneNumber: ''
            });
        }
        setError('');
        setSuccess('');
    };

    // Open modal for editing proche
   

    // Open confirmation modal for deleting proche
    const handleDeleteClick = (proche) => {
        setCurrentProche(proche);
        setIsDeleteModalOpen(true);
        setError('');
        setSuccess('');
    };

    // Add new contact
    const handleAddProche = async (e) => {
        e.preventDefault();
    
        const { firstName, lastName, phoneNumber } = addFormData;
    
        // Validation des champs
        if (!firstName?.trim() || !lastName?.trim() || !phoneNumber?.trim()) {
            setError("Veuillez remplir tous les champs.");
            return;
        }
    
        if (!user?.result?.uid) {
            setError("Utilisateur non authentifié.");
            return;
        }
    
        setLoading(true);
        setError('');
        setSuccess('');
    
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("PatientUID", user.result.uid);
            formDataToSend.append("PhoneNumber", phoneNumber.trim());
            formDataToSend.append("Name", `${firstName.trim()} ${lastName.trim()}`);
    
            console.log("Données envoyées pour ajout de contact :", {
                PatientUID: user.result.uid,
                PhoneNumber: phoneNumber.trim(),
                Name: `${firstName.trim()} ${lastName.trim()}`,
            });
    
            const response = await Addp(formDataToSend);
            console.log("Réponse du backend :", response.data);
    
            setSuccess("Contact ajouté avec succès.");
            setAddFormData({ firstName: '', lastName: '', phoneNumber: '' });
            setIsAddFormVisible(false);
    
            // Rafraîchir la liste des contacts
            await fetchProches(user.result.uid);
        } catch (error) {
            console.error("Erreur lors de l'ajout du contact :", error);
            setError(error.response?.data || "Échec de l'ajout du contact.");
        } finally {
            setLoading(false);
        }
    };
    

    // Save contact from modal (edit)
    const handleSaveProche = async () => {
        if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
            setError("Please fill in all fields");
            return;
        }

        if (!user || !currentProche) {
            setError("Invalid operation");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("PatientUID", user.result.uid);
            formDataToSend.append("Name", `${formData.firstName} ${formData.lastName}`);
            formDataToSend.append("PhoneNumber", formData.phoneNumber);
            formDataToSend.append("ProcheID", currentProche.IdProche);

            console.log("Updating contact with data:", {
                PatientUID: user.result.uid,
                Name: `${formData.firstName} ${formData.lastName}`,
                PhoneNumber: formData.phoneNumber,
                ProcheID: currentProche.IdProche,
            });

            const response = await Addp(formDataToSend);

            console.log("Update contact response:", response.data);

            setSuccess("Contact updated successfully");
            setIsModalOpen(false);
            setCurrentProche(null);
            setFormData({ firstName: '', lastName: '', phoneNumber: '' });

            // Refresh contacts list
            await fetchProches(user.result.uid);
        } catch (error) {
            console.error("Error updating contact:", error);
            setError(error.response?.data || "Failed to update contact");
        } finally {
            setLoading(false);
        }
    };

    // Confirm deletion of proche
    const confirmDelete = async () => {
        if (!currentProche || !user) {
            setError("Invalid operation");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
      

        try {   console.log("Deleting contact with data:", {
            PatientUID: user.result.uid,
            ProcheID: currentProche.IdProche,
        });
            const formData = new FormData();
            formData.append("PatientUID", user.result.uid);
            console.log(patientUID, "PatientUID >>>", user.result.uid);

            formData.append("ProcheID", currentProche.IdProche);

            console.log("Deleting contact with data:", {
                PatientUID: user.result.uid,
                ProcheID: currentProche.IdProche,
            });

            const response = await Delp(formData);

            console.log("Delete contact response:", response.data);

            setSuccess("Contact deleted successfully");
            setIsDeleteModalOpen(false);
            setCurrentProche(null);

            // Refresh contacts list
            await fetchProches(user.result.uid);
        } catch (error) {
            console.error("Error deleting contact:", error);
            setError(error.response?.data || "Failed to delete contact");
        } finally {
            setLoading(false);
        }
    };

    // Go back to dashboard
    const handleBack = () => {
        navigate('/Patient');
    };

    // Render icons
    const renderIcon = (name) => {
        switch(name) {
            case 'search':
                return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
            case 'edit':
                return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
            case 'delete':
                return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
            case 'plus':
                return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
            case 'back':
                return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
            case 'phone':
                return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
            case 'user':
                return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
            case 'x':
                return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
            case 'chevron-down':
                return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
            case 'chevron-up':
                return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>;
            case 'loader':
                return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;
            default:
                return null;
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4">Loading...</p>
                </div>
            </div>
        );
    }
    console.log("filteredProches >>>", filteredProches);
    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
            {/* Header */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md p-4`}>
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <button 
                            onClick={handleBack}
                            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            {renderIcon('back')}
                        </button>
                        <h1 className="text-xl font-bold">Friends</h1>
                    </div>
                    <button 
                        onClick={toggleAddForm}
                        className="bg-[#f05050] text-white px-4 py-2 rounded-lg flex items-center"
                        disabled={loading}
                    >
                        {renderIcon(isAddFormVisible ? 'chevron-up' : 'plus')}
                        <span className="ml-2">{isAddFormVisible ? 'Close' : 'Add'}</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4">
                {/* Error/Success Messages */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {/* Add Form - Collapsible */}
                {isAddFormVisible && (
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 mb-6 transition-all duration-300`}>
                        <h2 className="text-lg font-semibold mb-4">Add a Contact</h2>
                        <form onSubmit={handleAddProche}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={addFormData.firstName}
                                        onChange={handleAddFormInputChange}
                                        className={`w-full px-3 py-2 rounded-lg border ${
                                            isDark 
                                                ? 'bg-gray-700 text-white border-gray-600' 
                                                : 'bg-white text-gray-900 border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-[#f05050]`}
                                        placeholder="First Name"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={addFormData.lastName}
                                        onChange={handleAddFormInputChange}
                                        className={`w-full px-3 py-2 rounded-lg border ${
                                            isDark 
                                                ? 'bg-gray-700 text-white border-gray-600' 
                                                : 'bg-white text-gray-900 border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-[#f05050]`}
                                        placeholder="Last Name"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={addFormData.phoneNumber}
                                        onChange={handleAddFormInputChange}
                                        className={`w-full px-3 py-2 rounded-lg border ${
                                            isDark 
                                                ? 'bg-gray-700 text-white border-gray-600' 
                                                : 'bg-white text-gray-900 border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-[#f05050]`}
                                        placeholder="Phone Number"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-[#f05050] text-white px-4 py-2 rounded-lg hover:bg-[#e04040] flex items-center"
                                    disabled={loading}
                                >
                                    {loading && renderIcon('loader')}
                                    <span className={loading ? 'ml-2' : ''}>
                                        {loading ? 'Adding...' : 'Add'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search Bar */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 mb-6`}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {renderIcon('search')}
                        </div>
                        <input
                            type="text"
                            placeholder="Search a contact..."
                            className={`pl-10 pr-4 py-2 w-full rounded-lg ${
                                isDark 
                                    ? 'bg-gray-700 text-white border-gray-600 focus:border-gray-500' 
                                    : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500'
                            } border focus:ring-2 focus:ring-opacity-50 focus:outline-none`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Contacts List */}
                
            </div>



{/* Contacts List */}
<div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
    {loading && proches.length === 0 ? (
        <div className="p-6 text-center">
            <div className="flex justify-center items-center">
                {renderIcon('loader')}
                <span className="ml-2">Loading contacts...</span>
            </div>
        </div>
    ) : filteredProches.length === 0 ? (
        <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "No contact found" : "No contact added"}
            </p>
        </div>
    ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProches.map((proche) => (
                <li key={proche.idProche} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center mb-1">
                                <span className="mr-2">{renderIcon('user')}</span>
                                <h3 className="font-medium">{proche.name}</h3>
                            </div>
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                                <span className="mr-2">{renderIcon('phone')}</span>
                                <p>{proche.phoneNumber}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                  
                            <button 
                                onClick={() => handleDeleteClick(proche)}
                                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
                                aria-label="Delete"
                                disabled={loading}
                            >
                                {renderIcon('delete')}
                            </button>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )}
</div>






            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-full max-w-md mx-4`}>
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold">Edit a contact</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                disabled={loading}
                            >
                                {renderIcon('x')}
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border ${
                                        isDark 
                                            ? 'bg-gray-700 text-white border-gray-600' 
                                            : 'bg-white text-gray-900 border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#f05050]`}
                                    placeholder="First Name"
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border ${
                                        isDark 
                                            ? 'bg-gray-700 text-white border-gray-600' 
                                            : 'bg-white text-gray-900 border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#f05050]`}
                                    placeholder="Last Name"
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border ${
                                        isDark 
                                            ? 'bg-gray-700 text-white border-gray-600' 
                                            : 'bg-white text-gray-900 border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#f05050]`}
                                    placeholder="Phone Number"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={`px-4 py-2 rounded-lg mr-2 ${
                                    isDark 
                                        ? 'bg-gray-700 hover:bg-gray-600' 
                                        : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProche}
                                className="bg-[#f05050] text-white px-4 py-2 rounded-lg hover:bg-[#e04040] flex items-center"
                                disabled={loading}
                            >
                                {loading && renderIcon('loader')}
                                <span className={loading ? 'ml-2' : ''}>
                                    {loading ? 'Saving...' : 'Save'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-full max-w-md mx-4`}>
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                            <p className="mb-4">
                                Are you sure you want to delete {currentProche?.name} from your contacts?
                            </p>
                        </div>
                        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className={`px-4 py-2 rounded-lg mr-2 ${
                                    isDark 
                                        ? 'bg-gray-700 hover:bg-gray-600' 
                                        : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center"
                                disabled={loading}
                            >
                                {loading && renderIcon('loader')}
                                <span className={loading ? 'ml-2' : ''}>
                                    {loading ? 'Deleting...' : 'Delete'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListProches;