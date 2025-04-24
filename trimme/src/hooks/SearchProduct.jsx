import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestoreDatabase } from "../Database";

const SearchProduct = () => {
  const [products, setProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return; 
    const fetchProducts = async () => {
      try {
        const productsCollectionRef = collection(firestoreDatabase, "products");
        const querySnapshot = await getDocs(productsCollectionRef);
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
        setLoading(false);  // <- Dodaj to!
      } catch (error) {
        console.error("Error while fetching products:", error);
      }
    };
  
    fetchProducts();
  }, [loading]);
  

  const filteredProducts = products.filter((product) => {
    const search = productSearchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search)
    );
  });
  return { products: filteredProducts, productSearchTerm, setProductSearchTerm, setProducts };
};

export default SearchProduct;

