import { dataAccess } from '../data'
import ExampleService from './exampleService'
import YjbApiClient from '../data/yjbApi'
import DtoService from './dtoService'

export const services = () => {
  const { applicationInfo, yjbApiClient } = dataAccess()

  return {
    applicationInfo,
    exampleService: new ExampleService(),
    dtoService: new DtoService(yjbApiClient),
    yjbApiClient: new YjbApiClient(),
  }
}

export type Services = ReturnType<typeof services>
