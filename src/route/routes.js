const express=require("express")
const router=express.Router()
const usercontroller=require("../Controller/userController")
// const walletController=require("../Controller/walletController")
const middleware=require("../middleWare/auth")


// /**
//  * @swagger
//  * /:
//  * get:
//  *    summary:testing api
//  *     description:rest apis
//  *      responses:
//  *          200:
//  */

// router.get("/",(req,res)=>{
//     res.send("hey how are you")
// })

// /**
//  * @swagger
//  * /route/registration:
//  *   post:
//  *     parameters:
//  *      - in: body
//  *        name: Usr
//  *        description: New userModel
//  *        schema:
//  *          type: object
//  *          properties:
//  *            name:
//  *              type: string
//  *            email:
//  *              type: string
//  *            phoneNumber:
//  *              type: string
//  *             password:
//  *               type:String
//  *     responses:
//  *       201:
//  *         description: Created
//  */
router.post("/registration",usercontroller.userDetails)


router.post("/login",usercontroller.loginUser)


// router.get("/user/:userId",middleware.authenticate,usercontroller.signout)

router.get("/logout",middleware.authenticate,usercontroller.logout)

router.post('/send-reset-password-email', usercontroller.sendUserPasswordResetEmail)

// router.post('/reset-password/:id/:token', usercontroller.userPasswordReset)
router.post('/reset-password', usercontroller.userPasswordReset)

router.post('/change-password',middleware.authenticate, usercontroller.changeUserPassword)


router.post('/verification',usercontroller.sentVerificationMail)
// router.post("/otp",usercontroller.otp)

router.post('/wallet',usercontroller.updatewallet)

// router.post('/wallet',usercontroller.updatewallet)

router.post('/private',usercontroller.getUserAddressPrivateKey)


// router.post('/generateMnemonic', walletController.generateMnemonic)

module.exports=router