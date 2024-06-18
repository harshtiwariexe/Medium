import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode , sign , verify } from 'hono/jwt'
import { use } from 'hono/jsx'

import { signInInput, signUpInput } from 'harsh-medium-common'



const user = new Hono<{
	Bindings:{
		DATABASE_URL:string	,
		JWT_SECRET:string
	}
}>().basePath('/user')

user.post('/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
	const body = await c.req.json();
	const {success} = signUpInput.safeParse(body)
	if(!success){
		c.status(403)
		return c.json("Invalid credentials")
	}
	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password
			}
		});
		const token =await sign({id:user.id},c.env.JWT_SECRET)

	
		return c.json({
			jwt:token
		})
	} catch(e) {
		return c.status(403);
	}
})

user.post('/signin',async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
	const body = await c.req.json();
	const {success} = signInInput.safeParse(body)
	if(!success){
		c.status(403)
		return c.json("Invalid credentials")
	}
	const user = await prisma.user.findUnique({
		where:{
			email:body.email,
			password:body.password
		}
	})
	if(!user) {
		c.status(403)
		return c.json({
			error:"User not found"
		})
	}
	const jwt = await 	sign({id:user.id},c.env.JWT_SECRET)
	return c.json({jwt})
}) // POST /user

export default user