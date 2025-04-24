import SearchService from "../hooks/SearchService";
import SearchProduct from "../hooks/SearchProduct";
import { useEffect,useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { firestoreDatabase } from "../Database";
// VisitFinalization.js
export default function VisitFinalization({ selectedEvent,setFinalizeEvent,setEvents,setVisitPreview}) {
    const [servicesTotal, setServicesTotal] = useState(0);
    const [productsTotal, setProductsTotal] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [customAmount, setCustomAmount] = useState(0);
    const {
        products,
        productSearchTerm,
        setProductSearchTerm,
        setProducts
      } = SearchProduct();
    const [productsList, setProductsList] = useState([{ id: Date.now(), productSearchTerm: "", selectedProduct: "" , price: 0}]);
    const [isDropdownProdOpen, setIsDropdownProdOpen] = useState(null); // Który dropdown jest otwarty
    const {
        services,
        serviceSearchTerm,
        setServiceSearchTerm,
        setServices
    } = SearchService();

    const [servicesList, setServicesList] = useState([{ id: Date.now(), serviceSearchTerm: "", selectedService: "", endPrice: 0 }]);
    const [isDropdownServOpen, setIsDropdownServOpen] = useState(null); // Który dropdown jest otwarty
    const [paymentType, setPaymentType] = useState("cash");

    useEffect(() => {
        // Obliczanie całkowitej kwoty usług
        const newServicesTotal = servicesList.reduce((total, serv) => {
            const price = parseFloat(serv.price) || 0;
            return total + price;
          }, 0);
          setServicesTotal(newServicesTotal);
          
    
        // Obliczanie całkowitej kwoty produktów
        const newProductsTotal = productsList.reduce((total, prod) => {
            const price = parseFloat(prod.price) || 0;
            return total + price;
        }, 0);
        setProductsTotal(newProductsTotal);
    
        // Obliczanie łącznej kwoty
        setTotalAmount(newServicesTotal + newProductsTotal);
    }, [servicesList, productsList]);
    
    useEffect(() => {
        setCustomAmount(totalAmount - discount);
      }, [totalAmount, discount]);
      
    // Dodanie nowego produktu
    const handleAddProduct = () => {
        setProductsList([...productsList, { id: Date.now(), productSearchTerm: "", selectedProduct: "" }]);
    };
    
    const handleAddService = () => {
    setServicesList([...servicesList, { id: Date.now(), serviceSearchTerm: "", selectedService: "" }]);
    };
    // Usunięcie produktu
    const handleRemoveProduct = (id) => {
    setProductsList(productsList.filter((prod) => prod.id !== id));
    };

    const handleRemoveService = (id) => {
    setServicesList(servicesList.filter((serv) => serv.id !== id));
    };

    // Obsługa zmiany wartości w polu wyszukiwania
    const handleProductChange = (id, value) => {
    setProductsList(productsList.map((prod) => prod.id === id ? { ...prod, productSearchTerm: value, selectedProduct: "" } : prod));
    };

    const handleServiceChange = (id, value) => {
    setServicesList(servicesList.map((serv) => serv.id === id ? { ...serv, serviceSearchTerm: value, selectedService: "" } : serv));
    };

    const handleProductSelect = (id, selectedProd) => {
        setProductsList(productsList.map((prod) => 
            prod.id === id 
            ? { 
                ...prod, 
                selectedProduct: selectedProd.name, 
                productSearchTerm: "",
                price: selectedProd.price // Aktualizowanie ceny
            } 
            : prod
        ));
        setIsDropdownProdOpen(null);
    };
    
    const handleServiceSelect = (id, selectedServ) => {
        setServicesList(servicesList.map((serv) => 
            serv.id === id 
            ? { 
                ...serv, 
                selectedService: selectedServ.name, 
                serviceSearchTerm: "",
                endPrice: selectedServ.endPrice // Aktualizowanie ceny
            } 
            : serv
        ));
        setIsDropdownServOpen(null);
    };

    const handleServicePriceChange = (id, value) => {
        const newServicesList = servicesList.map((serv) =>
          serv.id === id ? { ...serv, price: parseFloat(value) || 0 } : serv
        );
        setServicesList(newServicesList);
      };
      
    

    const handleFinalizeEvent = async (e) => {
        e.preventDefault();
        if (!selectedEvent.id) {
            console.error("Brak wybranego wydarzenia do finalizacji");
            return;
        }
        if (window.confirm(`Czy na pewno chcesz finalizować wizytę ${selectedEvent.title}?`)) {
            try {
                await updateDoc(doc(firestoreDatabase, "appointments", selectedEvent.id), {
                    status: "zakończona",
                    services: servicesList
                      .filter((serv) => serv.selectedService)
                      .map((serv) => ({
                        name: serv.selectedService,
                        price: serv.price
                      })),
                    products: productsList
                      .filter((prod) => prod.selectedProduct)
                      .map((prod) => ({
                        name: prod.selectedProduct,
                        price: prod.price
                      })),
                    paymentType,
                    servicesTotal,
                    productsTotal,
                    totalAmount,
                    discount,
                  });
                  
                setEvents((prevEvents) =>
                    prevEvents.map((ev) =>
                        ev.id === selectedEvent.id ? { ...ev, status: "zakończona" } : ev
                    )
                );
                setFinalizeEvent(false);
                setProductsList([{ id: Date.now(), productSearchTerm: "", selectedProduct: "" }]);
                setServicesList([{ id: Date.now(), serviceSearchTerm: "", selectedService: "" }]);
            } catch (error) {
                console.error("Błąd podczas finalizacji wizyty:", error);
            }
        }
    };


    return (
<div className="flex flex-col">
    <form action="" onSubmit={handleFinalizeEvent}>
        
    <div className="flex flex-col p-5">
    <h2 className="font-bold">Dodaj usługę:</h2>
         {/* Lista usług */}
    {servicesList.map((serv, index) => (
    <div key={serv.id} className="flex items-center space-x-2 mb-2 relative">
        <input
            type="text"
            value={serv.selectedService || serv.serviceSearchTerm}
            onChange={(e) => handleServiceChange(serv.id, e.target.value)}
            onFocus={() => setIsDropdownServOpen(serv.id)}
            onBlur={() => setTimeout(() => setIsDropdownServOpen(null), 200)}
            placeholder="Wpisz nazwę usługi"
            className="p-2 border border-gray-400 rounded-md w-64"
        />

        {isDropdownServOpen === serv.id && services.length > 0 && (
            <ul className="absolute top-12 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto w-64 z-10">
                {services
                    .filter((s) => s.name.toLowerCase().includes(serv.serviceSearchTerm.toLowerCase()))
                    .map((service) => (
                        <li
                            key={service.id}
                            onClick={() => handleServiceSelect(serv.id, service)}
                            className="p-2 hover:bg-pink-100 cursor-pointer"
                        >
                            {service.name} {service.startPrice} - {service.endPrice} zł
                        </li>
                    ))}
            </ul>
        )}

        {/* Przycisk do usuwania usługi (tylko jeśli jest więcej niż jedna) */}
        {servicesList.length > 1 && (
            <button
                onClick={() => handleRemoveService(serv.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded shadow-md"
            >
                -
            </button>
        )}

        {/* Przycisk do dodania nowej usługi */}
        {index === servicesList.length - 1 && (
            <button
                onClick={handleAddService}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded shadow-md"
            >
                +
            </button>
        )}
        <input
            type="number"
            value={serv.price}
            onChange={(e) => handleServicePriceChange(serv.id, e.target.value)}
            placeholder="Cena"
            className="p-2 border border-gray-400 rounded-md w-20"
        />
    </div>
))}

    {/* Przycisk do czyszczenia usług */}
    <button
        onClick={(e) => {
            e.preventDefault();
            setServicesList([{ id: Date.now(), serviceSearchTerm: "", selectedService: "" }]);
        }}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200 mt-4"
    >
        Wyczyść usługi
    </button>



    <div className="flex flex-col mt-4">
        <h2 className="font-bold">Dodaj produkty:</h2>

        {/* Lista produktów */}
        {productsList.map((prod, index) => (
        <div key={prod.id} className="flex items-center space-x-2 mb-2 relative">

        <input
            type="text"
            value={prod.selectedProduct || prod.productSearchTerm}
            onChange={(e) => handleProductChange(prod.id, e.target.value)}
            onFocus={() => setIsDropdownProdOpen(prod.id)}
            onBlur={() => setTimeout(() => setIsDropdownProdOpen(null), 200)}
            placeholder="Wpisz nazwę produktu"
            className="p-2 border border-gray-400 rounded-md w-64"
        />


        {isDropdownProdOpen === prod.id && products.length > 0 && (
        <ul className="absolute top-12 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto w-64 z-10">
            {products
            .filter((p) => p.name.toLowerCase().includes(prod.productSearchTerm))
            .map((product) => (
                <li
                key={product.id}
                onClick={() => handleProductSelect(prod.id, product)}
                className="p-2 hover:bg-pink-100 cursor-pointer"
                >
                {product.name} {product.price} zł ({product.capacity} ml)
                </li>
            ))}
        </ul>
        )}


        {/* Przycisk do usuwania produktu */}
        {productsList.length > 1 && (
        <button
            onClick={() => handleRemoveProduct(prod.id)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded shadow-md"
        >
            -
        </button>
        )}
        {/* Przycisk do dodania nowego produktu */}
        {index === productsList.length - 1 && (
            
            <button
            onClick={handleAddProduct}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded shadow-md"
            >
            +
            </button>
        )}
        </div>
        ))}
    </div>

    {/* Przycisk do czyszczenia produktów */}
    <button
        onClick={(e) => {
            e.preventDefault();
            setProductsList([{ id: Date.now(), productSearchTerm: "", selectedProduct: "" }]);
        }}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200 mt-4"
    >
        Wyczyść produkty
    </button>

    <div className="flex flex-col mt-4">
        <div className="font-bold">
            Usługi: {servicesTotal} zł 
        </div>
        <div className="font-bold">
            Produkty: {productsTotal} zł 
        </div>
        <div className="font-bold">
            Razem: {totalAmount} zł
        </div>
        {/* Naliczanie rabatu */}
        <div className="flex items-center mt-2">
            <label htmlFor="discount" className="font-bold mr-2">Rabat</label>
            <input
            type="number"
            name="discount"
            id="discount"
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            value={discount}
            className="p-2 border border-gray-400 rounded-md"
            />
        </div>
        <label htmlFor=""  className="font-bold mr-2">Kwota</label>
        <input
            className="p-2 border border-gray-400 rounded-md mb-4"
            type="number"
            value={(customAmount).toFixed(2)}
            onChange={(e) => setCustomAmount(Number(e.target.value) || 0)}
            />
  
    </div>
    <div className="flex flex-row">
        <label htmlFor="" className="font-bold mr-2">Rodzaj płatności</label>
        <select id="payment"
        value={paymentType}
        onChange={(e) => setPaymentType(e.target.value)}>
            <option value="gotówka">Gotówka</option>
            <option value="karta">Karta</option>
        </select>
    </div>
        
        {/* Finalizacja */}
            <button 
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200 mt-4">
                Finalizuj
            </button>
            <button 
                onClick={() => setFinalizeEvent(false)} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200 mt-2">
                Anuluj
            </button>
        </div>
    </form> 
</div>
)
}
          
  