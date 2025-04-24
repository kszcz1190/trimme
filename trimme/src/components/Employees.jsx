import { Component,useState } from "react";
import * as Database from "../Database";
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

const Employees = () => {
  // add employee
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [tel, setTel] = useState(0);
  const [pesel, setPesel] = useState(0);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [supervisor, setSupervisor] = useState(false);
  const [color, setColor] = useState("#000000");
  const {employees, empSearchTerm, setEmployees, setEmpSearchTerm} = SearchEmployee();
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState({});
  const [formVisible, setFormVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const addEmployee = async (event) => {
    event.preventDefault();
    const db = await Database.get();

    // Sprawdzenie, czy wszystkie wymagane pola są wypełnione
    if (!name || !surname || !tel || !pesel || !address || !description) {
      setErrorMsg("Wszystkie pola są wymagane.");
      return;
    }
    //sprawdzenie czy imie ma co najmniej 2 znaki i nie więcej niż 20
    if (name.length < 2 || name.length > 20) {
      setErrorMsg("Imię musi mieć od 2 do 20 znaków.");
      return;
    }
    // sprawdzenie czy nazwisko ma co najmniej 2 znaki i nie więcej niż 50
    if (surname.length < 2 || surname.length > 50) {
      setErrorMsg("Nazwisko musi mieć od 2 do 50 znaków.");
      return;
    }
    // sprawdzenie czy imie i nazwisko zawierają tylko litery i znak "-"
    if (!/^[a-zA-ZżźćńółęąśŻŹĆĄŚĘŁÓŃ-]+$/.test(name) || !/^[a-zA-ZżźćńółęąśŻŹĆĄŚĘŁÓŃ-]+$/.test(surname)) {
      setErrorMsg("Imię i nazwisko mogą zawierać tylko litery i znak '-'."); // Dodano komunikat o błędzie
      return;
    }
    // sprawdzenie czy pesel ma 11 cyfr
    if (!/^\d{11}$/.test(pesel)) {
      setErrorMsg("Pesel musi mieć 11 cyfr.");
      return;
    }
    // sprawdzenie czy numer telefonu ma 9 cyfr
    if (!/^\d{9}$/.test(tel)) {
      setErrorMsg("Numer telefonu musi mieć 9 cyfr.");
      return;
    }

    const addData = {
      id: Math.random().toString(20).substring(2, 15), // Generowanie unikalnego ID
      name,
      surname,
      tel: Number(tel),
      pesel: Number(pesel),
      address,
      description,
      supervisor: Boolean(supervisor),
      color: color || "#000000",
    };
    console.log("Dodawanie pracownika:", addData); // Debugowanie
    setFormVisible(false);
    try {
      await db.collections.employees.insert(addData);
      // Resetowanie formularza
      setName("");
      setSurname("");
      setTel(0);
      setPesel(0);
      setAddress("");
      setDescription("");
      setSupervisor(false);
      setColor("#000000");
      setErrorMsg(""); // Resetowanie komunikatu o błędzie

      //aktualizacja lokalnego stanu
      setEmployees((prevEmployees) => [...prevEmployees, addData]);
    } catch (error) {
      console.error("Błąd zapisu do bazy:", error);
    }
  };

  const deleteEmployee = async (employeeId) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (employee && window.confirm(`Czy na pewno chcesz usunąć tego pracownika? ${employee.name}`)) {
      const filteredEmployees = employees.filter((emp) => emp.id !== employeeId);
      setEmployees(filteredEmployees);  // Update local state
  
      try {
        await deleteDoc(doc(firestoreDatabase, "employees", employeeId));
      } catch (error) {
        console.error("Błąd podczas usuwania pracownika:", error);
    }
  };
  };

  const startEditing = (employee) => {
    setEditingEmployeeId(employee.id);
    setEditedEmployee(employee);
  };

  const handleEditChange = (e, field) => {
    const value = field === "tel" || field === "pesel" ? Number(e.target.value) : e.target.value;
    setEditedEmployee({
      ...editedEmployee,
      [field]: value,
    });
  };

  const saveEdit = async () => {
    try {
      await updateDoc(doc(firestoreDatabase, "employees", editedEmployee.id), editedEmployee);

      //aktualizacja lokalnej listy pracowników
      setEmployees((prevEmployees) => 
        prevEmployees.map((emp) => (emp.id === editedEmployee.id ? editedEmployee : emp))
      );
    setEditingEmployeeId(null);
    }catch (error) {
      console.error("Błąd podczas aktualizacji pracownika:", error);
    }
  };


  return (
    <>
   <div className="p-4 text-xs relative flex flex-col gap-5 w-full overflow-x-auto lg:text-lg md:text-sm sm:text-xs">
        <button
          onClick={() => setFormVisible(!formVisible)}
          className={`bg-transparent ${formVisible ? "hover:bg-yellow-500 text-yellow-700 border-yellow-500" : "hover:bg-pink-500 text-pink-700 border-pink-500"} font-semibold hover:text-white py-2 px-4 border hover:border-transparent rounded`}
        >
          {formVisible ? "Anuluj" : "Dodaj pracownika"}
        </button>
      <div className={`transition-all duration-500 overflow-hidden ${formVisible ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}`}>
        <form onSubmit={addEmployee} className="flex flex-col gap-4 w-fit mx-auto bg-white shadow-md rounded-lg p-4">
          <div className="flex flex-row">
          <div className="flex flex-col p-5">
           <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Imię</label>
            <input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            </div>
            <div className="flex flex-col">
                <label className="mb-1 text-gray-700">Nazwisko</label>
            <input
              name="surname"
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            </div>
            <div className="flex flex-col">
                <label className="mb-1 text-gray-700">Numer telefonu</label>
            <input
              name="tel"
              type="number"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            </div>
            <div className="flex flex-col">
                <label className="mb-1 text-gray-700">Pesel</label>
            <input
              name="pesel"
              type="number"
              value={pesel}
              onChange={(e) => setPesel(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            </div> 
              </div>
              <div className="flex flex-col p-5">
                <div className="flex flex-col">
                <label className="mb-1 text-gray-700">Adres</label>
            <input
              name="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            </div>
            <div className="flex flex-col">
                <label className="mb-1 text-gray-700">Opis pracownika</label>
            <input
              name="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            </div>
            <div className="flex">
                <label className="mb-1 text-gray-700 mr-5">Czy supervisor ?</label>
            <input
              name="supervisor"
              type="checkbox"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.checked)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            </div>
            <div className="flex ">
                <label className="mb-1 text-gray-700 mr-5">Kolor</label>
            <input
              type="color"
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            </div>
          </div>
          </div>
        
        <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200">
            Dodaj pracownika
          </button>
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      </form>
    </div>

    <div className="flex flex-col relative w-full ">
      <label htmlFor="employeeSearch">Wyszukaj pracownika</label>
      <input
        type="text"
        value={empSearchTerm} // Pokazuje wybranego pracownika
        onChange={(e) => {
          setEmpSearchTerm(e.target.value);
        }}
        placeholder="Wpisz imię lub nazwisko"
        className="p-2 border border-gray-400 rounded-md mb-4"
      />
    </div>
    <table className="w-full lg:text-lg md:text-sm sm:text-xs text-center text-black">
          <thead className="lg:text-lg md:text-sm sm:text-xs text-gray-500 uppercase border-b border-gray-300">
            <tr>
               <th className="px-2 sm:px-4 py-2">Imię</th>
               <th className="px-2 sm:px-4 py-2">Nazwisko</th>
               <th className="px-2 sm:px-4 py-2">Telefon</th>
               <th className="px-2 sm:px-4 py-2">Pesel</th>
               <th className="px-2 sm:px-4 py-2">Adres</th>
               <th className="px-2 sm:px-4 py-2">Opis</th>
               <th className="px-2 sm:px-4 py-2">Supervisor</th>
               <th className="px-2 sm:px-4 py-2">Kolor</th>
               <th className="px-2 sm:px-4 py-2">Edytuj</th>
               <th className="px-2 sm:px-4 py-2">Usuń</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}
              className="hover:bg-pink-50">
                <td>
                  {editingEmployeeId === employee.id ? (
                    <input
                      type="text"
                      value={editedEmployee?.name || ""}
                      onChange={(e) => handleEditChange(e, "name")}
                      className="text-center w-[90%]"
                    />
                  ) : (
                    employee.name
                  )}
                </td>
                <td>
                  {editingEmployeeId === employee.id ? (
                    <input
                      type="text"
                      value={editedEmployee?.surname || ""}
                      onChange={(e) => handleEditChange(e, "surname")}
                      className="text-center w-[90%]"
                    />
                  ) : (
                    employee.surname
                  )}
                </td>
                <td>
                  {editingEmployeeId === employee.id ? (
                    <input
                      type="number"
                      value={editedEmployee?.tel || ""}
                      onChange={(e) => handleEditChange(e, "tel")}
                      className="text-center w-[90%]"
                    />
                  ) : (
                    employee.tel
                  )}
                </td>
                <td>
                  {editingEmployeeId === employee.id ? (
                    <input
                      type="number"
                      value={editedEmployee?.pesel || ""}
                      onChange={(e) => handleEditChange(e, "pesel")}
                      className="text-center w-[90%]"
                    />
                  ) : (
                    employee.pesel
                  )}
                </td>
                <td>
                  {editingEmployeeId === employee.id ? (
                    <input
                      type="text"
                      value={editedEmployee?.address || ""}
                      onChange={(e) => handleEditChange(e, "address")}
                      className="text-center w-[90%]"
                    />
                  ) : (
                    employee.address
                  )}
                </td>
                <td>
                  {editingEmployeeId === employee.id ? (
                    <input
                      type="text"
                      value={editedEmployee?.description || ""}
                      onChange={(e) => handleEditChange(e, "description")}
                      className="text-center w-[90%]"
                    />
                  ) : (
                    employee.description
                  )}
                </td>
                <td>
                  {editingEmployeeId === employee.id ? (
                    <input
                      type="checkbox"
                      checked={editedEmployee?.supervisor || false}
                      onChange={(e) => handleEditChange(e, "supervisor")}
                      className="text-center w-[90%]"
                    />
                  ) : (
                    employee.supervisor ? "Tak" : "Nie"
                  )}
                </td>
                <td>
                  {editingEmployeeId === employee.id ? (
                    <input
                      type="color"
                      value={editedEmployee?.color || ""}
                      onChange={(e) => handleEditChange(e, "color")}
                      className="text-center w-[90%]"
                    />
                  ) : (
                    employee.color
                  )}
                </td>
                <td>
                  {editingEmployeeId === employee.id ? (
                     <>
                     <button className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-3 border border-green-500 hover:border-transparent rounded" onClick={() => saveEdit(employee.id)}>Zapisz</button>
                     <button className="bg-transparent hover:bg-yellow-500 text-yellow-700 font-semibold hover:text-white py-1 px-3 border border-yellow-500 hover:border-transparent rounded" onClick={()=> setEditingEmployeeId(null)}>Anuluj</button>
                     </>
                   ) : (
                     <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded" onClick={() => startEditing(employee)}>Edytuj</button>
                   )}
                 </td>
                 <td>
                   <button className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded" onClick={() => deleteEmployee(employee.id)}>Usuń</button>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
</>
  );
};

export default Employees;


