// Imports
import { atom } from 'recoil'

// App imports
import { setUserAuth } from './JWTAuth'

const userAuthDefault = {
  isAuth: false,
  user: null
}

const token = window.localStorage.getItem('token')
if (token && token !== 'undefined' && token !== '') {
  const user = JSON.parse(window.localStorage.getItem('user'))
  if (user) {
    setUserAuth(token, user)
    userAuthDefault.isAuth = true
    userAuthDefault.user = user
    // LoadScripts(user.id);
  }
}

// auth
export const userAuth = atom({
  key: 'userAuth',
  default: userAuthDefault
})

// export const userScripts = selector({
//   key: 'userScripts',
//   get: async ({get}) => {
//     const response = await load_scripts({
//       userID: get(userAuth).user.id,
//     });
//     return response;
//   }
// });
