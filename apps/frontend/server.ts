import app from './server/index'

app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${app.get('port')}`)
})
