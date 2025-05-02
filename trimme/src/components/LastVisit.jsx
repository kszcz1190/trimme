import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDocs,collection,query,where,orderBy,limit } from "firebase/firestore";
import { firestoreDatabase } from "../Database";

const LastVisit = (customerId, ) => {
    const [visit, setVisit] = useState(null);

    useEffect(() => {
        if (!customerId) return; // Sprawdzenie, czy customerId jest dostępny
        const fetchLastVisit = async () => {
        try {
            const appointmentsRef = collection(firestoreDatabase, "appointments");
          const q = query(
            appointmentsRef,
            where("customerId", "==", customerId),
            orderBy("date", "desc"),
            limit(1)
          );
    
          const querySnapshot = await getDocs(q); // <-- Używamy getDocs, nie getDoc
          if (!querySnapshot.empty) {
            const lastVisitDoc = querySnapshot.docs[0];
            setVisit({ id: lastVisitDoc.id, ...lastVisitDoc.data() });
          } else {
            console.error("Brak wizyt dla tego klienta");
          }
        } catch (error) {
          console.error("Błąd podczas pobierania wizyty:", error);
        }
      };
    
      fetchLastVisit();
    }, [customerId]);

  if (!visit) return <div>Ładowanie...</div>;

    
  return (
    <>
    <div className="flex flex-col items-center mt-4 text-md">
        <div className="flex flex-row mt-4 w-full">
            <div className="flex flex-col mt-4 w-1/2 items-center">
            <h1 className="font-bold mb-4 text-pink-700">Ostatnia wizyta</h1>
            <table>
                <tbody>
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
                        <td className="p-2 mr-6">Dodatkowy opis</td><td className="bg-pink-100 p-2"> {visit.extraDescription}</td>
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
                            <td className="p-2 mr-6">Forma płatności</td><td className="bg-pink-100 p-2">{visit.paymentType}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            </>
        )}
        
    </div>

    </div>
   
    </>
  );
};

export default LastVisit;
