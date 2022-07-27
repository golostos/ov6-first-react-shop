// @ts-check
import React, { useEffect } from "react"

export default function Cart({ carts, products, user, setCarts, count }) {
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
  )
}