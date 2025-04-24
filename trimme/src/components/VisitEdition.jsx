import { use, useEffect } from "react";
import { useState } from "react";
import SearchEmployee from "../hooks/SearchEmployee";
import SearchService from "../hooks/SearchService";
import SearchCustomer from "../hooks/SearchCustomer";
import { firestoreDatabase } from "../Database";
import { doc, updateDoc } from "firebase/firestore";

export default function VisitEdition({selectedEvent, setEvents, setVisitPreview,setEditedEvent, setEditEvent}) {
{
    const {customers, cusSearchTerm, setCustomers, setCusSearchTerm} = SearchCustomer();
    const {employees, empSearchTerm, setEmployees, setEmpSearchTerm} = SearchEmployee();
    const {services, servSearchTerm, setServices, setServSearchTerm} = SearchService();
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedService, setSelectedService] = useState("");
    const [isDropdownEmpOpen, setIsDropdownEmpOpen] = useState(false);
    const [isDropdownCusOpen, setIsDropdownCusOpen] = useState(false);
    const [isDropdownServOpen, setIsDropdownServOpen] = useState(false);
    const todayDate = new Date().toISOString().split("T")[0];
    const [servicesList, setServicesList] = useState([
        { id: Date.now(), serviceSearchTerm: "", selectedService: "" },
    ]);
    const [formData, setFormData] = useState({
        date: selectedEvent.date.split("T")[0] || todayDate,
        startTime: selectedEvent.startTime || "00:00",
        endTime: selectedEvent.endTime || "00:00",
        selectedCustomer: selectedEvent.customer || "",
        selectedEmployee: selectedEvent.employee || "",
        selectedService: selectedEvent.services || [],
        color: selectedEvent.color || "#000000",
    });

    useEffect(() => {
        if (selectedEvent && selectedEvent.services && selectedEvent.services.length > 0) {
            setServicesList(
                selectedEvent.services.map((servStr) => ({
                    id: Date.now() + Math.random(), // unikalne ID
                    serviceSearchTerm: "",
                    selectedService: servStr, // cały string, np. "Strzyżenie męskie 30 min"
                }))
            );
        }
        if (selectedEvent) {
            setSelectedEmployee(selectedEvent.employee || "");
            setSelectedCustomer(selectedEvent.customer || "");
        }
    }, [selectedEvent]);

    const handleEmployeeSelect = (emp) => {
        setSelectedEmployee(`${emp.name} ${emp.surname}`);
        setFormData((prev)=>({...prev, color: emp.color}));
        setIsDropdownEmpOpen(false);
      };
       const handleCustomerSelect = (cus) => {
        setSelectedCustomer(`${cus.name} ${cus.surname}`);
        setIsDropdownCusOpen(false);
      }
      const handleServiceSelect = (id, selectedServ) => {
        setServicesList(servicesList.map((serv) => 
            serv.id === id 
            ? { 
                ...serv, 
                duration: selectedServ.duration,
                selectedService: `${selectedServ.name} ${selectedServ.duration} min`, 
                serviceSearchTerm: "",
            } 
            : serv
        ));
        setIsDropdownServOpen(null);
    };
    
    const handleRemoveService = (id) => {
    setServicesList(servicesList.filter((serv) => serv.id !== id));
    };

    const handleAddService = () => {
    setServicesList([...servicesList, { id: Date.now(), serviceSearchTerm: "", selectedService: "" }]);
    };

    const handleEditEvent = async (e) => {
        e.preventDefault();
        const updatedEvent = {
            employee: selectedEmployee,
            customer: selectedCustomer,
            services: servicesList.map((serv) => serv.selectedService),
            startTime: `${formData.date}T${formData.startTime}`,
            endTime: `${formData.date}T${formData.endTime}`,

        };
        try {
            await updateDoc(doc(firestoreDatabase, "appointments", selectedEvent.id), {
                ...updatedEvent,
                color: formData.color,
            });
            setVisitPreview(false);
        } catch (error) {
            console.error("Błąd podczas aktualizacji wizyty:", error);
        }
    }

    return (
        <div className=" p-4 rounded-md flex flex-col gap-2 items-center">
            <form onSubmit={handleEditEvent} className="flex flex-col gap-4 w-full">
                <div className="flex flex-col p-5">
                <h2>Edytuj wizytę</h2>
                <div>
                    <label htmlFor="">Pracownik </label>
                    <input type="text" 
                    value={selectedEmployee || empSearchTerm}
                    onChange={(e) => {
                        setEmpSearchTerm(e.target.value);
                        setSelectedEmployee(""); // Reset wyboru przy nowym wyszukiwaniu
                      }}
                      onFocus={() => setIsDropdownEmpOpen(true)}
                      onBlur={() => setTimeout(() => setIsDropdownEmpOpen(false), 200)} // Opóźnienie na kliknięcie
                      placeholder="Wpisz imię lub nazwisko"
                      className="p-2 border border-gray-400 rounded-md mb-4"
                    />
              
                    {/* Lista rozwijana */}
                    {isDropdownEmpOpen && employees.length > 0 && (
                      <ul className="absolute top-24 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto w-full z-10">
                        {employees.map((emp) => (
                          <li
                            key={emp.id}
                            onClick={() => {
                              handleEmployeeSelect(emp);
                              setSelectedEmployee(`${emp.name} ${emp.surname}`); // Ustawienie wybranego pracownika w inpucie
                              setIsDropdownCusOpen(false); // Zamknięcie dropdownu po wyborze
                            }}
                            className="p-2 hover:bg-pink-100 cursor-pointer"
                          >
                            {emp.name} {emp.surname}
                          </li>
                        ))}
                      </ul>
                      )}
                </div>
                <div>
                    <label htmlFor="">Klient</label>
                    <input type="text"
                    value={selectedCustomer || cusSearchTerm}
                    onChange={(e) => {
                        setCusSearchTerm(e.target.value);
                        setSelectedCustomer(""); // Reset wyboru przy nowym wyszukiwaniu
                      }}
                      onFocus={() => setIsDropdownCusOpen(true)}
                      onBlur={() => setTimeout(() => setIsDropdownCusOpen(false), 200)} // Opóźnienie na kliknięcie
                      placeholder="Wpisz imię lub nazwisko lub numer telefonu"
                      className="p-2 border border-gray-400 rounded-md mb-4"
                    />
                    {/* Lista rozwijana */}
                    {isDropdownCusOpen && customers.length > 0 && (
                        <ul className="absolute top-40 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto w-full z-10">
                        {customers.map((cus) => (
                            <li
                            key={cus.id}
                            onClick={() => {
                                handleCustomerSelect(cus);
                                setSelectedCustomer(`${cus.name} ${cus.surname}`); // Ustawienie wybranego pracownika w inpucie
                                setIsDropdownCusOpen(false); // Zamknięcie dropdownu po wyborze
                            }}
                            className="p-2 hover:bg-pink-100 cursor-pointer"
                            >
                            {cus.name} {cus.surname} {cus.phone}
                            </li>
                        ))}
                        </ul>
                        )}
                </div>
                <div>
                    <label htmlFor="">Usługa</label>
                    {servicesList.map((serv,index) => (
                        <div key={serv.id} className="flex flex-row gap-2 mb-2">
                            <input type="text" 
                            value={serv.selectedService.name || serv.serviceSearchTerm} 
                            onChange={(e) => handleServiceChange(serv.id, e.target.value)}
                            onFocus={() => setIsDropdownServOpen(serv.id)}
                            onBlur={() => setTimeout(() => setIsDropdownServOpen(null), 200)}
                            placeholder="Wpisz nazwę usługi"
                            className="p-2 border border-gray-400 rounded-md w-64"
                        />

                        {isDropdownServOpen === serv.id && services.length > 0 && (
                            <ul className="absolute top-12 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto w-64 z-10">
                                {services
                                    .filter((s) => s.name.toLowerCase().includes(serv.serviceSearchTerm.toLowerCase()))
                                    .map((service) => (
                                        <li
                                            key={service.id}
                                            onClick={() => handleServiceSelect(serv.id, service)}
                                            className="p-2 hover:bg-pink-100 cursor-pointer"
                                        >
                                            {service.name} {service.duration} min
                                        </li>
                                    ))}
                            </ul>
                        )}

                        {/* Przycisk do usuwania usługi (tylko jeśli jest więcej niż jedna) */}
                        {servicesList.length > 1 && (
                            <button
                                onClick={() => handleRemoveService(serv.id)}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded shadow-md"
                            >
                                -
                            </button>
                        )}

                        {/* Przycisk do dodania nowej usługi */}
                        {index === servicesList.length - 1 && (
                            <button
                                onClick={handleAddService}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded shadow-md"
                            >
                                +
                            </button>
                        )}
                    </div>
                ))}

                    {/* Przycisk do czyszczenia usług */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setServicesList([{ id: Date.now(), serviceSearchTerm: "", selectedService: "" }]);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200 m-4 w-1/2"
                    >
                        Wyczyść usługi
                    </button>
                </div>
                <div>
                <label>Data wizyty</label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="p-2 border border-gray-400 rounded-md mb-4"
                />
                </div>
                <div>
                <label>Godzina rozpoczęcia</label>
                <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="p-2 border border-gray-400 rounded-md mb-4"
                />
                </div>
                <div>
                <label>Godzina zakończenia</label>
                <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="p-2 border border-gray-400 rounded-md mb-4"
                />
                </div>

                <button 
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200 mt-4 w-full">
                    Zapisz zmiany
                </button>
                <button 
                    onClick={() => setEditEvent(false)} 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200 mt-2 w-full">
                    Anuluj
                </button>
                </div>
            </form>
            
        </div>
    );
}
    
    } 