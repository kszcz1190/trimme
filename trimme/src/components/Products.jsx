import { Component,useState } from "react";
import * as Database from "../Database";
import SearchProduct from "../hooks/SearchProduct";
import { firestoreDatabase } from "../Database";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

const Products = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [capacity, setCapacity] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const {products, productSearchTerm, setProductSearchTerm, setProducts} = SearchProduct();
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [formVisible, setFormVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const addProduct = async (event) => {
    event.preventDefault();
    const db = await Database.get();
    //walidacja formularza
    if (!name || !description || !price || !capacity || !quantity) {
      setErrorMsg("Wszystkie pola są wymagane.");
      return;
    }
    if (price <= 0 || capacity <= 0 || quantity <= 0) {
      setErrorMsg("Cena, pojemność i ilość muszą być większe od 0.");
      return;
    }
    if (name.length < 3) {
      setErrorMsg("Nazwa produktu musi mieć co najmniej 3 znaki.");
      return;
    }
    if (description.length < 5) {
      setErrorMsg("Opis produktu musi mieć co najmniej 5 znaków.");
      return;
    }
    if (description.length > 100) {
      setErrorMsg("Opis produktu nie może mieć więcej niż 100 znaków.");
      return;
    }

    // Sprawdzenie, czy nazwa produktu już istnieje
    const nameExists = products.some((product) => product.name === name);
    
    if (nameExists) {
      const userConfirmed = window.confirm(
        `Nazwa produktu ${name} już istnieje w bazie. Czy chcesz dodać produkt o tej samej nazwie?`
      );

      if (!userConfirmed) {
        return; // Jeśli użytkownik nie wyrazi zgody, nie dodajemy klienta
      }
    }

    //sprawdzanie, czy produkt już istnieje w bazie danych 
    const productExists = products.some((product) => product.name === name && product.description === description && product.price === price && product.capacity === capacity );
    if (productExists) {
      setErrorMsg("Produkt o tej samej nazwie, opisie, cenie i pojemności istnieje już w bazie.");
      return;
    }

    const addData = {
      id: Math.random().toString(20).substring(2, 15), // Generowanie unikalnego ID
      name,
      description,
      price: Number(price),
      capacity: Number(capacity),
      quantity: Number(quantity),
    };
    setProducts([...products, addData]);
    setFormVisible(false);
    console.log("Dodawanie do magazynu:", addData); // Debugowanie
    try {
      await db.collections.products.insert(addData);
      // Resetowanie formularza
      setName("");
      setDescription("");
      setPrice(0);
      setCapacity(0);
      setQuantity(0);
      setErrorMsg(""); // Resetowanie komunikatu o błędzie
    } catch (error) {
      console.error("Błąd zapisu do bazy:", error);
    }
  };

  const startEditing = (product) => {
    setEditingProductId(product.id);
    setEditedProduct(product);
  };

  const handleEditChange = (event, field) => {
    const value = field === "price" || field === "capacity" || field === "quantity" ? Number(event.target.value) : event.target.value;
    setEditedProduct({
      ...editedProduct,
      [field]: value,
    });
  };

  const saveEdit = async () => {
    try {
      await updateDoc(doc(firestoreDatabase, "products", editedProduct.id), editedProduct);
      setProducts((prev) => prev.map((product) => (product.id === editedProduct.id ? editedProduct : product)));
      setEditingProductId(null);
    } catch (error) {
      console.error("Błąd zapisu do bazy:", error);
    }
  };

  const deleteProduct = async (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product && window.confirm(`Czy na pewno chcesz usunąć ten produkt? ${product.name}`)) {
      const filteredProducts = products.filter((p) => p.id !== productId);
      setProducts(filteredProducts);

      try {
        await deleteDoc(doc(firestoreDatabase, "products", productId));
      } catch (error) {
        console.error("Błąd podczas usuwania produktu:", error);
      }
    }
  };

  return (
    <>
      <div className="p-4 text-xs relative flex flex-col gap-5 w-full overflow-x-auto lg:text-lg md:text-sm sm:text-xs">
      <button
        onClick={() => setFormVisible(!formVisible)}
        className={`bg-transparent ${formVisible ? "hover:bg-yellow-500 text-yellow-700 border-yellow-500" : "hover:bg-pink-500 text-pink-700 border-pink-500"} font-semibold hover:text-white py-2 px-4 border hover:border-transparent rounded`}
      >
        {formVisible ? "Anuluj" : "Dodaj produkt"}
      </button>
      <div className={`transition-all duration-500 overflow-hidden ${formVisible ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}`}>
       
            <form onSubmit={addProduct} className="flex flex-col gap-4 w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-4">
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Nazwa produktu</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Opis produktu</label>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Cena (zł)</label>
            <input
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Pojemność (ml)</label>
            <input
              type="number"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700">Ilość (szt)</label>
            <input
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-200">
            Dodaj produkt
          </button>
          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
        </form> 
        </div>
        <div className="flex flex-col w-full">
          <label>Dodaj produkty:</label>

          <input
              type="text"
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm( e.target.value)}
              placeholder="Wpisz nazwę produktu"
              className="p-2 border border-gray-400 rounded-md"
          />
        </div>
        <table className="w-full lg:text-lg md:text-sm sm:text-xs text-center text-black">
          <thead className="lg:text-lg md:text-sm sm:text-xs text-gray-500 uppercase border-b border-gray-300">
            <tr>
              <th className="px-2 sm:px-4 py-2">Nazwa</th>
              <th className="px-2 sm:px-4 py-2">Opis</th>
              <th className="px-2 sm:px-4 py-2">Cena (zł)</th>
              <th className="px-2 sm:px-4 py-2">Pojemność (ml)</th>
              <th className="px-2 sm:px-4 py-2">Ilość (szt)</th>
              <th className="px-2 sm:px-4 py-2">Edytuj</th>
              <th className="px-2 sm:px-4 py-2">Usuń</th>
            </tr>
          </thead>
          <tbody >
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-pink-50">
                <td>
                  {editingProductId === product.id ? (
                    <input
                      type="text"
                      value={editedProduct?.name || ""}
                      onChange={(event) => handleEditChange(event, "name")}
                      className="text-center"
                    />
                  ) : (
                    product.name
                  )}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <input
                      type="text"
                      value={editedProduct?.description || ""}
                      onChange={(event) => handleEditChange(event, "description")}
                      className="text-center"
                    />
                  ) : (
                    product.description
                  )}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <input
                      type="number"
                      value={editedProduct?.price || ""}
                      onChange={(event) => handleEditChange(event, "price")}
                      className="text-center"
                    />
                  ) : (
                    product.price
                  )}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <input
                      type="number"
                      value={editedProduct?.capacity || ""}
                      onChange={(event) => handleEditChange(event, "capacity")}
                      className="text-center"
                    />
                  ) : (
                    product.capacity
                  )}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <input
                      type="number"
                      value={editedProduct?.quantity || ""}
                      onChange={(event) => handleEditChange(event, "quantity")}
                      className="text-center"
                    />
                  ) : (
                    product.quantity
                  )}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <>
                    <button className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-3 border border-green-500 hover:border-transparent rounded" onClick={() => saveEdit(product.id)}>Zapisz</button>
                    <button className="bg-transparent hover:bg-yellow-500 text-yellow-700 font-semibold hover:text-white py-1 px-3 border border-yellow-500 hover:border-transparent rounded" onClick={()=> setEditingProductId(null)}>Anuluj</button>
                    </>
                  ) : (
                    <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded" onClick={() => startEditing(product)}>Edytuj</button>
                  )}
                </td>
                <td>
                  <button className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded" onClick={() => deleteProduct(product.id)}>Usuń</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export default Products;