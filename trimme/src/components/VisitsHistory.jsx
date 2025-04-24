import { useState, useEffect } from "react";
import { firestoreDatabase } from "../Database";
import { collection, getDocs,deleteDoc,doc } from "firebase/firestore";
import SearchCustomer from "../hooks/SearchCustomer";
import SearchEmployee from "../hooks/SearchEmployee";
import SearchService from "../hooks/SearchService";
import { Link } from "react-router-dom";

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
    dateStart: "",
    dateEnd: "",
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
        console.log("Loaded visits:", visitsList);
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
      const serviceList = Array.isArray(visit.services) ? visit.services.map(s=>s.name).join(", ") : visit.services.name;
      if (!serviceList.toLowerCase().includes(filterValues.service.toLowerCase())) return false;
    }
    const visitDate = new Date(visit.startTime).toISOString().split("T")[0];
   // Filtrowanie po dacie w zakresie
    if (filterValues.dateStart && visitDate < filterValues.dateStart) return false;
    if (filterValues.dateEnd && visitDate > filterValues.dateEnd) return false;
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
        service: Array.isArray(visitToEdit.services) ? visitToEdit.services.map(s=>s.name).join(", ") : visitToEdit.services.name,
        date: visitToEdit.startTime.split("T")[0],
      });
    }  
    }

  const handleEditChange = (e, field) => {
    const value = field === "phone" ? Number(e.target.value) : e.target.value;
    setFilterValues({
      ...filterValues,
      [field]: value,
    });
  }

  return (
    <div className="visits-history flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
        <div className="flex flex-col items-center">
          <label>Data</label>
          <div className="flex flex-row items-center gap-2">
            <label htmlFor="">od</label>
            <input
              className="text-center border border-gray-300 rounded p-2"
              type="date"
              value={filterValues.dateStart}
              onChange={(e) => {
                setFilterValues((prev) => ({ ...prev, dateStart: e.target.value }));
              }}
            />
            <label htmlFor="">do</label>
            <input
              className="text-center border border-gray-300 rounded p-2"
              type="date"
              value={filterValues.dateEnd}
              onChange={(e) => {
                setFilterValues((prev) => ({ ...prev, dateEnd: e.target.value }));
              }}
            />
          </div>
        </div>
      <div className="flex flex-col items-center">
        <label>Klient</label>
        <input
          className="text-center border border-gray-300 rounded p-2"
          type="text"
          value={cusSearchTerm}
          onChange={(e) => {
            setCusSearchTerm(e.target.value);
            setFilterValues((prev) => ({ ...prev, customer: e.target.value }));
          }}
        />
      </div>

      <div className="flex flex-col items-center">
        <label>Pracownik</label>
        <input
          className="text-center border border-gray-300 rounded p-2"
          type="text"
          value={empSearchTerm}
          onChange={(e) => {
            setEmpSearchTerm(e.target.value);
            setFilterValues((prev) => ({ ...prev, employee: e.target.value }));
          }}
        />
      </div>

      <div className="flex flex-col items-center">
        <label>Usługa</label>
        <input
          className="text-center border border-gray-300 rounded p-2"
          type="text"
          value={servSearchTerm}
          onChange={(e) => {
            setServSearchTerm(e.target.value);
            setFilterValues((prev) => ({ ...prev, service: e.target.value }));
          }}
        />
      </div>
    </div>
      <table className="w-full lg:text-lg md:text-sm sm:text-xs text-center text-black mt-6">
        <thead className="text-gray-500 uppercase border-b border-gray-300">
          <tr>
            <th>Data</th>
            <th>Godzina</th>
            <th>Klient</th>
            <th>Pracownik</th>
            <th>Usługa</th>
            <th>Status</th>
            <th>Usuń</th>
            <th>Szczegóły</th>
          </tr>
        </thead>
        <tbody>
          {filteredVisits.map((visit) => (
            <tr key={visit.id} className="hover:bg-pink-50">
              <td>
                {editingVisitId === visit.id ? (
                  <input
                type="date"
                value={filterValues?.date || ""}
                onChange={(e)=> handleEditChange(e, "date")}
                className="text-center"
                />
                ) : (
                  visit.startTime.split("T")[0]
                )}
                </td>
              <td>
                {editingVisitId === visit.id ? (
                  <>
                  <input
                type="time"
                value={visit.startTime.split("T")[1].slice(0, 5)}
                onChange={(e)=> handleEditChange(e, "startTime")}
                className="text-center"
                />
                <input type="time"
                value={visit.endTime.split("T")[1].slice(0, 5)}
                onChange={(e)=> handleEditChange(e, "endTime")}
                className="text-center"
                 />
                </>
                ) : (
                  `${visit.startTime.split("T")[1].slice(0, 5)} - ${visit.endTime.split("T")[1].slice(0, 5)}`
                )}
              </td>
              <td>
                {editingVisitId === visit.id ? (
                  <input
                    type="text"
                    value={filterValues?.customer || ""}
                    onChange={(e) => handleEditChange(e, "customer")}
                    className="text-center"
                  />
                ) : (
                  visit.customer
                )}
              </td>
              <td>{visit.employee}</td>
              <td>
                {editingVisitId === visit.id ? (
                  <input
                    type="text"
                    value={filterValues?.service || ""}
                    onChange={(e) => handleEditChange(e, "service")}
                  />
                ) : (
                  Array.isArray(visit.services)
                  ? visit.services.map(s => s.name).join(", ")
                  : visit.services
                )}
              </td>
              
              <td>{visit.status}</td>
              <td>
                <button 
                onClick={() => deleteVisit(visit.id)}
                className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded">
                  Usuń
                </button>
              </td>
              <td>
                <Link
                  to={`/history/${visit.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Szczegóły
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitsHistory;
