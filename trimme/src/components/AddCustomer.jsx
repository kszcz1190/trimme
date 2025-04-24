import { useState } from "react";
import * as Database from "../Database";
import { collection,addDoc,getDoc } from "firebase/firestore";
export default function AddCustomer({ setNewEvent, setEvents, events,formVisible, setFormVisible, customers, setCustomers }) {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phone, setPhone] = useState(0);
    const [mainDescription, setMainDescription] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);

    const addCustomer = async (event) => {
        event.preventDefault();
    
        const phoneNumber = Number(phone);
    
        //sprawdzenie, czy pola są puste
        if (!name || !surname || !phone) {
          setErrorMsg("Wszystkie pola są wymagane.");
          return;
        }
        //sprawdzenie czy imię i nazwisko mają więcej niż 2 znaki i mniej niż 20
        if (name.length < 2 || name.length > 20) {
          setErrorMsg("Imię musi mieć od 2 do 20 znaków.");
          return;
        }
        if (surname.length < 2 || surname.length > 50) {
          setErrorMsg("Nazwisko musi mieć od 2 do 50 znaków.");
          return;
        }
        //sprawdzenie czy imie i nazwisko zawierają liczby lub znaki specjalne oprócz "-"
        if (/[^a-zA-ZżźćńółęąśŻŹĆĄŚĘŁÓŃ]/.test(name)) {
          setErrorMsg("Imię może zawierać tylko litery.");
          return;
        }
        if (/[^a-zA-ZżźćńółęąśŻŹĆĄŚĘŁÓŃ-]/.test(surname)) {
          setErrorMsg("Nazwisko może zawierać tylko litery i znak '-'.");
          return;
        }
        // Sprawdzenie, czy numer telefonu już istnieje
        const phoneExists = customers.some((customer) => customer.phone === phoneNumber);
        // Sprawdzenie, czy numer telefonu jest poprawny
        if (phoneNumber.toString().length != 9 ) {
          setErrorMsg("Numer telefonu musi mieć 9 cyfr.");
          return;
        }
        //sprawdzenie czy imie i nazwisko oraz numer telefonu są unikalne
        if (customers.some((customer) => customer.name === name && customer.surname === surname && customer.phone === phoneNumber)) {
          setErrorMsg("Klient o tym imieniu, nazwisku i numerze telefonu już istnieje.");
          return;
        }
        if (phoneExists) {
          setErrorMsg("Klient o tym numerze telefonu już istnieje.");
          return;
        }
        const db = await Database.get();
    
        // Tworzenie nowego klienta
        const addData = {
          id: Math.random().toString(20).substring(2, 15), // Generowanie unikalnego ID
          name,
          surname,
          phone: phoneNumber,
          mainDescription,
        };
    
        try {
          // Dodanie klienta do bazy danych
          await db.collections.customers.insert(addData);
    
          // Resetowanie formularza
          setName("");
          setSurname("");
          setPhone(0);
          setMainDescription("");
          setFormVisible(false);
          setErrorMsg(null); // Resetowanie komunikatu o błędzie
    
          // Aktualizacja lokalnego stanu
          setCustomers((prev) => [...prev, addData]);
        } catch (error) {
          console.error("Błąd zapisu do bazy:", error);
        }
      };


      return (
        <>
        <div className="p-4 text-xs relative flex flex-col gap-5 w-full overflow-x-auto lg:text-lg md:text-sm sm:text-xs">
        
        <form onSubmit={addCustomer} className="flex flex-col gap-4 w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-4">
              <div className="flex flex-col">
              <label className="mb-1 text-gray-700">Imię</label>
              <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-700">Nazwisko</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-700">Numer telefonu</label>
            <input
              type="number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-700">Opis</label>
            <input
              type="text"
              value={mainDescription}
              onChange={(e) => setMainDescription(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
              </div>

              <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200">
                Dodaj klienta
              </button>
           {errorMsg && (
            <div className="mt-2 text-red-500 text-sm">
              {errorMsg}
            </div>
          )}   
          </form>
          
        </div>
        </>
        );
        }