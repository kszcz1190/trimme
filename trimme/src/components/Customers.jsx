import { useState } from "react";
import * as Database from "../Database";
import SearchCustomer from "../hooks/SearchCustomer";
import { firestoreDatabase } from "../Database";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import AddCustomer from "./AddCustomer";


const Customers = () => {
  
  const {customers, cusSearchTerm, setCustomers, setCusSearchTerm} = SearchCustomer();
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editedCustomer, setEditedCustomer] = useState({});
  const [formVisible, setFormVisible] = useState(false);
  

 

  const deleteCustomer = async (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer && window.confirm(`Czy na pewno chcesz usunąć tego klienta? ${customer.name} ${customer.surname}`)) {
      const filteredCustomers = customers.filter((c) => c.id !== customerId);
      setCustomers(filteredCustomers);

      try {
        await deleteDoc(doc(firestoreDatabase, "customers", customerId));
      } catch (error) {
        console.error("Błąd podczas usuwania klienta:", error);
      }
    }
  };

  const startEditing = (customer) => {
    setEditingCustomerId(customer.id);
    setEditedCustomer(customer);
  };

  const handleEditChange = (e, field) => {
    const value = field === "phone" ? Number(e.target.value) : e.target.value;
    setEditedCustomer({
      ...editedCustomer,
      [field]: value,
    });
  };

  const saveEdit = async () => {
    try {
      await updateDoc(doc(firestoreDatabase, "customers", editedCustomer.id), editedCustomer);
      
      setCustomers((prevCustomers) =>
        prevCustomers.map((c) => (c.id === editedCustomer.id ? editedCustomer : c))
      );
      setEditingCustomerId(null);
    }catch (error) {
      console.error("Błąd podczas aktualizacji klienta:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-white rounded-lg ">
        
        <button
          onClick={() => setFormVisible(!formVisible)}
          className={`bg-transparent ${formVisible ? "hover:bg-yellow-500 text-yellow-700 border-yellow-500" : "hover:bg-pink-500 text-pink-700 border-pink-500"} font-semibold hover:text-white py-2 px-4 border hover:border-transparent rounded w-full`}
        >
          {formVisible ? "Anuluj" : "Dodaj klienta"}
        </button>
        {
          formVisible && (
            <AddCustomer 
            setFormVisible={setFormVisible} 
            setCustomers={setCustomers} 
            customers={customers} 
            />
          )
        }
        <div className="flex flex-col w-full p-4 bg-white rounded-lg ">
          <label htmlFor="customerSearch">Wyszukaj klienta</label>
          <input
            type="text"
            value={cusSearchTerm} // Pokazuje wybranego pracownika
            onChange={(e) => {
              setCusSearchTerm(e.target.value);
            }} // Opóźnienie na kliknięcie
            placeholder="Wpisz imię lub nazwisko lub numer telefonu"
            className="p-2 border border-gray-400 rounded-md mb-4"
          /> 
      </div>
    
    <table className="w-full lg:text-lg md:text-sm sm:text-xs text-center text-black">
          <thead className="lg:text-lg md:text-sm sm:text-xs text-gray-500 uppercase border-b border-gray-300">
            <tr>
              <th className="px-2 sm:px-4 py-2">Imię</th>
              <th className="px-2 sm:px-4 py-2">Nazwisko</th>
              <th className="px-2 sm:px-4 py-2">Telefon</th>
              <th className="px-2 sm:px-4 py-2">Opis</th>
              <th className="px-2 sm:px-4 py-2">Edytuj</th>
              <th className="px-2 sm:px-4 py-2">Usuń</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-pink-50 ">
                <td>
                  {editingCustomerId === customer.id ? (
                    <input
                      type="text"
                      value={editedCustomer?.name || ""}
                      onChange={(e) => handleEditChange(e, "name")}
                      className="text-center"
                    />
                  ) : (
                    customer.name
                  )}
                </td>
                <td>
                  {editingCustomerId === customer.id ? (
                    <input
                      type="text"
                      value={editedCustomer?.surname || ""}
                      onChange={(e) => handleEditChange(e, "surname")}
                      className="text-center"
                    />
                  ) : (
                    customer.surname
                  )}
                </td>
                <td>
                  {editingCustomerId === customer.id ? (
                    <input
                      type="number"
                      value={editedCustomer?.phone || ""}
                      onChange={(e) => handleEditChange(e, "phone")}
                      className="text-center"
                    />
                  ) : (
                    customer.phone
                  )}
                </td>
                <td>
                  {editingCustomerId === customer.id ? (
                    <input
                      type="text"
                      value={editedCustomer?.mainDescription || ""}
                      onChange={(e) => handleEditChange(e, "mainDescription")}
                      className="text-center"
                    />
                  ) : (
                    customer.mainDescription
                  )}
                </td>
                <td>
                  {editingCustomerId === customer.id ? (
                   <>
                   <button className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-3 border border-green-500 hover:border-transparent rounded" onClick={() => saveEdit(customer.id)}>Zapisz</button>
                   <button className="bg-transparent hover:bg-yellow-500 text-yellow-700 font-semibold hover:text-white py-1 px-3 border border-yellow-500 hover:border-transparent rounded" onClick={()=> setEditingCustomerId(null)}>Anuluj</button>
                   </>
                 ) : (
                   <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded" onClick={() => startEditing(customer)}>Edytuj</button>
                 )}
               </td>
               <td>
                 <button className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded" onClick={() => deleteCustomer(customer.id)}>Usuń</button>
               </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
            
    </>
  );
}
export default Customers;
