import { dataAccess } from '../data'
import ExampleService from './exampleService'
import YjbApiClient from '../data/yjbApi'

export const services = () => {
  const { applicationInfo } = dataAccess()

  return {
    applicationInfo,
    exampleService: new ExampleService(),
    yjbApiClient: new YjbApiClient(),
  }
}

export type Services = ReturnType<typeof services>
