import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import billsboard from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe('When I am on Dashboard page but it is loading', () => {
  test('Then, Loading page should be rendered', () => {
    const html = BillsUI({ loading: true })
    document.body.innerHTML = html
    expect(screen.getAllByText('Loading...')).toBeTruthy()
  })
})

describe('When I\'m on the dashboard page but it loads with an error', () => {
  test('Then, Error page should be rendered', () => {
    const html = BillsUI({ loading: false, error : true })
    document.body.innerHTML = html
    expect(screen.getAllByText('Erreur')).toBeTruthy()
  })
})

describe('when I click on a new bill', () => {
  test('Then, Error page should be rendered', () => {
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
  })
})

describe('Given I am connected as an employee and I am on Bills page', () => {
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
      
      const eye = screen.getAllByTestId('icon-eye')
      const handleClickIconEye = jest.fn(classBillsboard.handleClickIconEye(eye[1]))
      eye[1].addEventListener('click', handleClickIconEye)
      userEvent.click(eye[1])
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = screen.getByTestId('modaleFileTesting')
      expect(modale).toBeTruthy()
    })
  })
})