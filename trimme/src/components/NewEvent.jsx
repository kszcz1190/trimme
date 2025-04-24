import { useState, useEffect, use } from "react";
import { firestoreDatabase } from "../Database";
import { collection, getDocs,addDoc } from "firebase/firestore";
import SearchEmployee from "../hooks/SearchEmployee";
import SearchService from "../hooks/SearchService";
import SearchCustomer from "../hooks/SearchCustomer";
import AddCustomer from "./AddCustomer";
export default function NewEvent({dateAndTime,setNewEvent,events,setEvents}) {


  const [formData, setFormData] = useState({
    title: "",
    date: dateAndTime.date,
    startTime: dateAndTime.startTime,
    endTime: dateAndTime.endTime,
    selectedCustomer: "",
    selectedEmployee: "",
    selectedService: "",
    color: "",
  });

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
  const [formVisible, setFormVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [servicesList, setServicesList] = useState([{ id: Date.now(), servSearchTerm: "", selectedService: "", duration: 0 }]);


  useEffect(() => {
    // pobranie daty i godziny z propsa
    // jeśli data i godzina są przekazane, ustawienie ich w formularzu
    if (dateAndTime) {
      const eventDate = new Date(dateAndTime);
      const date = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const startTime = eventDate.toTimeString().split(' ')[0]; // HH:MM:SS
      const endTime = startTime

      setFormData({
        ...formData,
        date: date,
        startTime: startTime,
        endTime: endTime,
      });
    }
  }, [dateAndTime]);

  useEffect(() => {
    // Obliczanie godziny zakonczenia na podstawie godziny rozpoczęcia i czasu trwania usługi
    const totalDuration = servicesList.reduce((acc, serv) => acc + (serv.duration || 0), 0); // Suma czasu trwania wszystkich usług
    const startTime = new Date(`${formData.date} ${formData.startTime}`);
    const endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000); // Dodanie czasu trwania do godziny rozpoczęcia
    const formattedEndTime = endTime.toTimeString().split(' ')[0]; // HH:MM:SS
    setFormData((prev) => ({ ...prev, endTime: formattedEndTime })); // Ustawienie godziny zakończenia w formularzu
  }, [servicesList, formData.date, formData.startTime]);


    // 🔥 Obsługa dodawania wydarzenia i zapisywania do Firestore
  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (!selectedEmployee || !selectedCustomer) {
      setErrorMsg("Wszystkie pola są wymagane.");
      return;
    }
    //sprawdzenie czy usługa została wybrana
    if (servicesList.length === 0 || servicesList.some((serv) => !serv.selectedService)) {
      setErrorMsg("Wybierz przynajmniej jedną usługę.");
      return;
    }

    //sprawdzenie czy data jest w przeszłości
    const dateNow = new Date().toISOString().split("T")[0];
    if (formData.date < dateNow) {
      alert("Nie można zaplanować wydarzenia w przeszłości");
      return;
    }

    // Sprawdzenie, czy wybrany pracownik ma już zaplanowane wydarzenie w tym czasie
    const isEmployeeBusy = events.some((event) => {
      const eventStart = new Date(event.start).getTime();  // Początek istniejącego wydarzenia
      const eventEnd = new Date(event.end).getTime();  // Koniec istniejącego wydarzenia
      const newEventStart = new Date(`${formData.date} ${formData.startTime}`).getTime();  // Początek nowego wydarzenia
      const newEventEnd = new Date(`${formData.date} ${formData.endTime}`).getTime();  // Koniec nowego wydarzenia
      // Sprawdzenie, czy wydarzenie jest dla tego samego pracownika
      return (
        event.extendedProps.employee_id === selectedEmployee &&  // Porównanie employee_id
        (
          // Nowe wydarzenie zaczyna się przed końcem istniejącego i kończy po jego rozpoczęciu
          (newEventStart < eventEnd && newEventEnd > eventStart)
          ||
          // Nowe wydarzenie zaczyna się po rozpoczęciu istniejącego i kończy przed jego zakończeniem
          (newEventStart >= eventStart && newEventStart < eventEnd)
          ||
          // Nowe wydarzenie obejmuje całe istniejące wydarzenie
          (newEventEnd > eventStart && newEventEnd <= eventEnd)
          ||
          // Nowe wydarzenie całkowicie obejmuje istniejące wydarzenie
          (newEventStart <= eventStart && newEventEnd >= eventEnd)
        )
      );
    });
    
    if (isEmployeeBusy) {
      alert("Pracownik jest już zajęty w tym czasie");
      return;
    }
    

    const newEvent = {
      customer: selectedCustomer,
      employee: selectedEmployee,
      startTime: `${formData.date}T${formData.startTime.slice(0, 5)}`, 
      endTime: `${formData.date}T${formData.endTime.slice(0, 5)}`,
      services: servicesList.filter((serv) => serv.selectedService).map((serv) => serv.selectedService),
      color: formData.color,
      status: "upcoming",
    };

    try {
      // Zapis do Firestore w kolekcji "appointments"
      const docRef = await addDoc(
        collection(firestoreDatabase, "appointments"),
        newEvent
      );
      console.log("Wydarzenie zapisane do Firestore", docRef.id);

      // Reset formularza
      setFormData({
        title: "",
        date: todayDate,
        startTime: "09:00",
        endTime: "10:00",
        selectedCustomer: "",
        selectedEmployee: "",
        selectedService: "",

      });

      // Resetowanie stanu
      
      setSelectedEmployee("");
      setSelectedCustomer("");
      setSelectedService("");
      setFormVisible(false);
      setNewEvent(false);


      // Aktualizacja lokalnego stanu
      setEvents((prev) => [
        ...prev,
        {
          id: docRef.id,
          title: `${newEvent.customer} - ${newEvent.services.join(", ")} do ${newEvent.employee}` ,
          start: newEvent.startTime,
          end: newEvent.endTime,
          color: newEvent.color,
          calendarId: newEvent.color,
        },
      ]);

    } catch (error) {
      console.error("Błąd podczas dodawania wydarzenia:", error);
    }
    window.location.reload();
  };
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
            servSearchTerm: "",
        } 
        : serv
    ));
    setIsDropdownServOpen(null);
};

  const handleRemoveService = (id) => {
    setServicesList(servicesList.filter((serv) => serv.id !== id));
  };

  const handleAddService = () => {
    setServicesList([...servicesList, { id: Date.now(), servSearchTerm: "", selectedService: "" }]);
  };

  const handleServiceChange = (id, value) => {
    setServicesList(servicesList.map((serv) => 
        serv.id === id 
        ? { 
            ...serv, 
            servSearchTerm: value, 
            selectedService: "", // Resetowanie wybranej usługi
        } 
        : serv
    ));
  }

    return (
        <>
    <div className="p-4 text-xs relative flex flex-col gap-5 w-full overflow-x-auto lg:text-lg md:text-sm sm:text-xs" >
      <button
        onClick={() => setNewEvent(false)}
        className="hover:bg-yellow-500 text-yellow-700 border-yellow-500 font-semibold hover:text-white py-2 px-4 border hover:border-transparent rounded"
      >Anuluj dodawanie wizyty
      </button>
      <div className=" max-h-fit opacity-100">
       <button
                 onClick={() => setFormVisible(!formVisible)}
                 className={`bg-transparent ${formVisible ? "hover:bg-yellow-500 text-yellow-700 border-yellow-500" : "hover:bg-pink-500 text-pink-700 border-pink-500"} font-semibold hover:text-white py-2 px-4 border hover:border-transparent rounded w-1/5`}
               >
                 {formVisible ? "Anuluj dodawanie klienta" : "Dodaj klienta"}
               </button>
               {
                 formVisible && (
                   <AddCustomer 
                   setFormVisible={setFormVisible} 
                   setCustomers={setCustomers} 
                   customers={customers} 
                   />
                 )
               }
      
      <form onSubmit={handleAddEvent} className="flex flex-col">
      <div className="flex flex-col relative">
      <label htmlFor="customerSearch">Wyszukaj klienta</label>
      <input
        type="text"
        value={selectedCustomer || cusSearchTerm} // Pokazuje wybranego pracownika
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
        <ul className="absolute top-24 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto w-full z-10">
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
      
    <div className="flex flex-col p-5 relative" >
    <h2 className="font-bold">Dodaj usługę:</h2>
         {/* Lista usług */}
    {servicesList.map((serv, index) => (
    <div key={serv.id} className="flex items-center space-x-2 mb-2 relative">
        <input
            type="text"
            value={serv.selectedService || serv.servSearchTerm}
            onChange={(e) => handleServiceChange(serv.id, e.target.value)}
            onFocus={() => setIsDropdownServOpen(serv.id)}
            onBlur={() => setTimeout(() => setIsDropdownServOpen(null), 200)}
            placeholder="Wpisz nazwę usługi"
            className="p-2 border border-gray-400 rounded-md w-64"
        />

        {isDropdownServOpen === serv.id && services.length > 0 && (
            <ul className="absolute top-12 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto w-64 z-10">
                {services
                    .filter((s) => s.name.toLowerCase().includes(serv.servSearchTerm.toLowerCase()))
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
            setServicesList([{ id: Date.now(), servSearchTerm: "", selectedService: "" }]);
        }}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200 mt-4 w-1/5"
    >
        Wyczyść usługi
    </button>
    </div>
      <div className="flex flex-col relative">
      <label htmlFor="employeeSearch">Wyszukaj pracownika</label>
      <input
        type="text"
        value={selectedEmployee || empSearchTerm} // Pokazuje wybranego pracownika
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
      <div className="flex flex-row">
      <div className="flex flex-col w-1/3">
            <label htmlFor="" >Data</label>
          <input
            name="date"
            value={formData.date}
            type="date"
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="p-2 border border-gray-400 rounded-md mb-4"
          />
          </div>
          
          <div className="flex flex-col w-1/3">
            <label htmlFor="">Godzina rozpoczęcia</label>
          <input
            name="startTime"
            value={formData.startTime}
            type="time"
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
            className="p-2 border border-gray-400 rounded-md mb-4"
          />
          
          </div>
          
          <div className="flex flex-col w-1/3">
           <label htmlFor="">Godzina zakończenia</label>
          <input
            name="endTime"
            value={formData.endTime}
            type="time"
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="p-2 border border-gray-400 rounded-md mb-4"
          /> 
          </div>
      </div>
      <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200">
            Dodaj 
          </button>
        </form>
      </div>
    </div>
</>
    )
}