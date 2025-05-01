import SessionManager from '../Authentication/SessionManager.js'
import ContactManager from './ContactManager.js'
import UserGetter from '../User/UserGetter.js'
import Modules from '../../infrastructure/Modules.js'
import { expressify } from '@overleaf/promise-utils'

function _formatContact(contact) {
  return {
    id: contact._id?.toString(),
    email: contact.email || '',
    first_name: contact.first_name || '',
    last_name: contact.last_name || '',
    type: 'user',
  }
}

async function getContacts(req, res) {
  const userId = SessionManager.getLoggedInUserId(req.session)

  // const contactIds = await ContactManager.promises.getContactIds(userId, {
  //   limit: 50,
  // })

  // let contacts = await UserGetter.promises.getUsers(contactIds, {
  //   email: 1,
  //   first_name: 1,
  //   last_name: 1,
  //   holdingAccount: 1,
  // })


  // Try not using contact manager instead

  let contacts = await UserGetter.promises.getUsers({}, {
    email: 1,
    first_name: 1,
    last_name: 1,
    holdingAccount: 1,
  })



  // UserGetter.getUsers may not preserve order so put them back in order
  const positions = {}
  for (let i = 0; i < contactIds.length; i++) {
    const contactId = contactIds[i]
    positions[contactId] = i
  }
  contacts.sort(
    (a, b) => positions[a._id?.toString()] - positions[b._id?.toString()]
  )

  // Don't count holding accounts to discourage users from repeating mistakes (mistyped or wrong emails, etc)
  contacts = contacts.filter(c => !c.holdingAccount)

  contacts = contacts.map(_formatContact)

  const additionalContacts = await Modules.promises.hooks.fire(
    'getContacts',
    userId,
    contacts
  )

  contacts = contacts.concat(...(additionalContacts || []))
  return res.json({
    contacts,
  })
}

export default {
  getContacts: expressify(getContacts),
}

// import SessionManager from '../Authentication/SessionManager.js'
// import ContactManager from './ContactManager.js'
// import UserGetter from '../User/UserGetter.js'
// import Modules from '../../infrastructure/Modules.js'
// import { expressify } from '@overleaf/promise-utils'

// function _formatContact(contact) {
//   return {
//     id: contact._id?.toString(),
//     email: contact.email || '',
//     first_name: contact.first_name || '',
//     last_name: contact.last_name || '',
//     type: 'user',
//   }
// }

// async function getContacts(req, res) {
//   const userId = SessionManager.getLoggedInUserId(req.session)


//   let contacts = await UserGetter.promises.getUsers({}, {
//     email: 1,
//     first_name: 1,
//     last_name: 1,
//     holdingAccount: 1,
//   })

//   // Filter out holding accounts (if desired)
//   contacts = contacts.filter(c => !c.holdingAccount)

//   // Format contacts for the frontend
//   contacts = contacts.map(_formatContact)

//   // Optionally, add additional contacts via hooks (if any are registered)
//   const additionalContacts = await Modules.promises.hooks.fire(
//     'getContacts',
//     userId,
//     contacts
//   )
//   if (additionalContacts) {
//     contacts = contacts.concat(...additionalContacts)
//   }

//   return res.json({ contacts })
// }

// export default {
//   getContacts: expressify(getContacts),
// }
