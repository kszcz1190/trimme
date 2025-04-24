import {useState,useEffect } from "react";
import VisitFinalization from "./VisitFinalization";
import VisitEdition from "./VisitEdition";
import { deleteDoc, doc ,updateDoc} from "firebase/firestore";
import { firestoreDatabase } from "../Database";

  export default function VisitManagement({selectedEvent, setEvents, setVisitPreview}) {
    if(!selectedEvent) return null;


    const [cancelEvent, setCancelEvent] = useState(false);
    const [finalizeEvent, setFinalizeEvent] = useState(false);
    const [editEvent, setEditEvent] = useState(false);
    const [editedEvent, setEditedEvent] = useState([]);

    


    
  //obsługa odwołania wydarzenia bez usuwania go z bazy tylko zmiana statusu na odwołane oraz dodanie opisu przyczyny odwołania i przeniesienie wydarzenia do archiwum
  const handleCancelEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent.id) {
      console.error("Brak wybranego wydarzenia do odwołania");
      return;
    }
  
    if (window.confirm(`Czy na pewno chcesz odwołać wizytę ${selectedEvent.title}?`)) {
      try {
        await updateDoc(doc(firestoreDatabase, "appointments", selectedEvent.id), {
          status: "cancelled",
          extra_description: editedEvent.extra_description || "", // Używamy wartości z editedEvent
        });
  
        // Aktualizacja stanu lokalnego, żeby odświeżyć widok
        setEvents((prevEvents) =>
          prevEvents.map((ev) =>
            ev.id === selectedEvent.id ? { ...ev, status: "cancelled" } : ev
          )
        );
  
        // Zamykamy modale i resetujemy pola
        setVisitPreview(false);
        setCancelEvent(false);
        setEditedEvent({});
      } catch (error) {
        console.error("Błąd podczas odwoływania wizyty:", error);
      }
    }
  };

  
  
  //  przyczyna odwołania
  const handleCancelChange = (value) => {
    setEditedEvent({ ...editedEvent, extra_description: value });
  };
  
  // usuwanie wizyty
  const handleDeleteEvent = async () => {
  if (!selectedEvent.id) {
      console.error("Brak wybranego wydarzenia do usunięcia");
      return;
  }
  if(window.confirm(`Czy na pewno chcesz usunąć wizytę ${selectedEvent.title}?`)) {
      await deleteDoc(doc(firestoreDatabase, "appointments", selectedEvent.id));
      setEvents((prevEvents) => prevEvents.filter((ev) => ev.id !== selectedEvent.id));
      setVisitPreview(false);
  }
};


    return (

      <div className="absolute top-50 left-120 w-fit h-fit bg-pink-200 flex flex-col justify-center items-center z-10">
        <div className="flex flex-row">
        <div className="bg-pink-400 p-4 rounded-md flex flex-col gap-2 items-center">
          
              <h2>Wizyta</h2>
              <p>Pracownik: {selectedEvent.employee}</p>
              <p>Klient: {selectedEvent.customer}</p>
              <p>Usługa: {Array.isArray(selectedEvent.services) ? selectedEvent.services.join(' + ') : selectedEvent.services}
              </p>
              <p>Data: {selectedEvent.date.split("T")[0]}</p>
              <p>Godzina rozpoczęcia: {selectedEvent.startTime}</p>
              <p>Godzina zakończenia: {selectedEvent.endTime}</p>
            
          
          
          {/*odwoływanie wizyty */}
          {cancelEvent && (
            <div className="flex flex-col">
                <form onSubmit={handleCancelEvent}>
                {/* Pole przyczyny */}
                <div className="flex flex-row mb-3">
                    <label htmlFor="cancelReason" className="mr-4 font-bold">
                    Przyczyna odwołania wizyty
                    </label>
                    <input
                    type="text"
                    id="cancelReason"
                    value={editedEvent.extra_description || ""}
                    onChange={(e) => handleCancelChange(e.target.value)}
                    className="p-2 border border-gray-400 rounded-md w-64"
                    />
                </div>

                {/* Przyciski */}
                <div className="flex justify-between">
                    <button
                    type="button"
                    onClick={() => setCancelEvent(false)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200 w-[45%]"
                    >
                    Anuluj
                    </button>
                    <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200 w-[45%]"
                    >
                    Zapisz
                    </button>
                </div>
                </form>
            </div>
            )}
            
        </div>
        {/*finalizacja wizyty */}
         {
            finalizeEvent && (
                <VisitFinalization
                selectedEvent={selectedEvent}
                setEvents={setEvents}
                setFinalizeEvent={setFinalizeEvent}
                />
            )

          }

        {/* edytowanie wizyty */}
        {
            editEvent && (
                <VisitEdition
                selectedEvent={selectedEvent}
                setEvents={setEvents}
                setVisitPreview={setVisitPreview}
                setEditedEvent={setEditedEvent}
                setEditEvent={setEditEvent}
                />
            )

          }
        </div>
         
       <div className="flex flex-row p-5 gap-5">
          <button 
              onClick={() => setEditEvent(true)} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200">
              Edycja
            </button>
            <button 
              onClick={() => setFinalizeEvent(true)} 
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200">
              Finalizuj
            </button>
            <button 
              onClick={() => setCancelEvent(true)} 
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200">
              Odwołaj
            </button>
            <button 
              onClick={handleDeleteEvent} 
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200">
              Usuń
            </button>
            <button 
              onClick={() => setVisitPreview(false)} 
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200">
              Zamknij
            </button>
            
          </div>
      </div>
      
    )
  }