// @ts-check
import React, { useEffect, useState } from 'react';
import styles from './App.module.css';

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
  useEffect(() => {
    fetch('http://localhost:4000/products')
      .then((res) => {
        if (!res.ok) throw new Error('Wrong products')
        return res.json()
      })
      .then((products) => {
        setProducts(products)
      })
      .catch(err => console.error(err))
  }, [])
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:4000/users/${user.id}/carts?_sort=productId`)
        .then((res) => {
          if (!res.ok) throw new Error('Wrong cart')
          return res.json()
        })
        .then((carts) => {
          setCarts(carts)
        })
        .catch(err => console.error(err))
    }
  }, [user, count])
  return (
    <div>
      <header>
        <nav>
          {
            user ?
              <span>User: {user.name}</span>
              : <span>Please login</span>
          }
        </nav>
        <h1>Mobile phone shop</h1>
      </header>
      <section>
        <h3>Products:</h3>
        <ul>
          {
            products.map((product) => {
              return <li key={product.id}>
                {product.name}: {product.price}
                <button onClick={() => {
                  fetch('http://localhost:4000/carts', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      userId: user.id,
                      productId: product.id,
                      quantity: 1
                    })
                  }).then(() => {
                    setCount((prevCount) => prevCount + 1)
                  })
                }}>
                  Add to cart
                </button>
              </li>
            })
          }
        </ul>
      </section>
      <section>
        <h3>Cart:</h3>
        <ul>
          {
            carts.reduce((acc, cart) => {
              const product = products.find((product) => {
                return product.id === cart.productId
              })
              if (cart.productId !== acc.slice(-1)[0]?.productId) return [...acc, {
                name: product.name,
                quantity: cart.quantity,
                price: product.price,
                productId: product.id
              }]
              if (acc.length) acc.slice(-1)[0].quantity++
              return acc
            }, []).map((cart) => {
              return <li key={cart.name}>
                {cart.name}: {cart.quantity} : {cart.price}
              </li>
            })
          }
        </ul>
      </section>
    </div>
  );
}

export default App;
