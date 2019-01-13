/*
 * Poggit-Delta
 *
 * Copyright (C) 2018-2019 Poggit
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as csurf from "csurf"
import {NextFunction, Request, RequestHandler, Response, Router} from "express"
import * as request from "request-promise-native"
import {PoggitError} from "../../shared/PoggitError"
import {parseUrlEncoded} from "../../shared/util"
import {LogoutRenderParam} from "../../view/session/logout.view"
import {app} from "../index"
import {RouteHandler} from "../router"
import {promisify} from "../router/promisify"
import {secrets} from "../secrets"

export const SESSION_TIMEOUT = 3600 * 1000
export const SESSION_COOKIE_NAME = "PgdSes"

const loginCsrf = csurf({
	cookie: true,
	ignoreMethods: [],
	value: req => req.query.state,
})


export function route(){
	const router = Router()
	router.get("/", loginCsrf, promisify(loginCallback))
	router.use(((err: any, req: Request, res: Response, next: NextFunction) => {
		if(typeof err === "object" && err.code === "EBadCsrfToken".toUpperCase()){
			promisify(loginRequest)(req, res, next)
			return
		}
		next(err)
	}) as unknown as RequestHandler)
	app.use("/login", router)

	app.get("/logout", promisify(logoutRequest))
	app.post("/logout", promisify(logoutCallback))
}

const loginRequest: RouteHandler = async(req, res) => {
	res.redirectParams("https://github.com/login/oauth/authorize", {
		client_id: secrets.github.oauth.clientId,
		state: req.csrfToken(),
	})
}

const loginCallback: RouteHandler = async(req, res) => {
	const response = await request.post("https://github.com/login/oauth/access_token", {
		form: {
			client_id: secrets.github.oauth.clientId,
			client_secret: secrets.github.oauth.clientSecret,
			code: req.query.code,
			state: req.query.state,
		},
	})
	const {access_token} = parseUrlEncoded(response) as {access_token: string; scope: ""; token_type: "bearer"}

	await req.session.login(access_token)
	res.redirect("/")
}

const logoutRequest: RouteHandler = async(req, res) => {
	if(!req.session.loggedIn){
		throw PoggitError.friendly("AlreadyLoggedOut", "You were not logged in")
	}

	await res.mux({
		html: () => ({
			name: "session/logout",
			param: {
				meta: {
					title: "Confirm logout",
					description: "Confirm that you want to logout"
				}
			} as LogoutRenderParam
		})
	})
}

const logoutCallback: RouteHandler = async(req, res) => {
	await req.session.logout()
	res.redirect("/")
}
