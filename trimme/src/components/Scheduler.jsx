import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";
import VisitManagement from "./VisitManagement";
import NewEvent from "./NewEvent";
import AddCustomer from "./AddCustomer";

import { firestoreDatabase } from "../Database";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from "firebase/firestore";

function Scheduler() {
  const todayDate = new Date().toISOString().split("T")[0];
  const [events, setEvents] = useState([]);
  const [visitPreview, setVisitPreview] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(false);
  const [dateAndTime, setDateAndTime] = useState(null);
  
 
  const formatDateTime = (date) => {
    return date
      ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16) // YYYY-MM-DDTHH:mm
      : null;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const appointmentsCollection = collection(firestoreDatabase, "appointments");
  
        // 🔍 Dodanie filtru statusu do zapytania
        const q = query(appointmentsCollection, where("status", "!=", "odwołana"));
        const querySnapshot = await getDocs(q);
  
        const eventsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: `${doc.data().customer} - ${doc.data().services.map(s=>s.name).join(", ")} do: ${doc.data().employee}`,
          start: doc.data().startTime,
          end: doc.data().endTime,
          color: doc.data().color,
          calendarId: "work",
          status: doc.data().status,
          mainDescription: doc.data().mainDescription,
          extraDescription: doc.data().extraDescription,
          extendedProps: {
            customer_id: doc.data().customer,
            employee_id: doc.data().employee,
            service_id: doc.data().services.filter((service) => service !== ""),
          },
          customerId: doc.data().customerId,
        }));
  
        console.log("Załadowane wydarzenia:", eventsList);
        setEvents(eventsList);
      } catch (error) {
        console.error("Błąd podczas pobierania wydarzeń:", error);
      }
    };
  
    fetchEvents();
  }, []); // Uruchamiamy tylko raz po zamontowaniu komponentu


  // nowe wydarzenie po kliknięciu na kalendarz
  const handleAddNewEvent = (e) => {
    const dateAndTime = e.dateStr;
    setDateAndTime(dateAndTime);
    console.log("Kliknięto datę:", dateAndTime);
    setNewEvent(true);

  };
  

  //obsluga klikniecia na wydarzenie
  const handleEventClick = async (clickInfo) => {
    const { event } = clickInfo;
    const existingEvent = events.find((ev) => ev.id === event.id);
    
    const selected = {
      id: event.id,
      title: event.title,
      date: formatDateTime(event.start).split("T")[0],
      startTime: formatDateTime(event.start).split("T")[1],
      endTime: formatDateTime(event.end).split("T")[1],
      color: existingEvent?.color || "#FFDAB9",
      customer: existingEvent?.extendedProps?.customer_id || "",
      employee: existingEvent?.extendedProps?.employee_id || "",
      services: existingEvent?.extendedProps?.service_id || [],
      status: existingEvent?.status || "",
      mainDescription: existingEvent?.mainDescription || "",
      extraDescription: existingEvent?.extraDescription || "",
      customerId: existingEvent?.customerId || "",

    };
  
    setSelectedEvent(selected);
    setVisitPreview(true);
    console.log("Kliknięto wydarzenie:", selected);
  };

  //obsługa przesuwania wydarzenia i zmiany jego długości
  const handleEventDrop = async (dropInfo) => {
    const { event } = dropInfo;
    console.log("Przesunięto wydarzenie event:", event);
  
    if (!event.id) {
      console.error("Brak ID wydarzenia");
      return;
    }
  
    const existingEvent = events.find((ev) => ev.id === event.id);
  
    const start = formatDateTime(event.start);
    const end = formatDateTime(event.end);
  
    const updatedEvent = {
      title: event.title,
      startTime: existingEvent?.startTime || start,
      endTime: existingEvent?.endTime || end,
      color: existingEvent?.color || "#FFDAB9",
      employee_id: existingEvent?.extendedProps?.employee_id || "",
      customer_id: existingEvent?.extendedProps?.customer_id || "",
      service_id: existingEvent?.extendedProps?.service_id || [],
      status: existingEvent?.status || "",
      mainDescription: existingEvent?.mainDescription || "",
      extraDescription: existingEvent?.extraDescription || "",
    };
  
    console.log("Zaktualizowane dane wydarzenia:", updatedEvent);
  
    setEvents((prevEvents) =>
      prevEvents.map((ev) => (ev.id === event.id ? updatedEvent : ev))
    );
  
    const dataToFirestore = 
    {
      startTime: updatedEvent.startTime,
      endTime: updatedEvent.endTime,
      color: updatedEvent.color,
    }
  
    try {
      await updateDoc(doc(firestoreDatabase, "appointments", event.id), dataToFirestore);
      console.log("Zaktualizowano wydarzenie w Firestore");
    } catch (error) {
      console.error("Błąd podczas aktualizacji wydarzenia:", error);
    }
    // odświeżenie strony po przesunięciu wydarzenia
    window.location.reload();

  };
  
  return (
    <>
    
      {
        visitPreview && (
          <VisitManagement
            selectedEvent={selectedEvent}
            setVisitPreview={setVisitPreview}
            setEvents={setEvents}
            
          />
        )
      } 
      
        {
        newEvent && (
          <NewEvent 
          dateAndTime={dateAndTime}
          setNewEvent={setNewEvent}
          events={events}
          setEvents={setEvents}
          />
      )}
     <h1 className="flex text-3xl text-pink-800 mb-10">Ustalanie wizyt</h1>
     <div className="shadow-md bg-pink-800 p-4 rounded-lg ">
      <div className="bg-white p-8 rounded-lg ">
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
        dateClick={handleAddNewEvent}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventDrop}
        editable={true} 
        events={[...events]}
      />
      </div>
      
     </div>
      
    </>
  );
}

export default Scheduler;
