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
    })

    describe('getTestApiData', ()=>{
        it('should return a json object with value name equals test-name', async () => {

            //mock data
            nock(config.apis.yjbApi.url)
            .get('/test-api')
            .reply(200, {"name": "test-name"})

            const response = await yjbApiClient.getTestApiData();
            expect(response).toEqual({"name": "test-name"})
        })
    });

})
