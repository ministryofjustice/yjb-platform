import app from './server/index'

app.listen(app.get('port'), () => {
  console.log(`Server listening on port ${app.get('port')}`)
})
