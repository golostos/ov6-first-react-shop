// @ts-check
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, } from "react-router-dom";
import styles from './App.module.css';
import Cart from './Cart';
import Login from './Login';
import Main from './Main';
import NewProduct from './products/NewProduct';

function App() {
  const [user, setUser] = useState(null)
  const [count, setCount] = useState(0)
  const [products, setProducts] = useState([])
  const [carts, setCarts] = useState([])

  useEffect(() => {
    fetch('http://localhost:4000/users/2')
      .then((res) => {
        if (!res.ok) throw new Error('Wrong user')
        return res.json()
      })
      .then((user) => {
        setUser(user)
      })
      .catch(err => console.error(err))
  }, [])
  
  return (
    <>      
      <header>
        <nav>
          <Link to="/">Main</Link> | {" "}
          <Link to="/cart">Cart</Link> | {" "}
          <Link to="/login">Login</Link> | {" "}
          <Link to="/create">Create</Link>
        </nav>
          {
            user ?
              <span>User: {user.name}</span>
              : <span>Please login</span>
          }
        <h1>Mobile phone shop</h1>
      </header>
      <Routes>
        <Route path='/' element={
          <Main products={products} 
            setProducts={setProducts} 
            user={user} 
            setCount={setCount}
            />
        } />
        <Route path='/cart' element={
          <Cart products={products}
            carts={carts}
            count={count}
            setCarts={setCarts}
            user={user} />
        } />
        <Route path='/login' element={
          <Login />
        } />
        <Route path='/create' element={
          <NewProduct />
        } />
      </Routes>
    </>
  );
}

export default App;
