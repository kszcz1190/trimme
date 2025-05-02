import { Link } from "react-router-dom";
import "../styles/menu.css";
import { useState } from "react";

const Menu = () => {
  const [menu, setMenu] = useState(false);
  
  
  return (
    <>
    <nav className=" bg-white h-[100%] flex flex-col items-center text-lg sticky z-50">
      <div className="text-4xl bg-pink-800 text-white block rounded-4xl px-6 py-4 mt-6">TrimMe</div>
      <div className={`p-6 md:static md:min-h-fit absolute min-h-[60vh] left-0 top-[70px] md:w-auto flex items-center transition-all duration-300 ease-in-out transform z-100 ${menu ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5 pointer-events-none"} md:opacity-100 md:translate-y-0 md:pointer-events-auto`}>
        
        <ul className="flex md:items-center md:gap-[1vw] flex-col pt-6">
        <li className="w-60">
            <Link className="block px-6 py-4 text-xl hover:font-bold hover:text-white transition-all duration-150 hover:bg-pink-800 hover:rounded-2xl" to="/scheduler">Wizyty</Link>
          </li>
          <li className="w-60">
            <Link className="block px-6 py-4 text-xl hover:font-bold hover:text-white transition-all duration-150 hover:bg-pink-800 hover:rounded-2xl" to="/timetable">Grafik</Link>
          </li>
          <li className="w-60">
            <Link className="block px-6 py-4 text-xl hover:font-bold hover:text-white transition-all duration-150 hover:bg-pink-800 hover:rounded-2xl" to="/history">Historia wizyt</Link>
          </li>
          <li className="w-60">
            <Link className="block px-6 py-4 text-xl hover:font-bold hover:text-white transition-all duration-150 hover:bg-pink-800 hover:rounded-2xl" to="/employees">Pracownicy</Link>
          </li>
          <li className="w-60">
            <Link className="block px-6 py-4 text-xl hover:font-bold hover:text-white transition-all duration-150 hover:bg-pink-800 hover:rounded-2xl" to="/customers">Klienci</Link>
          </li>
          <li className="w-60">
            <Link className="block px-6 py-4 text-xl hover:font-bold hover:text-white transition-all duration-150 hover:bg-pink-800 hover:rounded-2xl" to="/services">Usługi</Link>
          </li>
          <li className="w-60">
            <Link className="block px-6 py-4 text-xl hover:font-bold hover:text-white transition-all duration-150 hover:bg-pink-800 hover:rounded-2xl" to="/products">Produkty</Link>
          </li>
        </ul>
      </div>
      <div className="md:hidden text-3xl cursor-pointer" onClick={()=>setMenu(!menu)}><ion-icon name="menu"></ion-icon></div>
    </nav>
    </>
  );
};
export default Menu;
