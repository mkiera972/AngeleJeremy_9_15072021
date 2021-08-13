import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import billsboard from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"

const dataTest = [{
  "id": "47qAXb6fIm2zOKkLzMro",
  "vat": "80",
  "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  "status": "pending",
  "type": "Hôtel et logement",
  "commentary": "séminaire billed",
  "name": "encore",
  "fileName": "preview-facture-free-201801-pdf-1.jpg",
  "date": "2004-04-04",
  "amount": 400,
  "commentAdmin": "ok",
  "email": "a@a",
  "pct": 20
}];

const firestore = jest.mock('../app/Firestore')

firestore.bills = () => ({bills, get: jest.fn().mockResolvedValue({data : dataTest})})

const billsData = bills;
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

describe("Given I am connected as an employee", () => {
  describe('When I am on Dashboard page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })


  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = BillsUI({ loading: false, error : true })
      document.body.innerHTML = html
  
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const classBillsboard = new billsboard({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      }) 
      //console.log("ko")

      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  
  describe("When I am on Bills Page", () => {
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const classBillsboard = new billsboard({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      }) 
  
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe('When I click on the icon eye of an bill', () => {
    test('A modal should open', () => {
  
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const html = BillsUI({ data: bills })

      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const classBillsboard = new billsboard({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      }) 

      $.fn.modal = jest.fn();

      const eye = screen.getAllByTestId('icon-eye')
      console.log(eye[1])
      const handleClickIconEye = jest.fn(classBillsboard.handleClickIconEye(eye[1]))
      eye[1].addEventListener('click', handleClickIconEye)
      userEvent.click(eye[1])
      expect(handleClickIconEye).toHaveBeenCalled()
      
      const modale = screen.getByTestId('modaleFileTesting')
      expect(modale).toBeTruthy()
    })
  })

  describe('when I click on a new bill', () => {
    test('Then, New bill page should be rendered', () => {
      const html = BillsUI({ data: bills })
  
      document.body.innerHTML = html;
  
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      const classBillsboard = new billsboard({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      }) 
  
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn(classBillsboard.handleClickNewBill());
      buttonNewBill.addEventListener('click', handleClickNewBill);
      userEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
      
  
    })
  })


  describe('test', () => {
    test('Then, New bill page should be rendered', () => {
      const html = BillsUI({ data: bills })
  
      document.body.innerHTML = html;

        
      const snapshot = {
        docs: billsData
      }
      class Bills {
        bills = jest.fn()
        async get() { return snapshot }
      }
  
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      const classBillsboard = new billsboard({
        document, onNavigate, firestore: firestore, localStorage: window.localStorage
      }) 
      const getBills = jest.fn(classBillsboard.getBills());

      /*const getBills = jest.fn(async () => {
        let test = await classBillsboard.getBills()
        console.log(test)
        //expect(newBillContainer.fileUrl).toBe(snapshot.ref.getDownloadURL())
        //expect(newBillContainer.fileName).toBe(file.name)
        done()
      })*/
      //console.log(getBills)
      //getBills();
      //expect(getBills).toHaveBeenCalled();
      
  
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})