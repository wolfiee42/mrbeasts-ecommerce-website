import { Express, Request, Response } from "express";
import config from "./config.json";
import axios, { AxiosError } from "axios";


const createHandler = (
    hostname: string,
    path: string,
    method: string
) => {
    return async (req: Request, res: Response) => {
        try {

            let url = `${hostname}${path}`;

            req.params &&
                Object.keys(req.params).forEach((param) => {
                    url = url.replace(`:${param}`, req.params[param])
                })

            const { data } = await axios({
                method,
                url,
                data: req.body,
            });

            res.json(data);

        } catch (error) {
            if (error instanceof AxiosError) {
                return res
                    .status(error.response?.status || 500)
                    .json({ message: error.response?.data.message });
            }
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export const configureRoutes = (app: Express) => {
    Object.entries(config.services).forEach(([_name, service]) => {
        const hostname = service.url;
        service.routes.forEach((route) => {
            route.methods.forEach((method) => {
                const handler = createHandler(hostname, route.path, method);
                const endpoint = `/api${route.path}`;
                app[method](endpoint, handler);
            });
        });
    });
}