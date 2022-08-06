import { Button, TextField, Typography, Card, styled } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const StyledForm = styled('form')(({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing(2)};
`)

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()
  return (
    <>
      <Card sx={{
        mx: 'auto',
        width: 400,
        padding: 2
      }}>
        <Typography variant='h3'
          component='h2'
          sx={{
            textAlign: 'center',
            my: 2
          }}
        >
          Login
        </Typography>
        <StyledForm onSubmit={async (event) => {
          event.preventDefault()          
          const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email,
              password
            })
          })
          if (res.ok) {
            const token = (await res.json()).token
            if (token) localStorage.setItem('token', token)
            nav('/')
          }
        }}>
          <TextField label='Email' 
            type='email' 
            name='email'
            value={email}
            onChange={e => setEmail(e.target.value)} />
          <TextField label='Password' 
            type='password' 
            name='password'
            value={password}
            onChange={e => setPassword(e.target.value)} />
          <Button variant='contained' type='submit'>Login</Button>
        </StyledForm>
      </Card>
    </>
  )
}

export default Login
