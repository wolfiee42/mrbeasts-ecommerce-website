import axios from "axios";
import { Request, Response, NextFunction } from "express";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.headers['authorization']) {
            return res.status(401).json({ message: "unauthorized" })
        }

        const token = req.headers['authorization'].split(' ')[1];

        const { data } = await axios.post('http://localhost:4003/verify-token', {
            accessToken: token,
            headers: {
                ip: req.ip,
                'user-agent': req.headers['user-agent'],
            }
        })

        req.headers['x-user-id'] = data.user.id;
        req.headers['x-user-name'] = data.user.name;
        req.headers['x-user-email'] = data.user.email;
        req.headers['x-user-role'] = data.user.role;

        next();

    } catch (error) {
        console.log("[auth middleware]: ", error)
        return res.status(401).json({ message: "unauthorized" })
    }

}


const middlewares = { auth }

export default middlewares;