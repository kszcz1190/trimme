import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestoreDatabase } from "../Database";

const SearchCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [cusSearchTerm, setCusSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return; // Jeśli dane już są, nie pobieramy ponownie
    const fetchCustomers = async () => {
      try {
        const customersCollectionRef = collection(
          firestoreDatabase,
          "customers"
        ); // Poprawne odniesienie do kolekcji
        const querySnapshot = await getDocs(customersCollectionRef); // Pobranie dokumentów z kolekcji

        const customersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCustomers(customersList);
      } catch (error) {
        console.error("Error while fetching customers:", error);
      }
    };

    fetchCustomers();
  }, [loading]);

  const filteredCustomers = customers.filter((customers) => {
    const search = cusSearchTerm.toLowerCase();
    return (
      customers.name?.toLowerCase().includes(search) ||
      customers.surname?.toLowerCase().includes(search) ||
      String(customers.phone || "").includes(search)
    );
  });

  return { customers: filteredCustomers, cusSearchTerm, setCusSearchTerm, setCustomers };
};

export default SearchCustomer;
