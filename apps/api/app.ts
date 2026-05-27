import express, {Application} from 'express'
import routes from './routes'

export default function createApp(): Application{
    const app = express();
    app.use(routes());
    app.set('port', process.env.PORT || 3001);

    return app;
}