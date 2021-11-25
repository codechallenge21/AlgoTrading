// Imports
import { atom } from 'recoil'

// App imports
import { setUserAuth } from './JWTAuth'

const userAuthDefault = {
  isAuth: false,
  user: null
}

// on page load
// try to get user token and details from localStorage
const token = window.localStorage.getItem('access_token')
if (token && token !== 'undefined' && token !== '') {
  const user = JSON.parse(window.localStorage.getItem('user'))

  if (user) {
    setUserAuth(token, user)

    userAuthDefault.isAuth = true
    userAuthDefault.user = user
  }
}

// auth
export const userAuth = atom({
  key: 'userAuth',
  default: userAuthDefault
})
