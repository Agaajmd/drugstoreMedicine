import { Router } from "express";
import { addAdmin, authentication, deleteAdmin, findAdmin, readAdmin, updateAdmin } from "../controller/adminController";
import { addValidation, authValidation, updateValidation } from "../middleware/adminValidation";
import { verifyToken } from "../middleware/authorization";

const router = Router()

router.post(`/`, [verifyToken,addValidation],  addAdmin)
router.get(`/`,[verifyToken], readAdmin)
router.get(`/findAdmin`,[verifyToken], findAdmin)
router.put(`/:id`, [verifyToken,updateValidation], updateAdmin)
router.delete(`/:id`,[verifyToken], deleteAdmin)
router.post(`/auth`,[verifyToken,authValidation], authentication)

export default router