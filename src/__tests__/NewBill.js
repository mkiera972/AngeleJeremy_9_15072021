import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"
import userEvent from '@testing-library/user-event'
import BillsUI from '../views/BillsUI';

beforeEach(() => {
  document.body.innerHTML = NewBillUI()
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))
})

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill page", () => {

    test("Then I should see new bill form", () => {
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })
  
    describe('When I submit new bill form', () => {
      test("Then form is sent and I should be redirected to Bills page", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        const inputData = {
          "id": "47qAXb6fIm2zOKkLzMro",
          "vat": "80",
          "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          "status": "pending",
          "type": "Hôtel et logement",
          "commentary": "séminaire billed",
          "name": "encore",
          "fileName": "preview-facture-free-201801-pdf-1.jpg",
          "date": "2004-04-05",
          "amount": 400,
          "commentAdmin": "ok",
          "email": "a@a",
          "pct": 20
        }
        
        const dateForm = screen.getByTestId("datepicker")
        fireEvent.change(dateForm, { target: { value: inputData.date } })

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const firebase = jest.fn();

        const newBill = new NewBill({
          document, onNavigate, firebase, localStorage: window.localStorage
        }) 
        const form = screen.getByTestId("form-new-bill")
        const handleSubmit = jest.fn(newBill.handleSubmit)    
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()
        expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
        //to-do write assertion
      })
    })


    describe("When I am on NewBill Page and i add a new bill with with an pdf", () => {
      test("then file type is valid", () => {
        const html = NewBillUI()
        document.body.innerHTML = html
  
        const snapshot = {
          ref: {
            getDownloadURL: () => 'https://url.test'
          }
        }
        class Storage {
          ref() { return this }
          async put() { return snapshot }
        }
        
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        const newBill = new NewBill({
          document, onNavigate, firestore: {storage: new Storage()}, localStorage: window.localStorage
        }) 
  
        const file = new File(['file'], 'file.png', { type: 'image/png' })
        const fileInput = screen.getByTestId("file")
  
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
    
        fileInput.addEventListener('change', handleChangeFile)
  
        userEvent.upload(fileInput, file)
        expect(handleChangeFile).toHaveBeenCalled()
  
  
      })
    })
    //cas file ko
    describe("When I am on NewBill Page and i add a new bill with with an pdf", () => {
      test("then file type is invalid", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        const newBill = new NewBill({
          document, onNavigate, firestore: null, localStorage: window.localStorage
        }) 
  
        const file = new File(['file'], 'file.pdf', { type: 'application/pdf' })
  
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
    
        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener('change', handleChangeFile)
  
        userEvent.upload(fileInput, file)
        expect(handleChangeFile).toHaveBeenCalled()
      })
    })

    // test d'intégration POST
    describe("Given I am a user connected as Admin", () => {
      describe("When I navigate to Dashboard", () => {
        test("fetches bills from mock API POST", async () => {
            const newBill = {
              'id': 'qcCK3SzECmaZAGRrHja7',
              'status': 'pending',
              'pct': 20,
              'amount': 200,
              'email': 'a@a',
              'name': 'testPOST',
              'vat': '40',
              'fileName': 'preview-facture-free-201801-pdf-1.jpg',
              'date': '2002-02-02',
              'commentAdmin': '',
              'commentary': 'test2',
              'type': 'Restaurants et bars',
              'fileUrl': 'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732'
            }
            const getSpy = jest.spyOn(firebase, "post")
            const bills = await firebase.post(newBill)
            
            expect(getSpy).toHaveBeenCalledTimes(1)
            expect(bills.data.length).toBe(1)
        })
        test("fetches bills from an API and fails with 404 message error", async () => {
          firebase.post.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 404"))
          )
          const html = BillsUI({ error: "Erreur 404" })
          document.body.innerHTML = html
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })
        test("fetches messages from an API and fails with 500 message error", async () => {
          firebase.post.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 500"))
          )
          const html = BillsUI({ error: "Erreur 500" })
          document.body.innerHTML = html
          const message = await screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
      })
    })

  })
})

