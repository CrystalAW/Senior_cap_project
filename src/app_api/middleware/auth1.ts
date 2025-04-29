// import { NextFunction, Request, Response } from "express";
// import jwt from "jsonwebtoken";

// export const auth = (req: Request, res: Response, next: NextFunction) => {
//     const token = req.headers.authorization;
//     if(token) {
//         jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
//             if (err) {
//                 return res.status(401).json({message: 'Unauthorized'});
//             } else {
//                 req.user = decoded;
//                 next();
//             }
//         });
//     } else {
//         res.status(401).json({message: 'Unauthorized'});
//     }
// }