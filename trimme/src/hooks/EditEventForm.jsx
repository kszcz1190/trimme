import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestoreDatabase } from "../Database";
import SearchCustomer from "./SearchCustomer";
import SearchEmployee from "./SearchEmployee";
import SearchService from "./SearchService";

export default function EditEventForm({ event, onUpdate, onClose }) {
  const { employees, empSearchTerm, setEmpSearchTerm } = SearchEmployee();
  const { customers, cusSearchTerm, setCusSearchTerm } = SearchCustomer();
  const { services, servSearchTerm, setServSearchTerm } = SearchService();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [isDropdownCusOpen, setIsDropdownCusOpen] = useState(false);
  const [isDropdownEmpOpen, setIsDropdownEmpOpen] = useState(false);
  const [isDropdownServOpen, setIsDropdownServOpen] = useState(false);
  const todayDate = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    title: "",
    date: todayDate,
    startTime: "09:00",
    endTime: "10:00",
    color: "#FFDAB9"
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    if (event) {
      setValue("customer", event.customer || "");
      setValue("service", event.service || "");
      setValue("employee", event.employee || "");
      setValue("date", event.date || todayDate);
      setValue("startTime", event.startTime || "09:00");
      setValue("endTime", event.endTime || "10:00");
      setSelectedCustomer(event.customer || "");
      setSelectedService(event.service || "");
      setSelectedEmployee(event.employee || "");
      setFormData({
        date: event.date || todayDate,
        startTime: event.startTime || "09:00",
        endTime: event.endTime || "10:00",
      });
    }
  }, [event, setValue]);

  const onSubmit = async (data) => {
    const eventRef = doc(firestoreDatabase, "appointments", event.id);
    await updateDoc(eventRef, data);
    onUpdate({ ...event, ...data });
    onClose();
  };

  const handleDelete = async () => {
    const eventRef = doc(firestoreDatabase, "appointments", event.id);
    await deleteDoc(eventRef);
    onUpdate(null);
    onClose();
  };

  const handleEmployeeSelect = (emp) => {
    setValue("employee", emp.id);
    setSelectedEmployee(`${emp.name} ${emp.surname}`);
  };

  const handleCustomerSelect = (cus) => {
    setValue("customer", cus.id);
    setSelectedCustomer(`${cus.name} ${cus.surname}`);
  };

  const handleServiceSelect = (serv) => {
    setValue("service", serv.id);
    setSelectedService(`${serv.name}`);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-10">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">Edytuj/Usuń</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col relative">
            <label htmlFor="customerSearch">Wyszukaj klienta</label>
            <input
              type="text"
              value={selectedCustomer || cusSearchTerm}
              onChange={(e) => {
                setCusSearchTerm(e.target.value);
                setSelectedCustomer("");
              }}
              onFocus={() => setIsDropdownCusOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownCusOpen(false), 200)}
              placeholder="Wpisz imię lub nazwisko lub numer telefonu"
              className="p-2 border border-gray-400 rounded-md mb-4"
            />
            {isDropdownCusOpen && customers.length > 0 && (
              <ul className="absolute top-24 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto w-full z-10">
                {customers.map((cus) => (
                  <li
                    key={cus.id}
                    onClick={() => handleCustomerSelect(cus)}
                    className="p-2 hover:bg-pink-100 cursor-pointer"
                  >
                    {cus.name} {cus.surname} {cus.phone}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col w-1/3">
              <label htmlFor="">Data</label>
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
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
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
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Anuluj
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Zapisz
            </button>
            <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">
              Usuń
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
