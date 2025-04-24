import { Link } from "react-router-dom";
import "../styles/menu.css";
import { useState } from "react";

const Menu = () => {
  const [menu, setMenu] = useState(false);
  
  
  return (
    <>
    <nav className=" bg-pink-300 p-6 w-[100%] flex justify-between items-center text-white text-xl sticky top-0 z-50">
      <div className="flex justify-start">TrimMe</div>
      <div className={`md:static md:min-h-fit absolute bg-pink-300 min-h-[60vh] left-0 top-[70px] md:w-auto w-full flex items-center px-5 transition-all duration-300 ease-in-out transform z-100 ${menu ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5 pointer-events-none"} md:opacity-100 md:translate-y-0 md:pointer-events-auto`}>

        <ul className="flex md:items-center md:gap-[4vw] md:flex-row flex-col gap-8">
          <li>
            <Link className="hover:text-pink-700" to="/employees">Pracownicy</Link>
          </li>
          <li>
            <Link className="hover:text-pink-700 " to="/customers">Klienci</Link>
          </li>
          <li>
            <Link className="hover:text-pink-700 " to="/services">Usługi</Link>
          </li>
          <li>
            <Link className="hover:text-pink-700" to="/products">Produkty</Link>
          </li>
          <li>
            <Link className="hover:text-pink-700" to="/scheduler">Wizyty</Link>
          </li>
          <li>
            <Link className="hover:text-pink-700" to="/timetable">Grafik</Link>
          </li>
          <li>
            <Link className="hover:text-pink-700" to="/history">Historia wizyt</Link>
          </li>
        </ul>
      </div>
      <div className="md:hidden text-3xl cursor-pointer" onClick={()=>setMenu(!menu)}><ion-icon name="menu"></ion-icon></div>
      <div className="">Wyloguj</div>
    </nav>
    </>
  );
};
export default Menu;
