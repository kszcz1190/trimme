import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";
import SearchEmployee from "../hooks/SearchEmployee";

import { firestoreDatabase } from "../Database";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

const Timetable = () => {
  const { employees, empSearchTerm, setEmpSearchTerm } = SearchEmployee();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  
  const [events, setEvents] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [FormData, setFormData] = useState({
    id: "",
    title: "",
    date: "",
    start: "",
    end: "",
  });

  const formatDateTime = (date) => {
    return date
      ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16) // YYYY-MM-DDTHH:mm
      : null;
  };

  // dodawanie wydarzenia do kalendarza
  const addEvent = async (e) => {
    e.preventDefault();
    const { date, start, end } = FormData;

    // Znalezienie pracownika na podstawie nazwy
    const emp = employees.find(
      (emp) => `${emp.name} ${emp.surname}` === selectedEmployee
    );
    //sprawdzenie czy wszystkie pola są wypełnione
    if (!date || !start || !end || !selectedEmployee) {
      alert("Wypełnij wszystkie pola!");
      return;
    }
    const dateNow = new Date().toISOString().split("T")[0];
    if (date < dateNow) {
      if (!window.confirm("Czy chcesz dodać wydarzenie w przeszłości?")) {
        console.log("Anulowano dodawanie wydarzenia w przeszłości");
        return;
      }
    }
    
    //sprawdzenie czy godzina zakończenia jest większa od godziny rozpoczęcia
    if (start >= end) {
      alert("Godzina zakończenia musi być większa od godziny rozpoczęcia!");
      return;
    }
    //sprawdzenie czy wybrany praciwnik już ma zaplanowane wydarzenie w tym czasie
    const isEmployeeBusy = events.some((event) => {
      if (event.extendedProps.employee_id !== emp.id) return false;
    
      // Pobranie daty z event.start
      const eventDate = event.start.split("T")[0];
      if (eventDate !== date) return false;
    
      // Pobranie godzin z event.start i event.end
      const eventStartTime = event.start.split("T")[1].substring(0, 5);
      const eventEndTime = event.end.split("T")[1].substring(0, 5);
    
      // Sprawdzenie kolizji czasowych
      return (
        (start >= eventStartTime && start < eventEndTime) ||
        (end > eventStartTime && end <= eventEndTime) ||
        (start <= eventStartTime && end >= eventEndTime) // Przypadek, gdy jedno wydarzenie całkowicie obejmuje drugie
      );
    });
    if (isEmployeeBusy) {
      alert("Pracownik jest już zajęty w tym czasie!");
      return;
    }
        // Pobranie koloru z bazy, jeśli istnieje, inaczej ustawienie domyślnego
        const color = emp?.color || "#3788d8";
        const empId = emp?.id || null;

        const formattedData = {
          title: selectedEmployee,
          date,
          start: `${date}T${start}`,
          end: `${date}T${end}`,
          backgroundColor: color,
          textColor: "#ffffff",
          extendedProps: {
            employee_id: empId,
          },
        };

        console.log("Dodano wydarzenie, formatedData:", formattedData);

        const dataToFirestore = {
          employee_id: emp.id,
          employee_name: selectedEmployee,
          start_date: formattedData.start,
          end_date: formattedData.end,
        };
        //zapis do bazy danych
        const docRef = await addDoc(
          collection(firestoreDatabase, "employeesSchedule"),
          dataToFirestore
        );
        formattedData.id = docRef.id; // Ustawiamy poprawne ID
        setEvents([...events, formattedData]); // Teraz zapisujemy event z ID

        console.log("Wydarzenie zapisane w firebase", dataToFirestore);
        setFormVisible(false);

  };
  //obsługa przesunięcia wydarzenia oraz zmiany jego długości
  const handleEventDrop = async (eventDropInfo) => {
    const { event } = eventDropInfo;

    if (!event.id) {
      console.error("Błąd: wydarzenie nie ma poprawnego ID!");
      return;
    }

    const existingEvent = events.find((evt) => evt.id === event.id);

    const updatedEvent = {
      id: event.id,
      title: event.title,
      date: formatDateTime(event.start).split("T")[0],
      start: formatDateTime(event.start),
      end: formatDateTime(event.end),
      backgroundColor: existingEvent?.backgroundColor || "#3788d8",
      textColor: "#ffffff",
      extendedProps: {
        employee_id: existingEvent?.extendedProps?.employee_id || null,
      },
    };

    console.log("updatedEvent:", updatedEvent);

    setEvents((prevEvents) =>
      prevEvents.map((evt) => (evt.id === event.id ? updatedEvent : evt))
    );

    // Aktualizacja w bazie danych
    const dataToFirestore = {
      employee_id: updatedEvent.extendedProps.employee_id,
      employee_name: event.title,
      start_date: updatedEvent.start,
      end_date: updatedEvent.end,
    };

    try {
      await updateDoc(
        doc(firestoreDatabase, "employeesSchedule", event.id),
        dataToFirestore
      );
      console.log("Wydarzenie zaktualizowane w Firestore:", event.id);
    } catch (error) {
      console.error("Błąd podczas aktualizacji wydarzenia:", error);
    }
  };

  // obsługa kliknięcia na wydarzenie
  const handleEventClick = async (clickInfo) => {
    const { event } = clickInfo;

    if (window.confirm(`Czy chcesz usunąć wydarzenie: ${event.title}?`)) {
      const filteredEvents = events.filter((evt) => evt.id !== event.id);
      setEvents(filteredEvents);

      try {
        await deleteDoc(doc(firestoreDatabase, "employeesSchedule", event.id));
        console.log("Usunięto wydarzenie z Firestore:", event.id);
      } catch (error) {
        console.error("Błąd podczas usuwania wydarzenia:", error);
      }
    }
  };


  // nasłuchiwanie zmian w kolekcji w czasie rzeczywistym , za każdym razem kiedy dane się zmienią
  // dodam, usunę, edytuję dokument to "onSnapshot" automatycznie pobierze najnowsze dane i zaktualizuje stan
  useEffect(() => {
    if (employees.length === 0) return; // Jeśli pracownicy nie zostali jeszcze pobrani, nie wykonuj zapytania

    const unsubscribe = onSnapshot(
      collection(firestoreDatabase, "employeesSchedule"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const formattedEvents = data.map((event) => {
          const employee = employees.find(
            (emp) => emp.id === event.employee_id
          );

          return {
            id: event.id,
            title: event.employee_name,
            date: event.start_date.split("T")[0],
            start: event.start_date,
            end: event.end_date,
            backgroundColor: employee?.color || "#9798d8",
            textColor: "#ffffff",
            extendedProps: { employee_id: event.employee_id },
          };
        });

        setEvents(formattedEvents);
      }
    );

    return () => unsubscribe();
  }, [employees.length]); // Teraz nasłuchujemy tylko na długość tablicy pracowników
 
  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(`${emp.name} ${emp.surname}`);
    setIsDropdownOpen(false);
  };
  return (
    <>
    <div className="p-4 text-xs relative flex flex-col gap-5 w-full overflow-x-auto lg:text-lg md:text-sm sm:text-xs">
    <button
          onClick={() => setFormVisible(!formVisible)}
          className={`bg-transparent ${formVisible ? "hover:bg-yellow-500 text-yellow-700 border-yellow-500" : "hover:bg-pink-500 text-pink-700 border-pink-500"} font-semibold hover:text-white py-2 px-4 border hover:border-transparent rounded`}
        >
          {formVisible ? "Anuluj" : "Dodaj wydarzenie"}
        </button>
        <div className={`transition-all duration-500 overflow-hidden ${formVisible ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}`}>
        <form onSubmit={addEvent} className="flex flex-col">
        <div style={{ padding: "20px" }} className="flex flex-col relative">
        <label htmlFor="employeeSearch">Wyszukaj pracownika</label>
        <input
          type="text"
          value={selectedEmployee || empSearchTerm} // Pokazuje wybranego pracownika
          onChange={(e) => {
            setEmpSearchTerm(e.target.value);
            setSelectedEmployee(""); // Reset wyboru przy nowym wyszukiwaniu
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // Opóźnienie na kliknięcie
          placeholder="Wpisz imię lub nazwisko"
          className="p-2 border border-gray-400 rounded-md mb-4"
        />

        {/* Lista rozwijana */}
        {isDropdownOpen && employees.length > 0 && (
          <ul className="absolute top-24 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto w-full z-10">
            {employees.map((emp) => (
              <li
                key={emp.id}
                onClick={() => {
                  handleEmployeeSelect(emp);
                  setSelectedEmployee(`${emp.name} ${emp.surname}`); // Ustawienie wybranego pracownika w inpucie
                  setIsDropdownOpen(false); // Zamknięcie dropdownu po wyborze
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
            value={FormData.date}
            type="date"
            onChange={(e) => setFormData({ ...FormData, date: e.target.value })}
            className="p-2 border border-gray-400 rounded-md mb-4"
          />
          </div>
          
          <div className="flex flex-col w-1/3">
            <label htmlFor="">Godzina rozpoczęcia</label>
          <input
            name="start"
            value={FormData.start}
            type="time"
            onChange={(e) =>
              setFormData({ ...FormData, start: e.target.value })
            }
            className="p-2 border border-gray-400 rounded-md mb-4"
          />
          
          </div>
          
          <div className="flex flex-col w-1/3">
           <label htmlFor="">Godzina zakończenia</label>
          <input
            name="end"
            value={FormData.end}
            type="time"
            onChange={(e) => setFormData({ ...FormData, end: e.target.value })}
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
      <FullCalendar
        locale={"pl"}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        titleFormat={(date) => {
          const month = date.date.marker.toLocaleString("pl-PL", {
            month: "long",
          });
          const year = date.date.marker.getFullYear();
          return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay,dayGridMonth",
        }}
        allDaySlot={false}
        firstDay={1}
        slotDuration={"00:15"}
        slotMinTime={"08:00"}
        slotMaxTime={"18:00"}
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          omitZeroMinute: false,
          meridiem: false, // Wyłączenie AM/PM
        }}
        height={"auto"}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventDrop}
        editable={true} // pozwala na przesuwanie eventów
        events={[...events]}
      />
    </>
  );
};

export default Timetable;
