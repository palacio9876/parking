require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')

const sequelize = require('./config/db')
require('./models')
const { errorHandler } = require('./middlewares/errorHandler')

const app = express()

const isPackaged = !!process.pkg
const basePath   = isPackaged ? path.dirname(process.execPath) : path.join(__dirname, '..')
const publicDir  = path.join(basePath, 'public')

app.use(cors())
app.use(express.json())
app.use(express.static(publicDir))

app.use('/api/auth',      require('./routes/auth'))
app.use('/api/vehicles',  require('./routes/vehicles'))
app.use('/api/movements', require('./routes/movements'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/companies', require('./routes/companies'))
app.use('/api/rates',     require('./routes/rates'))
app.use('/api/payments',  require('./routes/payments'))
app.use('/api/users',     require('./routes/users'))
app.use('/api/reports',   require('./routes/reports'))
app.use('/api/shifts',    require('./routes/shifts'))

app.get('/',                (req, res) => res.sendFile(path.join(publicDir, 'index.html')))
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(publicDir, 'admin/dashboard.html')))
app.get('/admin/vehicles',  (req, res) => res.sendFile(path.join(publicDir, 'admin/vehicles.html')))
app.get('/admin/users',     (req, res) => res.sendFile(path.join(publicDir, 'admin/users.html')))
app.get('/admin/reports',   (req, res) => res.sendFile(path.join(publicDir, 'admin/reports.html')))
app.get('/admin/rates',     (req, res) => res.sendFile(path.join(publicDir, 'admin/rates.html')))
app.get('/admin/settings',  (req, res) => res.sendFile(path.join(publicDir, 'admin/settings.html')))
app.get('/admin/entry-exit',(req, res) => res.sendFile(path.join(publicDir, 'admin/entry-exit.html')))
app.get('/operator/dashboard',(req, res) => res.sendFile(path.join(publicDir, 'admin/dashboard.html')))
app.get('/operator/entry-exit',(req, res) => res.sendFile(path.join(publicDir, 'admin/entry-exit.html')))
app.get('/operator/vehicles', (req, res) => res.sendFile(path.join(publicDir, 'admin/vehicles.html')))

// Rutas operator (con y sin .html para compatibilidad)
app.get('/operator/dashboard',        (req, res) => res.sendFile(path.join(publicDir, 'admin/dashboard.html')))
app.get('/operator/dashboard.html',   (req, res) => res.sendFile(path.join(publicDir, 'admin/dashboard.html')))
app.get('/operator/vehicles',         (req, res) => res.sendFile(path.join(publicDir, 'admin/vehicles.html')))
app.get('/operator/vehicles.html',    (req, res) => res.sendFile(path.join(publicDir, 'admin/vehicles.html')))
app.get('/operator/entry-exit',       (req, res) => res.sendFile(path.join(publicDir, 'admin/entry-exit.html')))
app.get('/operator/entry-exit.html',  (req, res) => res.sendFile(path.join(publicDir, 'admin/entry-exit.html')))
app.get('/operator/ingreso-salida',   (req, res) => res.sendFile(path.join(publicDir, 'admin/entry-exit.html')))

app.use((req, res) => res.status(404).sendFile(path.join(publicDir, '404.html')))
app.use(errorHandler)

const PORT = process.env.PORT || 3000

sequelize.authenticate()
  .then(() => {
    console.log('✓ MySQL connection established')
    app.listen(PORT, () => console.log(`✓ Server running on :${PORT}`))
  })
  .catch(err => {
    console.error('✗ DB connection error:', err.message)
    process.exit(1)
  })