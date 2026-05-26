import { dataAccess } from '../data'
import ExampleService from './exampleService'

export const services = () => {
  const { applicationInfo} = dataAccess()

  return {
    applicationInfo,
    exampleService: new ExampleService(),
  }
}

export type Services = ReturnType<typeof services>
