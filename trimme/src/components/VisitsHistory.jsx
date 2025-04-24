import { useState, useEffect } from "react";
import { firestoreDatabase } from "../Database";
import { collection, getDocs,deleteDoc,doc } from "firebase/firestore";
import SearchCustomer from "../hooks/SearchCustomer";
import SearchEmployee from "../hooks/SearchEmployee";
import SearchService from "../hooks/SearchService";

const VisitsHistory = () => {
  const [visits, setVisits] = useState([]);
  const [editingVisitId, setEditingVisitId] = useState(null);

  const { customers, cusSearchTerm, setCustomers, setCusSearchTerm } = SearchCustomer();
  const { employees, empSearchTerm, setEmployees, setEmpSearchTerm } = SearchEmployee();
  const { services, servSearchTerm, setServices, setServSearchTerm } = SearchService();
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterValues, setFilterValues] = useState({
    customer: "",
    employee: "",
    service: "",
    date: "",
  });

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const visitsCollection = collection(firestoreDatabase, "appointments");
        const querySnapshot = await getDocs(visitsCollection);
        const visitsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVisits(visitsList);
      } catch (error) {
        console.error("Error fetching visits:", error);
      }
    };

    fetchVisits();
  }, []);

  // Filtrowanie wizyt lokalnie
  const filteredVisits = visits.filter((visit) => {
    if (filterValues.customer && !visit.customer.toLowerCase().includes(filterValues.customer.toLowerCase())) return false;
    if (filterValues.employee && !visit.employee.toLowerCase().includes(filterValues.employee.toLowerCase())) return false;
    if (filterValues.service) {
      const serviceList = Array.isArray(visit.services) ? visit.services.join(", ") : visit.services;
      if (!serviceList.toLowerCase().includes(filterValues.service.toLowerCase())) return false;
    }
    if (filterValues.date && !visit.startTime.startsWith(filterValues.date)) return false;
    return true;
  });

  const deleteVisit = async (visitId) => {
    const visit = visits.find((v) => v.id === visitId);
    if (visit && window.confirm(`Czy na pewno chcesz usunąć tę wizytę? ${visit.customer} ${visit.startTime}`)) {
      const filteredVisits = visits.filter((v) => v.id !== visitId);
      setVisits(filteredVisits);
      console.log("Usunięto wizytę:", visitId);

      try {
        await deleteDoc(doc(firestoreDatabase, "appointments", visitId));
      } catch (error) {
        console.error("Błąd podczas usuwania wizyty:", error);
      }
    }
  }

    const startEditingVisit = (visitId) => {
    setEditingVisitId(visitId);
    const visitToEdit = visits.find((v) => v.id === visitId);
    if (visitToEdit) {
      setFilterValues({
        customer: visitToEdit.customer,
        employee: visitToEdit.employee,
        service: Array.isArray(visitToEdit.services) ? visitToEdit.services.join(", ") : visitToEdit.services,
        date: visitToEdit.startTime.split("T")[0],
      });
    }  
    }

  return (
    <div className="visits-history flex flex-col items-center">
      <div className="flex gap-2 my-4">
        <button className="bg-pink-800 text-white py-2 px-4 rounded hover:bg-pink-600"
        onClick={() => setActiveFilter("customer")}>Filtruj po kliencie</button>
        <button className="bg-pink-800 text-white py-2 px-4 rounded hover:bg-pink-600" onClick={() => setActiveFilter("employee")}>Filtruj po pracowniku</button>
        <button className="bg-pink-800 text-white py-2 px-4 rounded hover:bg-pink-600" onClick={() => setActiveFilter("service")}>Filtruj po usłudze</button>
        <button className="bg-pink-800 text-white py-2 px-4 rounded hover:bg-pink-600" onClick={() => setActiveFilter("date")}>Filtruj po dacie</button>
        <button className="bg-red-600 text-white py-2 px-4 rounded hover:bg-white hover:text-red-600 border border-red-600"
          onClick={() => {
            setActiveFilter(null);
            setFilterValues({ customer: "", employee: "", service: "", date: "" });
            setCusSearchTerm("");
            setEmpSearchTerm("");
            setServSearchTerm("");
          }}
        >
          Resetuj filtr
        </button>
      </div>

      {activeFilter === "customer" && (
          <input className="w-1/2 p-2 border border-black rounded"
            type="text"
            placeholder="Wpisz klienta..."
            value={cusSearchTerm}
            onChange={(e) => {
              setCusSearchTerm(e.target.value);
              setFilterValues((prev) => ({ ...prev, customer: e.target.value }));
            }}
          />
      )}

      {activeFilter === "employee" && (
          <input className="w-1/2 p-2 border border-black rounded"
            type="text"
            placeholder="Wpisz pracownika..."
            value={empSearchTerm}
            onChange={(e) => {
              setEmpSearchTerm(e.target.value);
              setFilterValues((prev) => ({ ...prev, employee: e.target.value }));
            }}
          />
      )}

      {activeFilter === "service" && (
          <input className="w-1/2 p-2 border border-black rounded"
            type="text"
            placeholder="Wpisz usługę..."
            value={servSearchTerm}
            onChange={(e) => {
              setServSearchTerm(e.target.value);
              setFilterValues((prev) => ({ ...prev, service: e.target.value }));
            }}
          />
      )}

      {activeFilter === "date" && (
        <input className="w-1/2 p-2 border border-black rounded"
          type="date"
          value={filterValues.date}
          onChange={(e) => setFilterValues((prev) => ({ ...prev, date: e.target.value }))}
        />
      )}

      <table className="w-full lg:text-lg md:text-sm sm:text-xs text-center text-black mt-6">
        <thead className="text-gray-500 uppercase border-b border-gray-300">
          <tr>
            <th>Data</th>
            <th>Godzina</th>
            <th>Klient</th>
            <th>Pracownik</th>
            <th>Usługa</th>
            <th>Status</th>
            <th>Edytuj</th>
            <th>Usuń</th>
          </tr>
        </thead>
        <tbody>
          {filteredVisits.map((visit) => (
            <tr key={visit.id} className="hover:bg-pink-50">
              <td>{visit.startTime.split("T")[0]}</td>
              <td>
                {visit.startTime.split("T")[1].slice(0, 5)} -{" "}
                {visit.endTime.split("T")[1].slice(0, 5)}
              </td>
              <td>{visit.customer}</td>
              <td>{visit.employee}</td>
              <td>{Array.isArray(visit.services) ? visit.services.join(", ") : visit.services}</td>
              <td>{visit.status}</td>
              <td>
                {editingVisitId === visit.id ? (
                    <>
                    <button className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-3 border border-green-500 hover:border-transparent rounded" onClick={() => saveEdit(visit.id)}>Zapisz</button>
                    <button className="bg-transparent hover:bg-yellow-500 text-yellow-700 font-semibold hover:text-white py-1 px-3 border border-yellow-500 hover:border-transparent rounded" onClick={()=> setEditingVisitId(null)}>Anuluj</button>
                    </>
                ) : (
                <button
                  onClick={() => startEditingVisit(visit.id)}
                  className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
                >
                  Edytuj
                </button>
                )}
              </td>
              <td>
                <button 
                onClick={() => deleteVisit(visit.id)}
                className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded">
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitsHistory;
