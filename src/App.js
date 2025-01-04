import { useState, useEffect } from "react";
import Cart from "./components/Cart/Cart";
import Header from "./components/Layout/Header";
import Meals from "./components/Meals/Meals";
import CartProvider from "./store/CartProvider";

function App() {
  const [cartIsShown, setCartIsShown] = useState(false);
  const [selectedType, setSelectedType] = useState('ALL');
  const [tableInfo, setTableInfo] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);

  useEffect(() => {
    const url = window.location.href;
    const tableNumberMatch = url.match(/table(\d+)/);
    const tableNumber = tableNumberMatch ? tableNumberMatch[1] : null;
    setTableNumber(tableNumber);

    if (tableNumber) {
      const fetchTableInfo = async () => {
        try {
          console.log('Fetching table info for table:', tableNumber);
          const response = await fetch(`https://dnd-backend-sigma.vercel.app/api/table-info?tableNumber=${tableNumber}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch table info');
          }

          const data = await response.json();
          console.log('Received table info:', data);
          setTableInfo(data);
        } catch (error) {
          console.error('Error fetching table info:', error);
        }
      };

      fetchTableInfo();
    }
  }, []);

  const showCardHandle = () => {
    setCartIsShown(true);
  };
  const hideCardHandle = () => {
    setCartIsShown(false);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  return (
    <CartProvider>
      {cartIsShown && <Cart onClose={hideCardHandle} tableInfo={tableInfo} />}
      <Header onShowCart={showCardHandle} selectedType={selectedType} onTypeChange={handleTypeChange} />
      <main>
        <Meals selectedType={selectedType} />
      </main>
    </CartProvider>
  );
}

export default App;