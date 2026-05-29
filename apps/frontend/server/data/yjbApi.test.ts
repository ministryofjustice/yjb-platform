import nock from 'nock'
import YjbApiClient from './yjbApi'
import config from '../config'

describe('ExampleApiClient', () => {
    let yjbApiClient: YjbApiClient;

    beforeEach(() => {
        yjbApiClient = new YjbApiClient();
    })

    afterEach(() => {
        nock.cleanAll()
        jest.resetAllMocks()
    })

    describe('getTestApiData', ()=>{
        it('should return a valid json object', async () => {

            //mock data
            nock(config.apis.yjbApi.url)
            .get('/test-api')
            .reply(200, {"name": "test-name"})

            const response = await yjbApiClient.getTestApiData();
            expect(response).toEqual({"name": "test-name"})
        })
    });
//   let exampleApiClient: ExampleApiClient
//   let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

//   beforeEach(() => {
//     mockAuthenticationClient = {
//       getToken: jest.fn().mockResolvedValue('test-system-token'),
//     } as unknown as jest.Mocked<AuthenticationClient>

//     exampleApiClient = new ExampleApiClient(mockAuthenticationClient)
//   })

//   afterEach(() => {
//     nock.cleanAll()
//     jest.resetAllMocks()
//   })

//   describe('getCurrentTime', () => {
//     it('should make a GET request to /example/time using system token and return the response body', async () => {
//       nock(config.apis.exampleApi.url)
//         .get('/example/time')
//         .matchHeader('authorization', 'Bearer test-system-token')
//         .reply(200, { time: '2025-01-01T12:00:00Z' })

//       const response = await exampleApiClient.getCurrentTime()

//       expect(response).toEqual({ time: '2025-01-01T12:00:00Z' })
//       expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
//     })
//   })
})
