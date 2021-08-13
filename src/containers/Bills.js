import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus, checkDateFormat } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill){ buttonNewBill.addEventListener('click', this.handleClickNewBill)}else{}
    
    
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if(iconEye.length > 0){ 
      iconEye.forEach(icon => {
      icon.addEventListener('click', (e) => this.handleClickIconEye(icon))
    })}else{
    }
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = e => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} /></div>`)
    $('#modaleFile').modal('show')
  }


  // not need to cover this function by tests
  getBills = () => {
    const userEmail = localStorage.getItem('user') ?
      JSON.parse(localStorage.getItem('user')).email : ""
      console.log('userEmail',JSON.parse(localStorage.getItem('user')).email)
      console.log(this.firestore.bills)
    if (this.firestore) {
      return this.firestore
      .bills()
      .get()
      .then(snapshot => {
        const bills = snapshot.docs
          .map(doc => {
            if(checkDateFormat(doc.data().date)){
              return {
                ...doc.data(),
                date: doc.data().date,
                status: formatStatus(doc.data().status)
              }
            }else{
              return {}
            }
              
          })
          .filter(bill => bill.email === userEmail)
          console.log('length', bills.length)
        return bills
      })
      .catch(error => error)
    }
  }
}
