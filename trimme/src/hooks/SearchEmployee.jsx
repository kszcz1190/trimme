import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestoreDatabase } from "../Database";

const SearchEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [empSearchTerm, setEmpSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return; // Jeśli dane już są, nie pobieramy ponownie
    const fetchEmployees = async () => {
      try {
        const employeesCollectionRef = collection(
          firestoreDatabase,
          "employees"
        ); // Poprawne odniesienie do kolekcji
        const querySnapshot = await getDocs(employeesCollectionRef); // Pobranie dokumentów z kolekcji

        const employeesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEmployees(employeesList);
      } catch (error) {
        console.error("Error while fetching employees:", error);
      }
    };

    fetchEmployees();
  }, [loading]);

  const filteredEmployees = employees.filter((employee) => {
    const search = empSearchTerm.toLowerCase();
    return (
      employee.name?.toLowerCase().includes(search) ||
      employee.surname?.toLowerCase().includes(search)
    );
  });

  return { employees: filteredEmployees, empSearchTerm, setEmpSearchTerm,setEmployees };
};

export default SearchEmployee;
