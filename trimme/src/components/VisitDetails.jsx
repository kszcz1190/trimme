import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc,updateDoc } from "firebase/firestore";
import { firestoreDatabase } from "../Database";

const VisitDetails = () => {
    const { id } = useParams(); 
    const [visit, setVisit] = useState(null);
    const [visitFinalization, setVisitFinalization] = useState(false);
    const [editingVisitId, setEditingVisitId] = useState(null);
    const [editingDetails, setEditingDetails] = useState({});
    const [description, setDescription] = useState("");

    useEffect(() => {
    const fetchVisit = async () => {
        const docRef = doc(firestoreDatabase, "appointments", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
        setVisit({ id: docSnap.id, ...docSnap.data() });
        console.log("Wizyta:", { id: docSnap.id, ...docSnap.data() });
        if (docSnap.data().status === "zakończona") {
            setVisitFinalization(true);
        }

        } else {
        console.error("Wizyta nie znaleziona");
        }
    };
    fetchVisit();
    }, [id]);

  if (!visit) return <div>Ładowanie...</div>;

  const startEditingDetails = () => {
    setEditingDetails({
        mainDescription: visit?.mainDescription ?? "",
        extraDescription: visit?.extraDescription ?? "",
        paymentType: visit?.paymentType ?? "gotówka",
    });
    setEditingVisitId(visit.id);
}

    const handleEditChange = (e,field) => {
        const value = field === "startTime" || field === "endTime" ? e.target.value + "T00:00" : e.target.value;
        setEditingDetails({
            ...editingDetails,
            [field]: value,
        })

    }

    const saveEdit = async (visitId) => {
        const safeData = {
            mainDescription: editingDetails.mainDescription ?? "",
            extraDescription: editingDetails.extraDescription ?? "",
            paymentType: editingDetails.paymentType ?? "gotówka",
        };
    
        const docRef = doc(firestoreDatabase, "appointments", visitId);
        await updateDoc(docRef, safeData);
        setVisit({ ...visit, ...safeData });
        setEditingVisitId(null);
    };
    
  return (
    <>
    <div className="flex flex-col items-center mt-4 text-2xl">
        <div className="flex flex-row mt-4 w-full">
            <div className="flex flex-col mt-4 w-1/2 items-center">
            <h1 className="font-bold mb-4 text-pink-700">Szczegóły wizyty</h1>
            <table>
                <tbody>
                    <tr>
                        <td className="p-2 mr-6">Klient</td>
                        <td className="bg-pink-100 p-2">{visit.customer}</td>
                    </tr>
                    <tr>
                        <td className="p-2 mr-6">Pracownik</td><td className="bg-pink-100 p-2">{visit.employee}</td>
                    </tr>
                    <tr>
                        <td className="p-2 mr-6">Usługi</td><td className="bg-pink-100 p-2">{visit.services.map(s => s.name).join(", ")}</td>
                    </tr>
                    <tr>
                        <td className="p-2 mr-6">Data</td><td className="bg-pink-100 p-2">{visit.startTime.split("T")[0]}</td>
                    </tr>
                    <tr>
                        <td className="p-2 mr-6">Godzina rozpoczęcia</td><td className="bg-pink-100 p-2">{visit.startTime.split("T")[1].slice(0, 5)}</td>
                    </tr>
                    <tr>
                        <td className="p-2 mr-6">Godzina zakończenia</td><td className="bg-pink-100 p-2">{visit.endTime.split("T")[1].slice(0, 5) }</td>
                    </tr>
                    <tr>
                        <td className="p-2 mr-6">Status</td><td className="bg-pink-100 p-2">{visit.status}</td>
                    </tr>
                    <tr>
                        <td className="p-2 mr-6">Główny opis</td><td className="bg-pink-100 p-2">
                            {
                                editingVisitId === visit.id ? (
                                    <textarea value={editingDetails.mainDescription} onChange={(e) => handleEditChange(e,"mainDescription")} className="w-full h-24 p-2 border border-gray-300 rounded" placeholder="Wpisz główny opis wizyty"></textarea>
                                ) : (
                                    visit.mainDescription
                                )
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="p-2 mr-6">Dodatkowy opis</td><td className="bg-pink-100 p-2">
                            {
                                editingVisitId === visit.id ? (
                                    <textarea value={editingDetails.extraDescription} onChange={(e) => handleEditChange(e,"extraDescription")} className="w-full h-24 p-2 border border-gray-300 rounded" placeholder="Wpisz dodatkowy opis wizyty"></textarea>
                                ) : (
                                    visit.extraDescription
                                )
                            }
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>

        {visitFinalization && (
            <>
            <div className="flex flex-col mt-4 w-1/2 items-center">
                <h1 className="font-bold mb-4 text-pink-700">Finalizacja wizyty</h1>
                <table>
                    <tbody>
                        <tr>
                            <td className="p-2 mr-6">Usługi</td>
                            <td className="bg-pink-100 p-2">
                                <ul className="list-disc list-inside">
                                    {visit.services.map((service,index) => (
                                        <li key={index}>
                                            {service.name} - {service.price} zł
                                        </li>
                                    ))}
                                    </ul>
                            </td>
                        </tr>
                        <tr>
                            <td className="p-2 mr-6">Suma cen usług</td>
                            <td className="bg-pink-100 p-2">{visit.servicesTotal} zł</td>
                        </tr>
                        <tr>
                            <td className="p-2 mr-6">Produkty</td>
                            <td className="bg-pink-100 p-2">
                                <ul className="list-disc list-inside">
                                    {visit.products.map((product,index) => (
                                        <li key={index}>
                                            {product.name} - {product.price} zł
                                        </li>
                                    ))}
                                    </ul>
                            </td>
                        </tr>
                        <tr>
                            <td className="p-2 mr-6">Suma cen produktów</td>
                            <td className="bg-pink-100 p-2">{visit.productsTotal} zł</td>
                        </tr>
                        <tr>
                            <td className="p-2 mr-6">Łączna kwota do zapłaty</td>
                            <td className="bg-pink-100 p-2">{visit.totalAmount} zł</td>
                        </tr>
                        <tr>
                            <td className="p-2 mr-6">Zniżka</td>
                            <td className="bg-pink-100 p-2">{visit.discount} zł</td>
                        </tr>
                        <tr>
                            <td className="p-2 mr-6">Kwota po zniżce</td>
                            <td className="bg-pink-100 p-2">{visit.totalAmount - visit.discount} zł</td>
                        </tr>
                        
                        <tr>
                            <td className="p-2 mr-6">Forma płatności</td>
                            {editingVisitId === visit.id ? (
                                <td className="bg-pink-100 p-2">
                                    <select value={editingDetails.paymentType} onChange={(e) => handleEditChange(e,"paymentType")}>
                                        <option value="gotówka">Gotówka</option>
                                        <option value="karta">Karta</option>
                                    </select>
                                </td>
                            ) : (
                                <td className="bg-pink-100 p-2">{visit.paymentType}</td>
                            )}


                        </tr>
                    </tbody>
                </table>
            </div>
            </>
        )}
        
    </div>
    <div className="flex flex-row items-center justify-between mt-5">
        <div className="m-5">
        {editingVisitId === visit.id ? (
                    <>
                    <button className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-3 border border-green-500 hover:border-transparent rounded" onClick={() => saveEdit(visit.id)}>Zapisz</button>
                    <button className="bg-transparent hover:bg-yellow-500 text-yellow-700 font-semibold hover:text-white py-1 px-3 border border-yellow-500 hover:border-transparent rounded" onClick={()=> setEditingVisitId(null)}>Anuluj</button>
                    </>
                ) : (
                <button
                  onClick={() => startEditingDetails(visit.id)}
                  className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
                >
                  Edytuj
                </button>
                )}
        </div>
        <div className="m-5">
           <button 
            onClick={() => deleteVisit(visit.id)}
            className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded">
                Usuń
        </button> 
        </div>
        
        </div>
    </div>
   
    </>
  );
};

export default VisitDetails;
