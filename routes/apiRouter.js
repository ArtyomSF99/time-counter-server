const { Router } = require('express')
const router = new Router()
const apiController = require('../controller/apiController')

router.post('/company/regstration', apiController.createCompany)
router.post('/company/login', apiController.companyLogin)
router.put('/company', apiController.changeCompany)
router.delete('/company', apiController.deleteCompany)

router.get('/company-roles', apiController.getCompanyRoles)
router.post('/company-roles', apiController.createCompanyRole)
router.put('/company-roles', apiController.changeCompanyRole)
router.delete('/company-roles', apiController.deleteCompanyRole)

router.post('/company-workers', apiController.createCompanyWorker)
router.post('/company-worker/login', apiController.companyWorkerLogin)
router.get('/company-worker/code', apiController.getCompanyWorkerCode)
router.get('/company-workers', apiController.getCompanyWorkers)
router.get('/company-worker', apiController.getCompanyWorker)
router.put('/company-workers', apiController.changeCompanyWorker)
router.delete('/company-workers', apiController.deleteCompanyWorker)

router.post('/company-workers-start', apiController.startWorking)
router.put('/company-workers-end', apiController.endWorking)
router.get('/company-workers-hours', apiController.getWorkersHours)
router.get('/company-worker-hours', apiController.getWorkerHours)



module.exports = router