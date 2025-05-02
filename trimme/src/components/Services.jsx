import { useState,useEffect } from "react";
import * as Database from "../Database";
import SearchService from "../hooks/SearchService";
import { firestoreDatabase } from "../Database";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

const Services = () => {
  // add services 
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startPrice, setStartPrice] = useState(0);
  const [endPrice, setEndPrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const {services, servSearchTerm, setServices, setServSearchTerm} = SearchService();
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editedService, setEditedService] = useState({});
  const [formVisible, setFormVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const addService = async (event) => {
    event.preventDefault();
    const db = await Database.get();

    //walidacja formularza
    if (!name || !description || !startPrice || !endPrice || !duration) {
      setErrorMsg("Wszystkie pola są wymagane.");
      return;
    }
    if (startPrice > endPrice) {
      setErrorMsg("Cena początkowa nie może być wyższa od ceny końcowej.");
      return;
    }
    if (duration <= 0) {
      setErrorMsg("Czas trwania musi być większy od 0.");
      return;
    }
    if (name.length < 3) {
      setErrorMsg("Nazwa usługi musi mieć co najmniej 3 znaki.");
      return;
    }
    if (description.length < 5) {
      setErrorMsg("Opis usługi musi mieć co najmniej 5 znaków.");
      return;
    }
    if (startPrice < 0 || endPrice < 0) {
      setErrorMsg("Cena nie może być ujemna.");
      return;
    }
    if (duration < 0) {
      setErrorMsg("Czas trwania nie może być ujemny.");
      return;
    }


    const addData = {
      id: Math.random().toString(20).substring(2, 15), // Generowanie unikalnego ID
      name,
      description,
      startPrice: Number(startPrice),
      endPrice: Number(endPrice),
      duration: Number(duration),
    };
    console.log("Dodawanie usługi:", addData); // Debugowanie
    try {
      await db.collections.services.insert(addData);
      // Resetowanie formularza
      setName("");
      setDescription("");
      setStartPrice(0);
      setEndPrice(0);
      setDuration(0);
      setErrorMsg(""); // Resetowanie komunikatu o błędzie

      // Aktualizacja lokalnej listy usług
      setServices(prev => [...prev, addData]);
    } catch (error) {
      console.error("Błąd zapisu do bazy:", error);
    }
  };

  const deleteService = async (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    if (service && window.confirm(`Czy na pewno chcesz usunąć tę usługę? ${service.name}`)) {
      const filteredServices = services.filter((ser) => ser.id !== serviceId);
      setServices(filteredServices);  // Update local state
  
      try {
        await deleteDoc(doc(firestoreDatabase, "services", serviceId));
        console.log("Usunięto usługę z Firestore:", serviceId);
      } catch (error) {
        console.error("Błąd podczas usuwania usługi:", error);
      }
    }
    
  };

  const startEditing = (service) => {
    setEditingServiceId(service.id);
    setEditedService(service);
  };

  const handleEditChange = (e, field) => {
    const value = field === "startPrice" || field === "endPrice" || field === "duration"
      ? Number(e.target.value) 
      : e.target.value;
  
    setEditedService({
      ...editedService,
      [field]: value,
    });
  };
  

  const saveEdit = async () => {
    try {
      await updateDoc(doc(firestoreDatabase, "services", editedService.id), editedService);

      // Aktualizacja lokalnej listy services
      setServices((prevServices) =>
        prevServices.map((s) => (s.id === editedService.id ? editedService : s))
      );

      setEditingServiceId(null);
    } catch (error) {
      console.error("Błąd podczas aktualizacji usługi:", error);
    }
  };

  return (
    <>
      <div className="bg-gray-100 p-8 rounded-lg relative">
      <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold">Usługi</h1>
          <button
            onClick={() => setFormVisible(!formVisible)}
            className={`bg-transparent ${formVisible ? "hover:bg-yellow-500 text-yellow-700 border-yellow-500" : "hover:bg-pink-900 text-pink-900 border-pink-900"} font-semibold hover:text-white py-2 px-4 border hover:border-transparent rounded`}
          >
            {formVisible ? "Anuluj" : "Dodaj"}
          </button>
        </div>    
      <div className="flex flex-col items-center justify-center w-full h-full p-4 rounded-lg bg-white">  
      <div className={`transition-all duration-500 overflow-hidden ${formVisible ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}`}>
        <form onSubmit={addService} className="flex flex-col gap-4 w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-4">
        <div className="flex flex-row">
          <div className="flex flex-col p-5">
           <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Nazwa usługi</label>
            <input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Opis usługi</label>
          <input
            name="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Cena od</label>
            <input
              name="startPrice"
              type="number"
              value={startPrice}
              onChange={(e) => setStartPrice(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Cena do</label>
          <input
            name="endPrice"
            type="number"
            value={endPrice}
            onChange={(e) => setEndPrice(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Czas trwania</label>
          <input
            name="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          </div>
          </div>
        </div>
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200">
            Dodaj usługę
          </button>
          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
        
        </form>
      </div>

      <div className="flex flex-col relative w-full p-4 ">
        <label className="text-gray-700">Wyszukaj usługę</label>
        <input
            type="text"
            value={servSearchTerm}
            onChange={(e) => setServSearchTerm(e.target.value)}
            placeholder="Wpisz nazwę usługi"
            className="p-2 border border-gray-400 rounded-md mb-4"
      />
    </div>
    <div className="overflow-y-auto h-[60vh] rounded-2xl shadow-lg w-full">
      <table className="w-full lg:text-lg md:text-sm sm:text-xs text-center text-black bg-whte">
          <thead className="lg:text-lg md:text-sm sm:text-xs bg-gray-200 text-black border-b border-gray-300 sticky top-0 z-10">
           <tr>
              <th className="px-2 sm:px-4 py-2">Nazwa usługi</th>
              <th className="px-2 sm:px-4 py-2">Opis</th>
              <th className="px-2 sm:px-4 py-2">Przedział cenowy</th>
              <th className="px-2 sm:px-4 py-2">Czas trwania</th>
              <th className="px-2 sm:px-4 py-2">Edytuj</th>
              <th className="px-2 sm:px-4 py-2">Usuń</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}
              className="hover:bg-gray-50 border-b border-gray-300 text-sm">
                <td className="p-4"> 
                  {editingServiceId === service.id ? (
                    <input
                      type="text"
                      value={editedService?.name || ""}
                      onChange={(e) => handleEditChange(e, "name")}
                      className="text-center"
                    />
                  ) : (
                    service.name
                  )}
                </td>
                <td>{editingServiceId=== service.id ? (
                  <input 
                  type="text"
                  value={editedService?.description || ""}
                  onChange={(e) => handleEditChange(e, "description")}
                  className="text-center"
                  />
                ) : (
                  service.description
                )}
                  </td>
                <td>
                  {editingServiceId === service.id ? (
                    <>
                      <input
                        type="number"
                        value={editedService.startPrice}
                        onChange={(e) => handleEditChange(e, "startPrice")}
                        className="text-center"
                      />{" "}
                      -{" "}
                      <input
                        type="number"
                        value={editedService.endPrice}
                        onChange={(e) => handleEditChange(e, "endPrice")}
                        className="text-center"
                      />
                    </>
                  ) : (
                    `${service.startPrice}-${service.endPrice} zł`
                  )}
                </td>

                <td>
                  {editingServiceId === service.id ? (
                    <input
                      type="number"
                      value={editedService.duration}
                      onChange={(e) => handleEditChange(e, "duration")}
                      className="text-center"
                    />
                  ) : (
                    `${service.duration} min`
                  )}
                </td>

                <td>
                  {editingServiceId === service.id ? (
                    <>
                    <button className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-3 border border-green-500 hover:border-transparent rounded" onClick={() => saveEdit(service.id)}>Zapisz</button>
                    <button className="bg-transparent hover:bg-yellow-500 text-yellow-700 font-semibold hover:text-white py-1 px-3 border border-yellow-500 hover:border-transparent rounded" onClick={()=> setEditingServiceId(null)}>Anuluj</button>
                    </>
                  ) : (
                    <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded" onClick={() => startEditing(service)}>Edytuj</button>
                  )}
                </td>
                <td>
                  <button className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded" onClick={() => deleteService(service.id)}>Usuń</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      </div>
    </>
  );
};

export default Services;



