import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const createSchema = Joi.object({
  admin_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const addValidation = (req: Request, res: Response, next: NextFunction) => {
  const validate = createSchema.validate(req.body);
  if (validate.error) {
    return res.status(400).json({
      message: validate.error.details.map((it) => it.message).join(", "),
    });
  }
  next();
};

const updateSchema = Joi.object({
  admin_name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).optional(),
});

const updateValidation = (req: Request, res: Response, next: NextFunction) => {
  const validate = updateSchema.validate(req.body, { abortEarly: false }); // To get all errors
  if (validate.error) {
    return res.status(400).json({
      message: validate.error.details.map((it) => it.message).join(", "),
    });
  }
  next();
};

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const authValidation = (req: Request, res: Response, next: NextFunction) => {
  const validate = authSchema.validate(req.body); // To get all errors
  if (validate.error) {
    return res.status(400).json({
      message: validate.error.details.map((it) => it.message).join(", "),
    });
  }
  next();
};

export { addValidation, updateValidation, authValidation}
