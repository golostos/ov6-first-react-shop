// @ts-check
import React, { useState } from 'react'
import { Button, TextField, Typography, Card, styled } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const StyledForm = styled('form')(({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing(2)};
`)

const NewProduct = () => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const nav = useNavigate()
  return (
    <>
      <Card sx={(theme) => ({
        mx: 'auto',
        width: 400,
        padding: theme.spacing(2)
      })}>
        <Typography variant='h3'
          component='h2'
          sx={{
            textAlign: 'center',
            my: 2
          }}
        >
          Create new product
        </Typography>
        <StyledForm onSubmit={async (event) => {
          event.preventDefault()
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({
              name,
              price: parseInt(price)
            })
          })
          if (res.ok) {
            nav('/')
          }
        }}>
          <TextField label='Name'
            type='text'
            name='name'
            value={name}
            onChange={e => setName(e.target.value)} />
          <TextField label='Price'
            type='text'
            name='price'
            value={price}
            onChange={e => setPrice(e.target.value)} />
          <Button variant='contained' type='submit'>Create</Button>
        </StyledForm>
      </Card>
    </>
  )
}

export default NewProduct
