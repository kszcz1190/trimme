import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestoreDatabase } from "../Database";

const SearchService = () => {
  const [services, setServices] = useState([]);
  const [servSearchTerm, setServSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return; // Jeśli dane już są, nie pobieramy ponownie
    const fetchServices = async () => {
      try {
        const servicesCollectionRef = collection(firestoreDatabase, "services");
        const querySnapshot = await getDocs(servicesCollectionRef); // Pobranie dokumentów z kolekcji

        const servicesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setServices(servicesList);
        console.log("Loaded services:", servicesList);
      } catch (error) {
        console.error("Error while fetching services:", error);
      }
    };

    fetchServices();
  }, [loading]);

  const filteredServices = services.filter((service) => {
    const search = servSearchTerm.toLowerCase();
    return (
      service.name?.toLowerCase().includes(search) ||
      service.description?.toLowerCase().includes(search)
    );
  });
  return { services: filteredServices, servSearchTerm, setServSearchTerm, setServices };
};

export default SearchService;

