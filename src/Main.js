import React, { useEffect } from "react"

// @ts-check
export default function Main({ products, setProducts, user }) {
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
  return (
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
  )
}