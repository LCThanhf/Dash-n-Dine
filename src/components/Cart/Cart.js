// filepath: /c:/Users/chith/Downloads/react-food-ordering/frontend/src/components/Cart/Cart.js
import { Fragment, useEffect, useState } from "react";
import { useContext } from "react";
import CartContext from "../../store/Cart-Context";
import Modal from "../UI/Modal";
import classes from "./Cart.module.css";
import CartItem from "./CartItem";
import Checkout from "./Checkout";

const Cart = (props) => {
  const [isCheckout, setCheckout] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [submited, setSubmited] = useState(false);

  const [savedUserData] = useState({ name: '', phone: '', paymentMethod: 'cash' }); // State to save user data

  const cartContext = useContext(CartContext);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  useEffect(() => {
    console.log('Received table info in Cart:', props.tableInfo);
  }, [props.tableInfo]);

  const totalAmount = `${Math.max(0, cartContext.totalAmount).toLocaleString('vi-VN')} đ`;
  const hasItems = cartContext.items.length > 0;

  const cartItemRemoveHandler = (id) => {
    cartContext.removeItem(id);
    if (cartContext.items.length === 1) {
      setCheckout(false);
    }
  };

  const cartItemAddHandler = (item) => {
    cartContext.additem({ ...item, amount: 1 });
  };

  const cartItemRemoveAllHandler = (id) => {
    cartContext.removeAllItems(id);
    if (cartContext.items.length === 1) {
      setCheckout(false);
    }
  };

  const orderHandler = () => {
    setCheckout(true);
  };

  const submitOrderHandler = async (userData) => {
    if (!props.tableInfo || !props.tableInfo.table_number) {
      console.error('Table info is missing:', props.tableInfo);
      return;
    }
  
    setIsSubmiting(true);
    try {
      // Format order
      const orderData = {
        tableNumber: props.tableInfo.table_number,
        orderItems: cartContext.items.map(item => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          price: item.price,
        })),
        totalAmount: Math.round(cartContext.totalAmount),
        paymentMethod: userData.paymentMethod || 'cash'
      };
  
      // Add request headers and error handling
      const response = await fetch("https://dnd-backend-sigma.vercel.app/api/orders", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit order: ${response.status} - ${errorText}`);
      }
  
      const responseData = await response.json();
      console.log('Order submitted successfully:', responseData);
  
      setTimeout(() => {
        setIsSubmiting(false);
        setSubmited(true);
        cartContext.clearCart();
      }, 1500);
  
    } catch (error) {
      console.error('Error submitting order:', error);
      setIsSubmiting(false);
      // Show error to user
      alert('Failed to submit order. Please try again.');
    }
  };

  const showQrCodeHandler = (userData) => {
    submitOrderHandler(userData);
  };

  const cartItems = (
    <ul className={classes["cart-items"]}>
      {cartContext.items.map((item, id) => (
        <CartItem
          key={id}
          name={item.name}
          amount={item.amount}
          price={item.price}
          image={item.image}
          onRemove={cartItemRemoveHandler.bind(null, item.id)}
          onAdd={cartItemAddHandler.bind(null, item)}
          onRemoveItem={cartItemRemoveAllHandler.bind(null, item.id)}
        />
      ))}
    </ul>
  );

  const modalActions = (
    <div className={classes.actions}>
      <button className={classes["button--alt"]} onClick={props.onClose}>
        Close
      </button>
      {hasItems && (
        <button className={classes.button} onClick={orderHandler}>
          Order
        </button>
      )}
    </div>
  );

  const cartModalContent = (
    <Fragment>
      {cartItems}
      <div className={classes.total}>
        <span>Total - Table {props.tableInfo?.table_number}</span>
        <span>{totalAmount}</span>
      </div>
      {isCheckout && (
        <Checkout onSubmit={showQrCodeHandler} onCancel={props.onClose} savedUserData={savedUserData} />
      )}
      {!isCheckout && modalActions}
    </Fragment>
  );

  const isSubmitingModalContent = <p>Sending order data...</p>;

  const submitedModalContent = (
    <Fragment>
      <p>
        Successfully sent your order <i className="fas fa-check" style={{ color: 'green' }}></i>
      </p>
      <div className={classes.actions}>
        <button className={classes["button--alt"]} onClick={props.onClose}>
          Close
        </button>
      </div>
    </Fragment>
  );

  return (
    <Modal onClose={props.onClose}>
      {!isSubmiting && !submited && cartModalContent}
      {isSubmiting && isSubmitingModalContent}
      {!isSubmiting && submited && submitedModalContent}
    </Modal>
  );
};

export default Cart;